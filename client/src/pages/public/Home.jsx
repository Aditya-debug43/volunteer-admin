import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Youtube, Facebook, Twitter, Heart, GraduationCap, Utensils, Shirt } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { SITE_IMAGES, SOCIALS } from '@/constants/images';
import { CAUSE_AREAS } from '@/constants';

export default function Home() {
  return (
    <div className="min-h-screen bg-surface">
      {/* ---- Top nav ---- */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo withTagline />
          <nav className="hidden items-center gap-6 md:flex">
            <a href="https://nayepankh.com/about-us" target="_blank" rel="noreferrer" className="text-sm font-medium text-ink hover:text-brand">About Us</a>
            <a href="https://nayepankh.com/our-certificates" target="_blank" rel="noreferrer" className="text-sm font-medium text-ink hover:text-brand">Certificates</a>
            <a href="https://nayepankh.com/donate" target="_blank" rel="noreferrer" className="text-sm font-medium text-ink hover:text-brand">Donate</a>
            <Link to="/login" className="text-sm font-medium text-ink hover:text-brand">Log in</Link>
          </nav>
          <Link to="/register" className="btn-primary px-4 py-2 text-sm">Become a Volunteer</Link>
        </div>
      </header>

      {/* ---- Hero ---- */}
      <section className="relative">
        <div className="absolute inset-0">
          <img src={SITE_IMAGES.hero} alt="NayePankh volunteers bringing smiles to underprivileged children"
            className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-28 sm:py-36">
          <span className="inline-block rounded-full bg-brand/90 px-4 py-1 text-sm font-semibold text-white">
            UP Government • 80G &amp; 12A Registered NGO
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            It's that easy to bring a <span className="text-brand">Smile</span> on Their Faces
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/90">
            We don't ask for much — just help us with what you can, be it Money, Skill or Your Time.
            Join one of India's biggest student-led NGOs.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary text-lg">Start Volunteering →</Link>
            <a href="https://nayepankh.com/donate" target="_blank" rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/70 bg-white/10 px-5 py-2.5 text-lg font-semibold text-white backdrop-blur transition hover:bg-white/20">
              Donate Now
            </a>
          </div>
        </div>
      </section>

      {/* ---- Impact stats ---- */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-12 sm:grid-cols-4">
          {[
            ['2 Lakh+', 'People served'],
            ['11', 'Cause areas'],
            ['Since 2021', 'Youth-led & growing'],
            ['Kanpur · Ghaziabad', 'and more cities'],
          ].map(([stat, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-extrabold text-brand sm:text-3xl">{stat}</p>
              <p className="mt-1 text-sm text-ink-soft">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- About: Think global, Act local ---- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <p className="text-sm font-bold uppercase tracking-wide text-brand">About us</p>
            <h2 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">Think global, Act local.</h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              NayePankh Foundation is a non-governmental organisation with a strong desire to help society
              and make it a better place for all. Service to mankind is the service to god. Let's
              revolutionise society together — by providing free food, sanitary pads, clothes and education
              to those who need it most.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="https://nayepankh.com/about-us" target="_blank" rel="noreferrer" className="btn-primary">Learn More</a>
              <a href="https://nayepankh.com/our-certificates" target="_blank" rel="noreferrer" className="btn-ghost">Our Certificates</a>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <img src={SITE_IMAGES.about} alt="NayePankh Foundation community work"
              className="w-full rounded-card object-cover shadow-lg" />
          </div>
        </div>
      </section>

      {/* ---- Cause areas ---- */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Where you can help</h2>
            <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
              Choose from 11 cause areas when you register. Give your time to what you care about most.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Utensils, 'Food Distribution', 'Serve warm meals to the hungry'],
              [Heart, 'Sanitary & Hygiene', 'Menstrual health awareness drives'],
              [Shirt, 'Clothes Distribution', 'Collect & give clothes to the needy'],
              [GraduationCap, 'Education & Tutoring', 'Teach underprivileged children'],
            ].map(([Icon, title, desc]) => (
              <div key={title} className="card p-6 text-center transition hover:shadow-md">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                  <Icon className="h-7 w-7 text-brand" />
                </div>
                <h3 className="mt-4 font-bold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-ink-soft">
            …and {CAUSE_AREAS.length - 4} more, including healthcare, animal welfare, photography &amp; fundraising.
          </p>
        </div>
      </section>

      {/* ---- Welcome / biggest student-led NGO + mission cards ---- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Welcome to NayePankh Foundation</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-ink-soft">
            We are one of the biggest student-led NGOs in India, with operations across Kanpur, Ghaziabad
            and various other cities. UP Govt. | 80G &amp; 12A Registered.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            {
              img: SITE_IMAGES.about,
              title: 'Kindness, passed on',
              text: 'NayePankh Foundation promotes kindness and wants to instill the habit of giving back to society amongst the youth of our country.',
            },
            {
              img: SITE_IMAGES.welcome,
              title: 'Equality for every child',
              text: 'We work towards a society where children can prosper to their full potential and enjoy equality in its truest sense.',
            },
            {
              img: SITE_IMAGES.team,
              title: 'Help where it matters',
              text: 'We have been helping under and less-privileged people with sanitary, health, education and awareness initiatives across India.',
            },
          ].map((card) => (
            <div key={card.title} className="card flex flex-col items-center p-7 text-center">
              <img src={card.img} alt={card.title}
                className="h-24 w-24 rounded-full object-cover shadow-sm" />
              <h3 className="mt-5 text-lg font-bold text-ink">{card.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Join the team CTA ---- */}
      <section className="bg-gradient-to-br from-brand to-brand-dark py-20 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white/80">Join our team</p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Make a difference, one person at a time.</h2>
            <p className="mt-4 leading-relaxed text-white/90">
              Whether you're passionate about education, health, or providing support during times of crisis,
              there's a place for you on our team. Contribute your time, skills and ideas to help create real,
              lasting impact in your community.
            </p>
            <Link to="/register" className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-lg font-bold text-brand transition hover:bg-orange-50">
              Join Us →
            </Link>
          </div>
          <div>
            <img src={SITE_IMAGES.team} alt="NayePankh Foundation team"
              className="w-full rounded-card object-cover shadow-lg" />
          </div>
        </div>
      </section>

      {/* ---- Founder quote ---- */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="text-2xl font-bold leading-relaxed text-ink sm:text-3xl">
          "If we all do something, then together there is no problem that we cannot solve!"
        </p>
        <p className="mt-6 font-bold uppercase tracking-wide text-brand">Prashant Shukla</p>
        <p className="text-sm text-ink-soft">Founder &amp; President, NayePankh Foundation</p>
      </section>

      {/* ---- Footer ---- */}
      <footer className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="text-lg font-extrabold">NayePankh Foundation</p>
              <p className="mt-2 text-sm text-white/70">Giving Wings to the Underprivileged</p>
              <p className="mt-4 text-sm text-white/70">
                UP Govt. Registered NGO<br />80G &amp; 12A Certified
              </p>
            </div>
            <div>
              <p className="font-bold">Get in touch</p>
              <p className="mt-3 text-sm text-white/70">contact@nayepankh.com</p>
              <p className="text-sm text-white/70">+91-8318500748</p>
              <p className="mt-3 text-xs text-white/50">
                Donations are tax-exempt under 80G of the Indian Income Tax Act.
              </p>
            </div>
            <div>
              <p className="font-bold">Follow us</p>
              <div className="mt-3 flex gap-3">
                {[
                  [Instagram, SOCIALS.instagram],
                  [Linkedin, SOCIALS.linkedin],
                  [Youtube, SOCIALS.youtube],
                  [Facebook, SOCIALS.facebook],
                  [Twitter, SOCIALS.twitter],
                ].map(([Icon, href], i) => (
                  <a key={i} href={href} target="_blank" rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-brand">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-1 text-xs text-white/60">
                <a href="https://nayepankh.com/terms-and-conditions" target="_blank" rel="noreferrer" className="hover:text-white">Terms &amp; Conditions</a>
                <a href="https://nayepankh.com/privacy-policy" target="_blank" rel="noreferrer" className="hover:text-white">Privacy Policy</a>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
            © {new Date().getFullYear()} NayePankh Foundation. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
