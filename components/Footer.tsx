export default function Footer() {
  return (
    <>
      {/* Trust Bar */}
      <section className="border-t border-gray-200 mt-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 flex flex-col md:flex-row flex-wrap gap-6 md:gap-0 items-start md:items-center justify-between py-6 lg:py-10">
          <span className="font-bold text-gray-900">Stay Connected, Stay Private.</span>
          <span className="flex items-center gap-1.5 text-sm text-gray-700">
            <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
            Weekly updates
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-700">
            <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
            Customer support
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-700">
            <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            Secure and privacy
          </span>
          <span className="flex items-center gap-1.5 text-sm text-gray-700">
            <svg className="w-5 h-5" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            99.99% uptime
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-7">
        <div className="mx-auto max-w-6xl px-6 lg:px-8 flex flex-col md:flex-row gap-10 md:gap-0 justify-between py-6 lg:py-10">
          <div className="shrink-0 text-sm flex flex-col gap-2">
            <span className="font-bold text-base text-gray-900">Duration</span>
            <a href="#" className="text-gray-600 hover:text-gray-900">5 Minutes Temp Mail</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">10 Minutes Temp Mail</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">15 Minutes Temp Mail</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">20 Minutes Temp Mail</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">25 Minutes Temp Mail</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">30 Minutes Temp Mail</a>
          </div>
          <div className="shrink-0 text-sm flex flex-col gap-2">
            <span className="font-bold text-base text-gray-900">Resources</span>
            <a href="#" className="text-gray-600 hover:text-gray-900">Blog</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">API</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">iOS App</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Chrome Extension</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Log in</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Sign up</a>
          </div>
          <div className="shrink-0 text-sm flex flex-col gap-2">
            <span className="font-bold text-base text-gray-900">Features</span>
            <a href="#" className="text-gray-600 hover:text-gray-900">Auto Expiration</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Custom Domain</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Email Forwarding</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Save for Later</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Long-Term Use</a>
          </div>
          <div className="shrink-0 text-sm flex flex-col gap-2">
            <span className="font-bold text-base text-gray-900">About</span>
            <a href="#" className="text-gray-600 hover:text-gray-900">About Us</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Contact Us</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Terms of Service</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a>
          </div>
          <div className="shrink-0 text-sm flex flex-col gap-2">
            <span className="font-bold text-base text-gray-900">Connect</span>
            <a href="#" className="text-gray-600 hover:text-gray-900">X (Twitter)</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Facebook</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">Youtube</a>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-6 lg:px-8 flex items-center justify-between pt-6 lg:pt-10 border-t border-gray-200">
          <a href="/" className="flex items-center gap-2">
            <svg className="h-7 w-7" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M35 31.6667H17.3333C16.4493 31.6667 15.6014 31.3155 14.9763 30.6904C14.3512 30.0652 14 29.2174 14 28.3333V11.6667C14 10.7826 14.3512 9.93477 14.9763 9.30965C15.6014 8.68453 16.4493 8.33334 17.3333 8.33334H40.6667C41.5507 8.33334 42.3986 8.68453 43.0237 9.30965C43.6488 9.93477 44 10.7826 44 11.6667V15.8333M44 31.6667V21.6667L40 26.5" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11.6667L29 21.6667L44 11.6667" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-lg font-bold text-gray-900">TempMail.co</span>
          </a>
          <span className="text-sm text-gray-500">&copy; 2026 TempMail.co</span>
        </div>
      </footer>
    </>
  );
}
