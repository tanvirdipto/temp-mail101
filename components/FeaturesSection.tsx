interface Feature {
  title: string;
  description: string;
}

const defaultFeatures: Feature[] = [
  { title: "Auto-Expiration", description: "Emails expire automatically after a set period with temp mail, ensuring your inbox is always clutter-free without any effort on your part." },
  { title: "Custom Domain Support", description: "Enhance your brand identity with custom domain for temp mail, allowing create temporary emails using your own domain name." },
  { title: "Email Forwarding", description: "Automatically forward your temp email to primary email inbox, ensuring you never miss important messages while using our service." },
  { title: "Instant Setup", description: "No lengthy sign-up processes. Generate a temp mail address with a single click and start using it immediately." },
  { title: "Privacy Protection", description: "Your personal email stays secure and out of reach from spam and phishing attacks. We ensure your data is safe with temp mail." },
  { title: "Save for Later", description: "Not just for temporary use. You have the option to save your temp mail to your account for long-term use, making it versatile." },
];

const icons = [
  <svg key="0" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 3H21" stroke="#334155" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 21L22.5 16.5" stroke="#334155" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 33C24.6274 33 30 27.6274 30 21C30 14.3726 24.6274 9 18 9C11.3726 9 6 14.3726 6 21C6 27.6274 11.3726 33 18 33Z" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  <svg key="1" className="w-9 h-9" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
  <svg key="2" className="w-9 h-9" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" /></svg>,
  <svg key="3" className="w-9 h-9" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>,
  <svg key="4" className="w-9 h-9" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>,
  <svg key="5" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M28.5 31.5H7.5C6.70435 31.5 5.94129 31.1839 5.37868 30.6213C4.81607 30.0587 4.5 29.2956 4.5 28.5V7.5C4.5 6.70435 4.81607 5.94129 5.37868 5.37868C5.94129 4.81607 6.70435 4.5 7.5 4.5H24L31.5 12V28.5C31.5 29.2956 31.1839 30.0587 30.6213 30.6213C30.0587 31.1839 29.2956 31.5 28.5 31.5Z" stroke="#334155" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M25.5 31.5V19.5H10.5V31.5" stroke="#334155" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.5 4.5V12H22.5" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
];

interface FeaturesSectionProps {
  content?: Record<string, string>;
}

export default function FeaturesSection({ content }: FeaturesSectionProps) {
  const title = content?.title || "Why Choose TempMail.co";
  const subtitle = content?.subtitle || "Experience the power of our temporary email address service";

  let features = defaultFeatures;
  if (content?.items) {
    try { features = JSON.parse(content.items); } catch { /* use defaults */ }
  }

  return (
    <section id="features" className="bg-white mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <h2 className="font-bold text-3xl text-center">{title}</h2>
      <p className="text-base leading-8 text-center text-gray-600 mt-2">{subtitle}</p>
      <div className="w-full mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div key={f.title} className="p-8 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="w-9 h-9 mb-5 text-slate-700">{icons[i % icons.length]}</div>
            <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
