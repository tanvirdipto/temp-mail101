interface Testimonial {
  quote: string;
  name: string;
  title: string;
  initials: string;
  color: string;
}

const defaultTestimonials: Testimonial[] = [
  { quote: "TempMail is fantastic! I can keep my personal inbox clean and avoid spam with temp mail. The service is quick and easy to use, and it gives me peace of mind knowing my privacy is protected.", name: "John Doe", title: "Software Developer", initials: "JD", color: "bg-blue-500" },
  { quote: "A temp mail for signing up for services without giving away my real email. TempMail has saved me from countless spam emails and unwanted subscriptions. Recommended!", name: "Jane Smith", title: "Digital Marketer", initials: "JS", color: "bg-purple-500" },
  { quote: "I love the simplicity and effectiveness of temp mail. It's perfect for when you need an email address temporarily. The user interface is straightforward, and the service is reliable.", name: "David Brown", title: "Freelance Writer", initials: "DB", color: "bg-emerald-500" },
];

interface TestimonialsProps {
  content?: Record<string, string>;
}

export default function Testimonials({ content }: TestimonialsProps) {
  let testimonials = defaultTestimonials;
  if (content?.items) {
    try { testimonials = JSON.parse(content.items); } catch { /* use defaults */ }
  }

  return (
    <section className="bg-white mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <h2 className="font-bold text-3xl text-center">What Our Users Say with Temp Mail</h2>
      <p className="text-base leading-8 text-center text-gray-600 mt-2">Hear from our satisfied users</p>
      <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="p-6 rounded-lg shadow-md bg-gray-50">
            <p className="text-slate-500 text-sm leading-relaxed">{t.quote}</p>
            <div className="flex items-center mt-5">
              <div className={`w-11 h-11 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                {t.initials}
              </div>
              <div className="ml-3">
                <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                <div className="text-sm text-slate-500">{t.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
