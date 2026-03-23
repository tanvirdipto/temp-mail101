const XLogo = () => (
  <svg width="18" height="16" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.244 0.25H20.552L13.325 8.51L21.827 19.75H15.17L9.956 12.933L3.99 19.75H0.679998L8.41 10.915L0.253998 0.25H7.08L11.793 6.481L17.244 0.25ZM16.083 17.77H17.916L6.084 2.126H4.117L16.083 17.77Z" fill="black"/>
  </svg>
);

interface Tweet {
  name: string;
  handle: string;
  text: string;
  date: string;
  replies: number;
  initials: string;
  color: string;
}

const defaultTweets: Tweet[] = [
  { name: "Jane Doe", handle: "@JaneTechie", text: "Just discovered @TempMailCO, and it's a temp mail service! No more spam in my inbox. Quick, easy, and super reliable. Highly recommend! #Privacy #Tech", date: "09:20 AM. Sep 2, 2024", replies: 16, initials: "JD", color: "bg-pink-500" },
  { name: "John Smith", handle: "@JohnS_Coder", text: "@TempMailCO is nice temp mail service for all sign-ups. Love the custom domain feature! Keeps my main inbox clean and secure. #MustHave #SecureEmail", date: "10:12 PM. Aug 6, 2024", replies: 34, initials: "JS", color: "bg-blue-600" },
  { name: "Emily Davis", handle: "@EmilyInBytes", text: "I've been using @TempMailCO for a while now, and it's hands down the best temp mail service out there. The email forwarding option is a lifesaver! #TechLife #NoMoreSpam", date: "01:47 PM. Aug 20, 2024", replies: 20, initials: "ED", color: "bg-violet-500" },
  { name: "Michael Lee", handle: "@MikeCodes", text: "Big shoutout to @TempMailCO for keeping my inbox clutter-free. The temp mail integration was smooth for my project. Perfect service! #DevLife #EmailPrivacy", date: "11:29 PM. Jul 13, 2024", replies: 54, initials: "ML", color: "bg-green-600" },
  { name: "Sarah Wilson", handle: "@SarahW_Tech", text: "Can't believe I didn't find @TempMailCO sooner. The ability to save temp emails for long-term is a feature I've been waiting for. 10/10 service! #TechTools #CleanInbox", date: "06:28 AM. Aug 20, 2024", replies: 15, initials: "SW", color: "bg-orange-500" },
  { name: "David Brown", handle: "@DavidB_Dev", text: "As a developer, I love how easy it is to integrate @TempMailCO for my temp mail. The API is straightforward, and the custom domains are a great touch! #DevTools #SecureEmail", date: "09:37 PM. Jun 6, 2024", replies: 30, initials: "DB", color: "bg-teal-600" },
  { name: "Laura Garcia", handle: "@LauraTechTalk", text: "Been using temp mail inbox @TempMailCO for a few weeks. It's perfect for keeping my personal email safe from spam. Highly recommend it! #PrivacyFirst #TechSavvy", date: "12:09 PM. Aug 21, 2024", replies: 6, initials: "LG", color: "bg-rose-500" },
  { name: "Robert Martinez", handle: "@RobMartinezDev", text: "@TempMailCO is a good temp mail inbox! I no longer worry about spam. The custom domain option is just brilliant! #TechTip #DeveloperLife", date: "08:51 AM. Jun 15, 2024", replies: 2, initials: "RM", color: "bg-indigo-600" },
];

interface SocialProofProps {
  content?: Record<string, string>;
}

export default function SocialProof({ content }: SocialProofProps) {
  const title = content?.title || "Share Your Love with Temp Mail";

  let tweets = defaultTweets;
  if (content?.items) {
    try { tweets = JSON.parse(content.items); } catch { /* use defaults */ }
  }

  return (
    <section className="bg-white mx-auto max-w-6xl px-6 py-16 lg:px-8">
      <h2 className="font-bold text-3xl text-center">{title}</h2>
      <p className="text-base leading-8 text-center text-gray-600 mt-2">
        Experience the power of our temporary email address service
      </p>
      <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tweets.map((t, i) => (
          <div key={i} className="flex flex-col rounded-xl p-3 border border-gray-300 select-none">
            <div className="flex items-start">
              <div className={`shrink-0 w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold mr-2`}>
                {t.initials}
              </div>
              <div className="flex flex-col justify-center grow min-w-0">
                <span className="font-bold text-sm truncate">{t.name}</span>
                <span className="text-sm text-slate-500 truncate">{t.handle}</span>
              </div>
              <div className="shrink-0 flex flex-col items-end ml-2">
                <XLogo />
                <span className="font-bold text-xs text-blue-500 mt-1">Follow</span>
              </div>
            </div>
            <p className="py-2 text-sm text-gray-700 grow">{t.text}</p>
            <div className="text-xs text-slate-500 pb-2 border-b border-gray-200">{t.date}</div>
            <div className="flex items-center justify-between py-2 text-xs text-slate-500">
              <span>0 Likes</span>
              <span>Reply</span>
              <span>Share</span>
            </div>
            <div className="text-xs font-bold text-center rounded-full border border-gray-300 leading-7 text-blue-500">
              Read {t.replies} replies
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
