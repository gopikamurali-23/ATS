import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from './common/Modal';
import { api } from '../api';
import { 
  User, Briefcase, Lock, Mail, Phone, Building, ArrowRight, ShieldCheck, 
  CheckCircle2, AlertCircle, RefreshCw, KeyRound, Check, X, Shield 
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login', onRoleSelected }) => {
  const { login, register, loginAsDemo, error, setError } = useAuth();

  // Mode views: 
  // 'role-select' | 'login-applicant' | 'login-recruiter' | 
  // 'register-applicant' | 'register-recruiter' | 
  // 'email-verification' | 'otp-verification' | 'forgot-password' | 'reset-password'
  const [viewMode, setViewMode] = useState(initialMode);

  // Form Field States
  const [selectedRole, setSelectedRole] = useState('ROLE_CANDIDATE'); // 'ROLE_CANDIDATE' or 'ROLE_COMPANY'
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // CAPTCHA State
  const [captchaCode, setCaptchaCode] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');

  // Applicant Fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Recruiter Fields
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(300); // 5 minute timer in seconds
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpDemoHint, setOtpDemoHint] = useState('123456');
  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Forgot Password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // JS Validation Errors Map
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Helper to generate random 5-character Alphanumeric CAPTCHA Code
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setUserCaptchaInput('');
  };

  // Generate CAPTCHA when viewMode becomes login or when modal opens
  useEffect(() => {
    if (viewMode === 'login-applicant' || viewMode === 'login-recruiter') {
      generateCaptcha();
    }
  }, [viewMode, isOpen]);

  // Timer Effect for OTP & Cooldown
  useEffect(() => {
    let interval = null;
    if ((viewMode === 'otp-verification' || viewMode === 'email-verification') && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
        if (resendCooldown > 0) setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [viewMode, otpTimer, resendCooldown]);

  useEffect(() => {
    if (initialMode) {
      if (initialMode === 'login') setViewMode('login-applicant');
      else setViewMode(initialMode);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setLoginIdentifier('');
    setLoginPassword('');
    setUserCaptchaInput('');
    setFullName('');
    setAge('');
    setEmail('');
    setPhone('');
    setCompanyName('');
    setCompanyEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtpDigits(['', '', '', '', '', '']);
    setResetEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setErrors({});
    setSuccessMessage('');
    setIsSubmitting(false);
    if (setError) setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // PASSWORD STRENGTH REQUIREMENTS
  const passReqs = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
  const isPasswordValid = passReqs.length && passReqs.uppercase && passReqs.lowercase && passReqs.number && passReqs.special;

  // JAVASCRIPT VALIDATION: APPLICANT FORM (WITH STRICT 18-75 AGE RANGE)
  const validateApplicantForm = () => {
    const errs = {};

    // Name: letters and spaces only
    if (!fullName.trim()) {
      errs.fullName = 'Full Name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(fullName.trim())) {
      errs.fullName = 'Name must contain only letters and spaces.';
    }

    // Age: numeric values strictly between 18 and 75
    if (!age.toString().trim()) {
      errs.age = 'Age is required';
    } else {
      const numAge = Number(age);
      if (isNaN(numAge) || !Number.isInteger(numAge) || numAge < 18 || numAge > 75) {
        errs.age = 'Please enter a valid age between 18 and 75.';
      }
    }

    // Email
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    // Phone: valid phone format
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid 10-digit phone number.';
    }

    // Password
    if (!password) {
      errs.password = 'Password is required';
    } else if (!isPasswordValid) {
      errs.password = 'Password does not meet required complexity standards.';
    }

    // Confirm Password
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // JAVASCRIPT VALIDATION: RECRUITER FORM
  const validateRecruiterForm = () => {
    const errs = {};

    // Name: letters and spaces only
    if (!fullName.trim()) {
      errs.fullName = 'Full Name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(fullName.trim())) {
      errs.fullName = 'Name must contain only letters and spaces.';
    }

    // Work Email
    if (!email.trim()) {
      errs.email = 'Work email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid work email address.';
    }

    // Phone: valid format
    if (!phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(phone.trim())) {
      errs.phone = 'Please enter a valid phone number.';
    }

    // Company Name
    if (!companyName.trim()) {
      errs.companyName = 'Company name is required';
    }

    // Password
    if (!password) {
      errs.password = 'Password is required';
    } else if (!isPasswordValid) {
      errs.password = 'Password does not meet required complexity standards.';
    }

    // Confirm Password
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // SUBMIT HANDLERS
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!loginIdentifier.trim()) {
      errs.loginIdentifier = 'Please enter your email or username';
    }
    if (!loginPassword) {
      errs.loginPassword = 'Please enter your password';
    }

    // CAPTCHA VALIDATION
    if (!userCaptchaInput.trim()) {
      errs.captcha = 'Security CAPTCHA verification is required.';
    } else if (userCaptchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      errs.captcha = 'Invalid CAPTCHA code. Please enter the exact characters shown in the box.';
      generateCaptcha();
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const expectedRole = viewMode === 'login-applicant' ? 'ROLE_CANDIDATE' : 'ROLE_COMPANY';
      await login(loginIdentifier, loginPassword, expectedRole);
      handleClose();
    } catch (err) {
      setErrors({ form: err.message || 'Login failed' });
      generateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplicantRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateApplicantForm()) return;

    setIsSubmitting(true);
    try {
      const res = await register({
        username: email.split('@')[0],
        email,
        password,
        fullName,
        age: Number(age),
        phone,
        role: 'ROLE_CANDIDATE'
      });
      if (res.otpCodeDemo) setOtpDemoHint(res.otpCodeDemo);
      setOtpTimer(300);
      setResendCooldown(60);
      setViewMode('email-verification');
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecruiterRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRecruiterForm()) return;

    setIsSubmitting(true);
    try {
      const res = await register({
        username: email.split('@')[0],
        email,
        password,
        fullName,
        phone,
        companyName,
        companyEmail: email,
        role: 'ROLE_COMPANY'
      });
      if (res.otpCodeDemo) setOtpDemoHint(res.otpCodeDemo);
      setOtpTimer(300);
      setResendCooldown(60);
      setViewMode('email-verification');
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP INPUT HANDLERS
  const handleOtpDigitChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    // Auto focus next box
    if (value && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length !== 6) {
      setErrors({ otp: 'Please enter all 6 digits of the OTP code.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.verifyOtp(email, enteredOtp);
      setSuccessMessage('Email verified successfully! Opening portal...');
      setTimeout(() => {
        if (onRoleSelected) onRoleSelected(selectedRole === 'ROLE_COMPANY' ? 'company' : 'candidate');
        handleClose();
      }, 1200);
    } catch (err) {
      setErrors({ otp: err.message || 'Invalid OTP code.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await api.sendOtp(email || resetEmail);
      if (res.otpCodeDemo) setOtpDemoHint(res.otpCodeDemo);
      setOtpTimer(300);
      setResendCooldown(60);
      setSuccessMessage('A new 6-digit OTP code has been sent to your email.');
    } catch (err) {}
  };

  // FORGOT PASSWORD HANDLERS
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      setErrors({ resetEmail: 'Please enter a valid email address.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.forgotPassword(resetEmail);
      if (res.otpCodeDemo) setOtpDemoHint(res.otpCodeDemo);
      setOtpTimer(300);
      setViewMode('reset-password');
    } catch (err) {
      setErrors({ resetEmail: err.message || 'No account found with this email.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!resetOtp || resetOtp.length !== 6) errs.resetOtp = 'Please enter valid 6-digit code.';
    if (!newPassword || newPassword.length < 8) errs.newPassword = 'Minimum 8 characters required.';
    if (confirmNewPassword !== newPassword) errs.confirmNewPassword = 'Passwords do not match.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.resetPassword(resetEmail, resetOtp, newPassword);
      setSuccessMessage('Password reset successfully! Please sign in with your new password.');
      setTimeout(() => {
        setViewMode('login-applicant');
      }, 1500);
    } catch (err) {
      setErrors({ resetOtp: err.message || 'Password reset failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        viewMode === 'role-select' ? 'Select Portal Access' :
        viewMode.startsWith('login') ? 'Sign In to TalentPulse' :
        viewMode.startsWith('register') ? 'Create Your Account' :
        viewMode === 'email-verification' ? 'Verify Your Email' :
        viewMode === 'otp-verification' ? 'Enter Verification Code' :
        'Account Password Recovery'
      }
      subtitle={
        viewMode === 'role-select' ? 'Choose whether you are a Job Seeker or Employer' :
        viewMode === 'email-verification' ? `We've sent a verification link to ${email}` :
        viewMode === 'otp-verification' ? 'Enter the 6-digit OTP code sent to your email' :
        'Manage your secure credentials for TalentPulse'
      }
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        
        {/* Global Error Banner */}
        {errors.form && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. ROLE SELECT SCREEN */}
        {viewMode === 'role-select' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-zinc-400 text-center font-medium">
              Continue as:
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setSelectedRole('ROLE_CANDIDATE'); setViewMode('register-applicant'); }}
                className="p-5 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-center transition-all group flex flex-col items-center gap-3 edge-glow-hover"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600">Candidate</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Job Seeker Portal</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setSelectedRole('ROLE_COMPANY'); setViewMode('register-recruiter'); }}
                className="p-5 rounded-2xl border-2 border-slate-200 dark:border-zinc-800 hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-center transition-all group flex flex-col items-center gap-3 edge-glow-hover"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-indigo-600">Recruiter</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Employer Portal</div>
                </div>
              </button>
            </div>

            <div className="pt-2 text-center text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setViewMode('login-applicant')}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign in here
              </button>
            </div>
          </div>
        )}

        {/* 2. ROLE-BASED LOGIN FORM WITH CAPTCHA */}
        {(viewMode === 'login-applicant' || viewMode === 'login-recruiter') && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Role Switcher Tabs */}
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-full border border-slate-200 dark:border-zinc-700 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('login-applicant')}
                className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'login-applicant' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm font-bold' : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Candidate Login
              </button>
              <button
                type="button"
                onClick={() => setViewMode('login-recruiter')}
                className={`flex-1 py-1.5 rounded-full transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'login-recruiter' ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold' : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" /> Recruiter Login
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                {viewMode === 'login-applicant' ? 'Email Address or Username' : 'Work Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder={viewMode === 'login-applicant' ? 'john.doe@example.com' : 'careers@google.com'}
                  className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                    errors.loginIdentifier ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-blue-500'
                  }`}
                />
              </div>
              {errors.loginIdentifier && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.loginIdentifier}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Password</label>
                <button
                  type="button"
                  onClick={() => setViewMode('forgot-password')}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                    errors.loginPassword ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-blue-500'
                  }`}
                />
              </div>
              {errors.loginPassword && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.loginPassword}</p>}
            </div>

            {/* MANDATORY SECURITY CAPTCHA VERIFICATION STEP */}
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Security CAPTCHA Verification
                </label>
                <span className="text-[10px] text-slate-400 dark:text-zinc-400 font-semibold uppercase">Human Check</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Visual CAPTCHA Box */}
                <div className="flex-1 bg-slate-900 dark:bg-zinc-950 text-white font-mono font-black text-lg tracking-[0.25em] py-2 px-3 rounded-xl select-none text-center shadow-inner relative overflow-hidden border border-slate-700">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:6px_6px]"></div>
                  <span className="relative z-10 drop-shadow">{captchaCode}</span>
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-2.5 rounded-xl bg-white dark:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-300 dark:border-zinc-600 transition-colors"
                  title="Refresh CAPTCHA Code"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                value={userCaptchaInput}
                onChange={(e) => setUserCaptchaInput(e.target.value)}
                placeholder="Enter 5-character CAPTCHA code"
                className={`w-full px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 font-mono uppercase tracking-wider ${
                  errors.captcha ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-blue-500'
                }`}
              />
              {errors.captcha && <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{errors.captcha}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-full text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                viewMode === 'login-applicant' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-slate-800'
              }`}
            >
              {isSubmitting ? 'Verifying Credentials...' : `Sign In to ${viewMode === 'login-applicant' ? 'Applicant' : 'Recruiter'} Portal`} <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Quick Demo Credentials Ref */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
              <div className="font-bold text-slate-700 dark:text-zinc-300">Demo Login Quick Ref:</div>
              <div>Applicant: <span className="font-mono text-slate-800 dark:text-zinc-200 font-semibold">john.doe@example.com</span> / <span className="font-mono text-slate-800 dark:text-zinc-200 font-semibold">john123</span></div>
              <div>Recruiter: <span className="font-mono text-slate-800 dark:text-zinc-200 font-semibold">careers@google.com</span> / <span className="font-mono text-slate-800 dark:text-zinc-200 font-semibold">google123</span></div>
            </div>

            <div className="text-center text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setViewMode('role-select')}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Register Now
              </button>
            </div>
          </form>
        )}

        {/* 3. APPLICANT REGISTRATION FORM (STRICT 18-75 AGE RANGE) */}
        {viewMode === 'register-applicant' && (
          <form onSubmit={handleApplicantRegisterSubmit} className="space-y-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <User className="w-4 h-4" /> Create Candidate Account
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                className={`w-full px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                  errors.fullName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-blue-500'
                }`}
              />
              {errors.fullName && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.fullName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Age (18–75)</label>
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  className={`w-full px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                    errors.age ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-blue-500'
                  }`}
                />
                {errors.age && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.age}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="5550192831"
                  className={`w-full px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                    errors.phone ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-blue-500'
                  }`}
                />
                {errors.phone && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Email Address</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.smith@example.com"
                className={`w-full px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-blue-500'
                }`}
              />
              {errors.email && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.email}</p>}
            </div>

            {/* Password & Requirements Live Checklist */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create strong password"
                className={`w-full px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-blue-500'
                }`}
              />
              
              <div className="mt-2 p-2 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 grid grid-cols-2 gap-1 text-[11px]">
                <div className={`flex items-center gap-1 font-medium ${passReqs.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {passReqs.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Minimum 8 characters
                </div>
                <div className={`flex items-center gap-1 font-medium ${passReqs.uppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {passReqs.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Uppercase letter
                </div>
                <div className={`flex items-center gap-1 font-medium ${passReqs.lowercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {passReqs.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Lowercase letter
                </div>
                <div className={`flex items-center gap-1 font-medium ${passReqs.number ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {passReqs.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Number digit
                </div>
                <div className={`flex items-center gap-1 font-medium ${passReqs.special ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {passReqs.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Special character
                </div>
              </div>
              {errors.password && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`w-full px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                  errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-blue-500'
                }`}
              />
              {errors.confirmPassword && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode('role-select')}
                className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 font-semibold"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md"
              >
                {isSubmitting ? 'Registering...' : 'Register Candidate Account'}
              </button>
            </div>
          </form>
        )}

        {/* 4. RECRUITER REGISTRATION FORM */}
        {viewMode === 'register-recruiter' && (
          <form onSubmit={handleRecruiterRegisterSubmit} className="space-y-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Create Recruiter Account
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sarah Jenkins"
                className={`w-full px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                  errors.fullName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-indigo-500'
                }`}
              />
              {errors.fullName && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Work Email Address</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.jenkins@company.com"
                className={`w-full px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-indigo-500'
                }`}
              />
              {errors.email && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="5550198822"
                  className={`w-full px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                    errors.phone ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-indigo-500'
                  }`}
                />
                {errors.phone && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Inc."
                  className={`w-full px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                    errors.companyName ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-indigo-500'
                  }`}
                />
                {errors.companyName && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.companyName}</p>}
              </div>
            </div>

            {/* Password & Requirements Live Checklist */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create strong password"
                className={`w-full px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-indigo-500'
                }`}
              />
              
              <div className="mt-2 p-2 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 grid grid-cols-2 gap-1 text-[11px]">
                <div className={`flex items-center gap-1 font-medium ${passReqs.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {passReqs.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Minimum 8 characters
                </div>
                <div className={`flex items-center gap-1 font-medium ${passReqs.uppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {passReqs.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Uppercase letter
                </div>
                <div className={`flex items-center gap-1 font-medium ${passReqs.lowercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {passReqs.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Lowercase letter
                </div>
                <div className={`flex items-center gap-1 font-medium ${passReqs.number ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {passReqs.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Number digit
                </div>
                <div className={`flex items-center gap-1 font-medium ${passReqs.special ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {passReqs.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} Special character
                </div>
              </div>
              {errors.password && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className={`w-full px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                  errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-indigo-500'
                }`}
              />
              {errors.confirmPassword && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode('role-select')}
                className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 font-semibold"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-slate-800 font-bold text-xs rounded-full shadow-md"
              >
                {isSubmitting ? 'Registering...' : 'Register Recruiter Account'}
              </button>
            </div>
          </form>
        )}

        {/* 5. EMAIL VERIFICATION NOTICE SCREEN WITH RESEND COOLDOWN */}
        {viewMode === 'email-verification' && (
          <div className="text-center space-y-4 py-2">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-800">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">Verify Your Email</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                We've sent a verification link and security code to <span className="font-bold text-slate-900 dark:text-zinc-100">{email}</span>.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs space-y-1 text-left">
              <div className="flex items-center justify-between font-bold text-slate-700 dark:text-zinc-300">
                <span>Verification Link Status:</span>
                <span className="text-amber-600 dark:text-amber-400">Pending Activation</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                Link expires in <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">{formatTimer(otpTimer)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setViewMode('otp-verification')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md flex items-center justify-center gap-1.5"
              >
                Enter 6-Digit OTP Code <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleResendOtp}
                  className={`font-semibold flex items-center gap-1 ${
                    resendCooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 dark:text-blue-400 hover:underline'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${resendCooldown > 0 ? 'animate-spin' : ''}`} /> 
                  {resendCooldown > 0 ? `Resend Cooldown (${resendCooldown}s)` : 'Resend Verification Email'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode(selectedRole === 'ROLE_COMPANY' ? 'register-recruiter' : 'register-applicant')}
                  className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 font-semibold"
                >
                  Update Email
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. 6-DIGIT OTP VERIFICATION SCREEN */}
        {viewMode === 'otp-verification' && (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-5 py-2">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Enter 6-Digit Code</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Segmented verification code sent to <span className="font-semibold text-slate-800 dark:text-zinc-200">{email}</span>
              </p>
            </div>

            {/* 6 Segmented Digit Inputs */}
            <div className="flex justify-center gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={otpInputRefs[idx]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-10 h-12 text-center text-lg font-black border-2 border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              ))}
            </div>
            {errors.otp && <p className="text-xs text-rose-600 dark:text-rose-400 text-center font-medium">{errors.otp}</p>}

            {/* Demo Hint Banner */}
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center text-xs text-blue-800 dark:text-blue-300">
              <span className="font-bold">Demo Verification Code:</span> <span className="font-mono font-black tracking-widest text-blue-900 dark:text-blue-200 text-sm">{otpDemoHint}</span> (or enter 123456)
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <span>Expires in: <strong className="text-slate-900 dark:text-zinc-100 font-mono">{formatTimer(otpTimer)}</strong></span>
              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={handleResendOtp}
                className={`font-semibold ${resendCooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 dark:text-blue-400 hover:underline'}`}
              >
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md"
            >
              {isSubmitting ? 'Verifying OTP...' : 'Verify Code & Activate Account'}
            </button>
          </form>
        )}

        {/* 7. FORGOT PASSWORD STEP 1 */}
        {viewMode === 'forgot-password' && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Reset Your Password</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Enter your registered email to receive a password reset code.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Registered Email</label>
              <input
                type="text"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="user@example.com"
                className={`w-full px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 ${
                  errors.resetEmail ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-300 dark:border-zinc-700 focus:ring-blue-500'
                }`}
              />
              {errors.resetEmail && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.resetEmail}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md"
            >
              {isSubmitting ? 'Sending Code...' : 'Send Password Reset Code'}
            </button>

            <div className="text-center text-xs">
              <button
                type="button"
                onClick={() => setViewMode('login-applicant')}
                className="text-slate-500 dark:text-zinc-400 hover:text-slate-800 font-semibold"
              >
                ← Return to Sign In
              </button>
            </div>
          </form>
        )}

        {/* 8. RESET PASSWORD STEP 2 */}
        {viewMode === 'reset-password' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">Create New Password</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Enter the OTP sent to {resetEmail} and your new password.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">6-Digit OTP Code</label>
              <input
                type="text"
                maxLength={6}
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 font-mono text-center tracking-widest text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.resetOtp && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.resetOtp}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars with complexity"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.newPassword && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.confirmNewPassword && <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">{errors.confirmNewPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-full shadow-md"
            >
              {isSubmitting ? 'Updating Password...' : 'Reset Password & Sign In'}
            </button>
          </form>
        )}

      </div>
    </Modal>
  );
};
