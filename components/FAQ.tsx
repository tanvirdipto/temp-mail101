"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

const defaultFaqs: FaqItem[] = [
  { q: "What is a temp mail address?", a: "A temp mail address is a disposable email account that allows you to receive emails without revealing your personal email address. It's perfect for sign-ups, verifications, and other temporary communications." },
  { q: "How long does a temp mail last?", a: "The lifespan of a temp mail address can vary. By default, our free temp mails last for 10 minutes. With our Pro plans, you can extend the lifespan and save emails for long-term use." },
  { q: "Can I use it for free?", a: "Yes, We offer a free plan that allows you to generate and use temp mail addresses. For additional features such as saving emails for long-term use, and custom domain support, we offer Pro plans." },
  { q: "Can I choose the domain for my temp mail?", a: "Yes, our service supports custom domains. This feature is available with our Pro plan, allowing you to create temp mails using your own domain name, enhancing your brand identity." },
  { q: "How do I access emails sent to my temporary address?", a: "Accessing emails sent to your temporary address is easy. Simply go to the home page, and your temporary inbox will automatically display any received emails. For users with an account, you can log in and access your saved temp mails from your dashboard." },
  { q: "Can I save my temp mail address for future use?", a: "Yes! With our Pro plans, you can save temp mails to your account, allowing you to access them whenever you need." },
  { q: "Is my temp mail address secure?", a: "Absolutely. Our service is designed with security in mind. We implement advanced security measures to protect your data and ensure your temp mail addresses are safe from breaches and hacks." },
  { q: "Can I use a temp mail address for important communications?", a: "While temp mails are great for quick sign-ups and verifications, we recommend using your primary email for important communications. However, with the ability to save emails in our Pro plans, you can keep track of important messages." },
  { q: "What happens to my emails after the temporary address expires?", a: "Once a temp mail address expires, all emails associated with it are automatically deleted. If you have a Pro plan, you can save important emails to your account before the expiration." },
  { q: "How can I restore a temporary email address I used before if it has expired?", a: "You can restore a previously used temporary email by following our step-by-step guide. If you need longer retention or to save addresses, upgrade to a Pro plan." },
  { q: "How can I get a free 1-year Premium membership?", a: "Follow our guide to get a free Premium membership. Availability and terms may change; see the article for the latest details." },
];

interface FAQProps {
  content?: Record<string, string>;
}

export default function FAQ({ content }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  let faqs = defaultFaqs;
  if (content?.items) {
    try { faqs = JSON.parse(content.items); } catch { /* use defaults */ }
  }

  return (
    <section id="faq" className="bg-white mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <h2 className="font-bold text-3xl text-center">Frequently Asked Questions</h2>
      <p className="text-base leading-8 text-center text-gray-600 mt-2">
        Detailed answers to your most frequently asked questions
      </p>
      <div className="w-full mt-12 divide-y divide-gray-200">
        {faqs.map((faq, i) => (
          <div key={i} className="py-5">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="text-lg font-medium text-gray-900 pr-4">{faq.q}</span>
              <svg
                className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                fill="none"
                strokeWidth="2"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                openIndex === i ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-slate-500 text-sm leading-relaxed">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
