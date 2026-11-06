import { Link } from "next-view-transitions";

const offices = [
  { city: "Kathmandu", detail: "Lazimpat, Kathmandu 44600" },
  { city: "Lalitpur", detail: "Jawalakhel, Lalitpur 44700" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-[#fffcf7]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-sm font-semibold text-ink">Elevate Workforce Solutions</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">
            Nepal employment platform connecting job seekers with verified employers across Kathmandu
            Valley and nationwide. Recruitment, job publishing, and application tracking in one place.
          </p>
          <p className="mt-4 text-sm text-ink">Company registration no. 123456/078/079</p>
          <p className="text-sm text-muted">VAT no. 601234567</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Phone: +977-1-4512345</li>
            <li>Mobile: +977-9801234567</li>
            <li>
              Email:{" "}
              <a className="text-accent hover:underline" href="mailto:hello@elevateworkforce.com.np">
                hello@elevateworkforce.com.np
              </a>
            </li>
            <li>Hours: Sun–Fri, 9:00–18:00 NPT</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/jobs" className="hover:text-ink">
                Browse jobs
              </Link>
            </li>
            <li>
              <Link href="/companies" className="hover:text-ink">
                Companies
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-ink">
                Create an account
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-ink">
                Employer login
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-sm font-semibold text-ink">Offices</p>
          <ul className="mt-2 space-y-1 text-sm text-muted">
            {offices.map((office) => (
              <li key={office.city}>
                {office.city}: {office.detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getUTCFullYear()} Elevate Workforce Solutions Pvt. Ltd. All rights reserved.</p>
          <p>Made for hiring in Nepal.</p>
        </div>
      </div>
    </footer>
  );
}
