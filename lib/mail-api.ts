const API_BASE = "https://api.mail.tm";

export async function getActiveDomain(): Promise<string> {
  const res = await fetch(`${API_BASE}/domains`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch domains");
  const data = await res.json();
  const domains = data["hydra:member"] || data.member || data;
  const active = Array.isArray(domains)
    ? domains.find((d: { isActive: boolean }) => d.isActive)
    : null;
  if (!active) throw new Error("No active domain found");
  return active.domain;
}

export async function getAllDomains(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/domains`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch domains");
  const data = await res.json();
  const domains = data["hydra:member"] || data.member || data;
  if (!Array.isArray(domains)) return [];
  return domains
    .filter((d: { isActive: boolean }) => d.isActive)
    .map((d: { domain: string }) => d.domain);
}

function randomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createAccount(domain?: string): Promise<{
  address: string;
  token: string;
}> {
  const selectedDomain = domain || (await getActiveDomain());
  const username = randomString(10);
  const address = `${username}@${selectedDomain}`;
  const password = randomString(16);

  const createRes = await fetch(`${API_BASE}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create account: ${err}`);
  }

  const tokenRes = await fetch(`${API_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Failed to get token: ${err}`);
  }
  const tokenData = await tokenRes.json();

  return { address, token: tokenData.token };
}

export async function getMessages(token: string) {
  const res = await fetch(`${API_BASE}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch messages");
  const data = await res.json();
  return data["hydra:member"] || data.member || data;
}

export async function getMessage(id: string, token: string) {
  const res = await fetch(`${API_BASE}/messages/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch message");
  return res.json();
}
