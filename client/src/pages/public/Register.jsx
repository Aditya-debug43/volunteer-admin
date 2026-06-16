import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '@/components/common/Logo';
import { authService } from '@/services/auth.service';
import {
  CAUSE_AREAS, SKILLS, CITIES, LANGUAGES, AFFILIATIONS, DAYS, HEARD_ABOUT, INDIAN_STATES,
} from '@/constants';
import { step1Schema, step2Schema, step4Schema, step5Schema, step6Schema, passwordStrength } from '@/utils/validators';

const STEPS = ['Personal', 'Location', 'Background', 'Causes', 'Motivation', 'Consent'];
const STORAGE_KEY = 'np_register_progress';

const initialForm = {
  fullName: '', dateOfBirth: '', gender: '', email: '', phone: '', whatsappNumber: '',
  password: '', confirmPassword: '',
  addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  affiliationType: '', institutionName: '', course: '', yearOfStudy: '',
  languages: [], heardAboutUs: '',
  causeAreas: [], skills: [], availabilityDays: [], availabilityType: '', hoursPerWeek: 5, preferredMode: '',
  motivationStatement: '', previousVolunteerExperience: '',
  emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '',
  agreedToTerms: false, agreedToCodeOfConduct: false, dataPrivacyConsent: false, agreedToPhotoConsent: false,
};

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? { ...initialForm, ...JSON.parse(saved) } : initialForm;
    } catch {
      return initialForm;
    }
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [sameWhatsapp, setSameWhatsapp] = useState(false);

  // Auto-save progress (excluding passwords) to sessionStorage
  useEffect(() => {
    const { password, confirmPassword, ...safe } = form;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  }, [form]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const toggleArray = (key, value) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  const isStudent = ['School Student', 'College/University Student'].includes(form.affiliationType);

  function validateStep(idx) {
    const schemas = { 0: step1Schema, 1: step2Schema, 3: step4Schema, 4: step5Schema, 5: step6Schema };
    const schema = schemas[idx];
    if (!schema) return true;
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((i) => { fieldErrors[i.path[0]] = i.message; });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }

  const next = () => { if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  async function submit() {
    if (!validateStep(5)) return;
    setSubmitting(true);
    try {
      const payload = { ...form, whatsappNumber: sameWhatsapp ? form.phone : form.whatsappNumber };
      delete payload.confirmPassword;
      await authService.register(payload);
      sessionStorage.removeItem(STORAGE_KEY);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="card max-w-lg text-center">
          <div className="text-6xl">🎉</div>
          <h1 className="mt-4 text-2xl font-extrabold text-ink">Welcome to the NayePankh family!</h1>
          <p className="mt-3 text-ink-soft">
            Check your email at <strong>{form.email}</strong> to verify your account. Once verified, our
            team will review your application and get back to you within 2–3 working days.
          </p>
          <button className="btn-primary mt-6" onClick={() => navigate('/login')}>Go to login</button>
        </div>
      </div>
    );
  }

  const pw = passwordStrength(form.password);

  return (
    <div className="min-h-screen bg-surface px-4 py-8">
      <div className="mx-auto max-w-[680px]">
        <div className="mb-4 flex justify-center"><Logo withTagline /></div>

        {/* Progress bar */}
        <div className="mb-6 flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition
                  ${i < step ? 'border-brand bg-brand text-white' : i === step ? 'border-brand text-brand' : 'border-line text-ink-soft'}`}
              >
                {i < step ? '✓' : i + 1}
              </button>
              {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 flex-1 ${i < step ? 'bg-brand' : 'bg-line'}`} />}
            </div>
          ))}
        </div>

        <div className="card">
          {/* STEP 1 — Personal */}
          {step === 0 && (
            <div className="space-y-4">
              <Header title="Tell us about yourself 👋" sub="Join thousands of youth making a difference across India" />
              <Field label="Full Name" error={errors.fullName}>
                <input className="input" placeholder="As per your ID proof" value={form.fullName}
                  onChange={(e) => set({ fullName: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Date of Birth" error={errors.dateOfBirth}>
                  <input type="date" className="input" value={form.dateOfBirth}
                    onChange={(e) => set({ dateOfBirth: e.target.value })} />
                </Field>
                <Field label="Gender" error={errors.gender}>
                  <select className="input" value={form.gender} onChange={(e) => set({ gender: e.target.value })}>
                    <option value="">Select…</option>
                    {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => <option key={g}>{g}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Email Address" error={errors.email}>
                <input type="email" className="input" placeholder="We'll send your verification link here"
                  value={form.email} onChange={(e) => set({ email: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mobile Number" error={errors.phone}>
                  <input type="tel" className="input" placeholder="10-digit number" value={form.phone}
                    onChange={(e) => set({ phone: e.target.value })} />
                </Field>
                <Field label="WhatsApp Number" error={errors.whatsappNumber}>
                  <input type="tel" className="input" disabled={sameWhatsapp}
                    value={sameWhatsapp ? form.phone : form.whatsappNumber}
                    onChange={(e) => set({ whatsappNumber: e.target.value })} />
                  <label className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
                    <input type="checkbox" checked={sameWhatsapp} onChange={(e) => setSameWhatsapp(e.target.checked)} />
                    Same as mobile number
                  </label>
                </Field>
              </div>
              <Field label="Password" error={errors.password}>
                <input type="password" className="input" placeholder="Min 8 chars, 1 number, 1 special character"
                  value={form.password} onChange={(e) => set({ password: e.target.value })} />
                {form.password && (
                  <div className="mt-1.5">
                    <div className="h-1.5 w-full rounded bg-line">
                      <div className={`h-full rounded ${pw.color}`} style={{ width: pw.width }} />
                    </div>
                    <span className="text-xs text-ink-soft">{pw.label}</span>
                  </div>
                )}
              </Field>
              <Field label="Confirm Password" error={errors.confirmPassword}>
                <input type="password" className="input" value={form.confirmPassword}
                  onChange={(e) => set({ confirmPassword: e.target.value })} />
              </Field>
            </div>
          )}

          {/* STEP 2 — Location */}
          {step === 1 && (
            <div className="space-y-4">
              <Header title="Where are you based? 📍" sub="We'll match you with drives happening near you" />
              <Field label="Address Line 1" error={errors.addressLine1}>
                <input className="input" value={form.addressLine1} onChange={(e) => set({ addressLine1: e.target.value })} />
              </Field>
              <Field label="Address Line 2 (optional)">
                <input className="input" value={form.addressLine2} onChange={(e) => set({ addressLine2: e.target.value })} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City" error={errors.city}>
                  <select className="input" value={form.city} onChange={(e) => set({ city: e.target.value })}>
                    <option value="">Select…</option>
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="State" error={errors.state}>
                  <select className="input" value={form.state} onChange={(e) => set({ state: e.target.value })}>
                    <option value="">Select…</option>
                    {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Pincode" error={errors.pincode}>
                  <input className="input" maxLength={6} value={form.pincode} onChange={(e) => set({ pincode: e.target.value })} />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 3 — Background */}
          {step === 2 && (
            <div className="space-y-4">
              <Header title="Your background 🎓" sub="NayePankh was founded by students — one of India's biggest youth-led NGOs" />
              <Field label="I am a…">
                <div className="grid gap-2 sm:grid-cols-2">
                  {AFFILIATIONS.map((a) => (
                    <label key={a} className={`cursor-pointer rounded-lg border px-3 py-2 text-sm
                      ${form.affiliationType === a ? 'border-brand bg-orange-50 font-medium' : 'border-line'}`}>
                      <input type="radio" className="mr-2" name="aff" checked={form.affiliationType === a}
                        onChange={() => set({ affiliationType: a })} />
                      {a}
                    </label>
                  ))}
                </div>
              </Field>
              {form.affiliationType && form.affiliationType !== 'Other' && (
                <Field label="School / College / Company Name">
                  <input className="input" value={form.institutionName} onChange={(e) => set({ institutionName: e.target.value })} />
                </Field>
              )}
              {isStudent && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Course / Degree">
                    <input className="input" placeholder="e.g. B.Tech Computer Science"
                      value={form.course} onChange={(e) => set({ course: e.target.value })} />
                  </Field>
                  <Field label="Year of Study">
                    <select className="input" value={form.yearOfStudy} onChange={(e) => set({ yearOfStudy: e.target.value })}>
                      <option value="">Select…</option>
                      {['1st Year', '2nd Year', '3rd Year', 'Final Year', 'Completed'].map((y) => <option key={y}>{y}</option>)}
                    </select>
                  </Field>
                </div>
              )}
              <Field label="Languages You Speak">
                <ChipGroup options={LANGUAGES} selected={form.languages} onToggle={(v) => toggleArray('languages', v)} />
              </Field>
              <Field label="How did you hear about us?">
                <select className="input" value={form.heardAboutUs} onChange={(e) => set({ heardAboutUs: e.target.value })}>
                  <option value="">Select…</option>
                  {HEARD_ABOUT.map((h) => <option key={h}>{h}</option>)}
                </select>
              </Field>
            </div>
          )}

          {/* STEP 4 — Causes & Skills */}
          {step === 3 && (
            <div className="space-y-5">
              <Header title="What drives you? 💛" sub="Select the areas you're passionate about. You can choose multiple." />
              {errors.causeAreas && <p className="field-error">{errors.causeAreas}</p>}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {CAUSE_AREAS.map((c) => {
                  const active = form.causeAreas.includes(c.value);
                  return (
                    <button key={c.value} type="button" onClick={() => toggleArray('causeAreas', c.value)}
                      className={`rounded-lg border p-3 text-left transition ${active ? 'border-brand bg-orange-50' : 'border-line hover:border-brand/50'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{c.icon}</span>
                        {active && <span className="text-brand">✓</span>}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-ink">{c.label}</p>
                      <p className="text-xs text-ink-soft">{c.desc}</p>
                    </button>
                  );
                })}
              </div>
              <Field label="Skills (optional)">
                <ChipGroup options={SKILLS} selected={form.skills} onToggle={(v) => toggleArray('skills', v)} />
              </Field>
              <Field label="Which days are you available?">
                <ChipGroup options={DAYS} selected={form.availabilityDays} onToggle={(v) => toggleArray('availabilityDays', v)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Availability type">
                  <select className="input" value={form.availabilityType} onChange={(e) => set({ availabilityType: e.target.value })}>
                    <option value="">Select…</option>
                    {['Weekdays only', 'Weekends only', 'Both weekdays and weekends', 'Flexible'].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
                <Field label="Preferred mode">
                  <select className="input" value={form.preferredMode} onChange={(e) => set({ preferredMode: e.target.value })}>
                    <option value="">Select…</option>
                    {['On-ground (in-person)', 'Remote/Online', 'Both'].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
              </div>
              <Field label={`Hours per week: ~${form.hoursPerWeek} hours`}>
                <input type="range" min={1} max={20} value={form.hoursPerWeek}
                  onChange={(e) => set({ hoursPerWeek: Number(e.target.value) })} className="w-full accent-brand" />
              </Field>
            </div>
          )}

          {/* STEP 5 — Motivation & Emergency */}
          {step === 4 && (
            <div className="space-y-4">
              <Header title="Almost there! 🙌" />
              <Field label="Why do you want to volunteer with NayePankh?">
                <textarea className="input" rows={3} maxLength={500}
                  placeholder="Share what motivates you to make a difference…"
                  value={form.motivationStatement} onChange={(e) => set({ motivationStatement: e.target.value })} />
                <span className="text-xs text-ink-soft">{form.motivationStatement.length}/500</span>
              </Field>
              <Field label="Previous volunteer experience (optional)">
                <textarea className="input" rows={3} maxLength={500}
                  placeholder="Tell us about any prior volunteering or social work…"
                  value={form.previousVolunteerExperience} onChange={(e) => set({ previousVolunteerExperience: e.target.value })} />
              </Field>
              <div className="rounded-lg bg-orange-50 p-4">
                <p className="mb-3 font-semibold text-ink">Emergency Contact <span className="text-red-500">*</span></p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Name" error={errors.emergencyContactName}>
                    <input className="input" value={form.emergencyContactName} onChange={(e) => set({ emergencyContactName: e.target.value })} />
                  </Field>
                  <Field label="Relationship" error={errors.emergencyContactRelation}>
                    <select className="input" value={form.emergencyContactRelation} onChange={(e) => set({ emergencyContactRelation: e.target.value })}>
                      <option value="">Select…</option>
                      {['Parent', 'Sibling', 'Spouse', 'Friend', 'Guardian', 'Other'].map((r) => <option key={r}>{r}</option>)}
                    </select>
                  </Field>
                  <Field label="Phone" error={errors.emergencyContactPhone}>
                    <input type="tel" className="input" value={form.emergencyContactPhone} onChange={(e) => set({ emergencyContactPhone: e.target.value })} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6 — Consent */}
          {step === 5 && (
            <div className="space-y-4">
              <Header title="Final step 📋" sub="Give your consent to complete registration" />
              <p className="text-sm text-ink-soft">
                Document uploads (profile photo, ID proof) can be added from your dashboard after approval.
              </p>
              <Consent error={errors.agreedToTerms} checked={form.agreedToTerms}
                onChange={(v) => set({ agreedToTerms: v })}>
                I agree to the NayePankh Foundation <a href="https://nayepankh.com/terms-and-conditions" target="_blank" rel="noreferrer" className="text-brand underline">Terms &amp; Conditions</a>
              </Consent>
              <Consent error={errors.agreedToCodeOfConduct} checked={form.agreedToCodeOfConduct}
                onChange={(v) => set({ agreedToCodeOfConduct: v })}>
                I agree to the Volunteer Code of Conduct
              </Consent>
              <Consent error={errors.dataPrivacyConsent} checked={form.dataPrivacyConsent}
                onChange={(v) => set({ dataPrivacyConsent: v })}>
                I consent to the collection and use of my data per the <a href="https://nayepankh.com/privacy-policy" target="_blank" rel="noreferrer" className="text-brand underline">Privacy Policy</a>
              </Consent>
              <Consent checked={form.agreedToPhotoConsent} onChange={(v) => set({ agreedToPhotoConsent: v })}>
                I consent for my photos/videos taken during events to be used on NayePankh's social media (optional)
              </Consent>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button onClick={back} disabled={step === 0} className="btn-ghost disabled:opacity-40">← Back</button>
            {step < STEPS.length - 1 ? (
              <button onClick={next} className="btn-primary">Next →</button>
            ) : (
              <button onClick={submit} disabled={submitting} className="btn-primary">
                {submitting ? 'Submitting…' : 'Complete My Registration →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ title, sub }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
      {sub && <p className="mt-1 text-ink-soft">{sub}</p>}
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function ChipGroup({ options, selected, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o);
        return (
          <button key={o} type="button" onClick={() => onToggle(o)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${active ? 'border-brand bg-brand text-white' : 'border-line text-ink hover:border-brand'}`}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Consent({ checked, onChange, error, children }) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3">
        <input type="checkbox" className="mt-1 accent-brand" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="text-sm text-ink">{children}</span>
      </label>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
