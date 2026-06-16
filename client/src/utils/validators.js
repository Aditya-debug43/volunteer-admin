import { z } from 'zod';

const phoneRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^\d{6}$/;

export const minAge = (years = 14) => (dateStr) => {
  if (!dateStr) return false;
  const dob = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - years);
  return dob <= cutoff;
};

// Step 1 — Personal Information
export const step1Schema = z
  .object({
    fullName: z.string().min(2, 'Please enter your full name'),
    dateOfBirth: z.string().refine(minAge(14), 'You must be at least 14 years old'),
    gender: z.enum(['Male', 'Female', 'Non-binary', 'Prefer not to say'], { message: 'Select a gender' }),
    email: z.string().email('Enter a valid email'),
    phone: z.string().regex(phoneRegex, 'Enter a valid 10-digit Indian mobile number'),
    whatsappNumber: z.string().regex(phoneRegex, 'Invalid number').optional().or(z.literal('')),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/\d/, 'Include at least 1 number')
      .regex(/[^A-Za-z0-9]/, 'Include at least 1 special character'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Step 2 — Address
export const step2Schema = z.object({
  addressLine1: z.string().min(3, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'Select a city'),
  state: z.string().min(1, 'Select a state'),
  pincode: z.string().regex(pincodeRegex, 'Enter a valid 6-digit pincode'),
});

// Step 4 — Cause areas (at least one)
export const step4Schema = z.object({
  causeAreas: z.array(z.string()).min(1, 'Select at least one cause area'),
});

// Step 5 — Emergency contact (required by the backend, so enforce it here too)
export const step5Schema = z.object({
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactRelation: z.string().min(1, 'Please select a relationship'),
  emergencyContactPhone: z.string().regex(phoneRegex, 'Enter a valid 10-digit mobile number'),
});

// Step 6 — Consent
export const step6Schema = z.object({
  agreedToTerms: z.literal(true, { message: 'You must accept the Terms & Conditions' }),
  agreedToCodeOfConduct: z.literal(true, { message: 'You must accept the Code of Conduct' }),
  dataPrivacyConsent: z.literal(true, { message: 'You must consent to the Privacy Policy' }),
});

export function passwordStrength(pw = '') {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
  if (score <= 3) return { label: 'Medium', color: 'bg-amber-500', width: '66%' };
  return { label: 'Strong', color: 'bg-green-500', width: '100%' };
}
