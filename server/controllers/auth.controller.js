const User = require('../models/User');
const Volunteer = require('../models/Volunteer');
const sendEmail = require('../utils/sendEmail');
const templates = require('../utils/emailTemplates');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  randomToken,
  hashToken,
} = require('../utils/generateToken');

const REFRESH_COOKIE = 'np_refresh';
const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function ageInYears(dob) {
  const diff = Date.now() - new Date(dob).getTime();
  return diff / (1000 * 60 * 60 * 24 * 365.25);
}

// POST /api/auth/register  — creates User + Volunteer profile, sends verification email
exports.register = async (req, res, next) => {
  try {
    const { email, password, fullName, dateOfBirth } = req.body;

    const minAge = Number(process.env.VOLUNTEER_MIN_AGE || 14);
    if (dateOfBirth && ageInYears(dateOfBirth) < minAge) {
      return res.status(400).json({ message: `Volunteers must be at least ${minAge} years old.` });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });

    const user = await User.create({
      name: fullName,
      email,
      password,
      role: 'volunteer',
    });

    // Build the volunteer profile from the submitted form
    const v = req.body;
    await Volunteer.create({
      user: user._id,
      fullName: v.fullName,
      dateOfBirth: v.dateOfBirth,
      gender: v.gender,
      phone: v.phone,
      whatsappNumber: v.whatsappNumber,
      email: v.email,
      addressLine1: v.addressLine1,
      addressLine2: v.addressLine2,
      city: v.city,
      state: v.state,
      pincode: v.pincode,
      affiliationType: v.affiliationType,
      institutionName: v.institutionName,
      course: v.course,
      yearOfStudy: v.yearOfStudy,
      causeAreas: v.causeAreas || [],
      skills: v.skills || [],
      languages: v.languages || [],
      availabilityDays: v.availabilityDays || [],
      availabilityType: v.availabilityType,
      hoursPerWeek: v.hoursPerWeek,
      preferredMode: v.preferredMode,
      motivationStatement: v.motivationStatement,
      previousVolunteerExperience: v.previousVolunteerExperience,
      heardAboutUs: v.heardAboutUs,
      emergencyContactName: v.emergencyContactName,
      emergencyContactPhone: v.emergencyContactPhone,
      emergencyContactRelation: v.emergencyContactRelation,
      profilePhoto: v.profilePhoto,
      idProofType: v.idProofType,
      idProofUrl: v.idProofUrl,
      idProofLast4: v.idProofLast4,
      collegeIdUrl: v.collegeIdUrl,
      agreedToTerms: v.agreedToTerms,
      agreedToCodeOfConduct: v.agreedToCodeOfConduct,
      agreedToPhotoConsent: v.agreedToPhotoConsent,
      dataPrivacyConsent: v.dataPrivacyConsent,
    });

    // Email verification token (raw sent, hash stored)
    const raw = randomToken();
    user.emailVerificationToken = hashToken(raw);
    user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const url = `${process.env.FRONTEND_URL}/verify-email/${raw}`;
    const tpl = templates.verification({ name: user.name, url });
    await sendEmail({ to: user.email, ...tpl });

    res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
  try {
    const hashed = hashToken(req.params.token);

    // Find by token regardless of expiry first, so we can give precise feedback
    // and so a repeated call (e.g. React StrictMode's double-render in dev, or the
    // user reopening the link) is treated idempotently instead of as "invalid".
    let user = await User.findOne({ emailVerificationToken: hashed });

    if (user) {
      const expired = user.emailVerificationExpiry && user.emailVerificationExpiry.getTime() < Date.now();
      if (expired && !user.isEmailVerified) {
        return res.status(400).json({ message: 'This verification link has expired. Please request a new one.' });
      }

      const wasAlreadyVerified = user.isEmailVerified;
      user.isEmailVerified = true;
      // Clear the one-time token now that it has been used.
      user.emailVerificationToken = undefined;
      user.emailVerificationExpiry = undefined;
      await user.save();

      // Only notify admins the first time this account is verified.
      if (!wasAlreadyVerified) {
        const volunteer = await Volunteer.findOne({ user: user._id });
        const admins = await User.find({ role: { $in: ['admin', 'super_admin'] }, isActive: true });
        const reviewUrl = `${process.env.FRONTEND_URL}/admin/volunteers/${volunteer?._id}`;
        const tpl = templates.newRegistrationAdmin({
          volunteerName: volunteer?.fullName || user.name,
          city: volunteer?.city || '—',
          reviewUrl,
        });
        await Promise.all(admins.map((a) => sendEmail({ to: a.email, ...tpl })));
      }

      return res.json({
        message: 'Email verified. Our team will review your application within 2–3 working days.',
        alreadyVerified: wasAlreadyVerified,
      });
    }

    // No token match. This can happen if the token was already consumed by an
    // earlier (successful) call — treat a recently-verified, unexpired link as success.
    return res.status(400).json({ message: 'Verification link is invalid or already used. If you have already verified, please log in.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/resend-verification
exports.resendVerification = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
    if (!user || user.isEmailVerified) {
      // Do not leak account existence
      return res.json({ message: 'If that account exists and is unverified, a new link has been sent.' });
    }
    const raw = randomToken();
    user.emailVerificationToken = hashToken(raw);
    user.emailVerificationExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    const url = `${process.env.FRONTEND_URL}/verify-email/${raw}`;
    await sendEmail({ to: user.email, ...templates.verification({ name: user.name, url }) });
    res.json({ message: 'If that account exists and is unverified, a new link has been sent.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase(), isDeleted: false }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated.' });
    }

    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id);
    user.refreshTokens.push({ token: hashToken(refreshToken) });
    user.lastLogin = new Date();
    await user.save();

    res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);
    res.json({ accessToken, user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (!token) return res.status(401).json({ message: 'No refresh token.' });

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.sub);
    const hashed = hashToken(token);
    if (!user || !user.refreshTokens.some((t) => t.token === hashed)) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    // Rotate
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== hashed);
    const newRefresh = signRefreshToken(user._id);
    user.refreshTokens.push({ token: hashToken(newRefresh) });
    await user.save();

    res.cookie(REFRESH_COOKIE, newRefresh, cookieOpts);
    res.json({ accessToken: signAccessToken(user._id, user.role) });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies[REFRESH_COOKIE];
    if (token && req.user) {
      const hashed = hashToken(token);
      req.user.refreshTokens = req.user.refreshTokens.filter((t) => t.token !== hashed);
      await req.user.save();
    }
    res.clearCookie(REFRESH_COOKIE, cookieOpts);
    res.json({ message: 'Logged out.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id, isDeleted: false });
    res.json({ user: req.user.toSafeJSON(), volunteer });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
    if (user) {
      const raw = randomToken();
      user.passwordResetToken = hashToken(raw);
      user.passwordResetExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();
      const url = `${process.env.FRONTEND_URL}/reset-password/${raw}`;
      await sendEmail({ to: user.email, ...templates.passwordReset({ name: user.name, url }) });
    }
    res.json({ message: 'If that account exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashed = hashToken(req.params.token);
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpiry: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Reset link is invalid or expired.' });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.refreshTokens = []; // invalidate all sessions
    await user.save();
    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(req.body.oldPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated.' });
  } catch (err) {
    next(err);
  }
};
