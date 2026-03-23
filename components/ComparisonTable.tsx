const CheckIcon = () => (
  <svg className="text-green-500 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path clipRule="evenodd" fillRule="evenodd" d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z" />
  </svg>
);

const XIcon = ({ color = "text-red-500" }: { color?: string }) => (
  <svg className={`${color} h-5 w-5`} fill="currentColor" viewBox="0 0 24 24">
    <path clipRule="evenodd" fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" />
  </svg>
);

interface Row {
  feature: string;
  us: string;
  them: string;
}

const defaultRows: Row[] = [
  { feature: "Save for Later", us: "Yes", them: "No" },
  { feature: "Custom Domain", us: "Yes", them: "No" },
  { feature: "Email Forwarding", us: "Yes", them: "No" },
  { feature: "No Ads", us: "Yes", them: "No" },
  { feature: "User Interface", us: "Simple and Effective", them: "Varies" },
  { feature: "Inbox Limit", us: "Unlimited", them: "Rarely Limited" },
  { feature: "Domain Limit", us: "Unlimited", them: "Not Applicable" },
  { feature: "Free Usage", us: "Yes", them: "Rarely Free" },
  { feature: "Long-Term Use", us: "Yes", them: "No" },
];

interface ComparisonTableProps {
  content?: Record<string, string>;
}

export default function ComparisonTable({ content }: ComparisonTableProps) {
  const title = content?.title || "Experience More With Less";
  const subtitle = content?.subtitle || "Maximize Your Impact: More Experience, Less Cost with Temp Mail";

  let rows = defaultRows;
  if (content?.rows) {
    try { rows = JSON.parse(content.rows); } catch { /* use defaults */ }
  }

  return (
    <section className="bg-white mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <h2 className="font-bold text-3xl text-center">{title}</h2>
      <p className="text-base leading-8 text-center text-gray-600 mt-2">{subtitle}</p>
      <div className="w-full overflow-x-auto mt-12">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Features</th>
              <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                Tempmail.co<br /><span className="font-normal text-gray-500">(Our Provides)</span>
              </th>
              <th className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                Other Temporary Email Services<br /><span className="font-normal text-gray-500">(Their Provides)</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {rows.map((row) => {
              const themNegative = row.them === "No" || row.them === "Not Applicable";
              return (
                <tr key={row.feature}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{row.feature}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex justify-center items-center gap-2">
                      <CheckIcon />
                      <span className="text-gray-900">{row.us}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex justify-center items-center gap-2">
                      <XIcon color={themNegative ? "text-red-500" : "text-yellow-500"} />
                      <span className="text-gray-900">{row.them}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
