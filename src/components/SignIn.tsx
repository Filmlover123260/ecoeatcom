import React, { useState } from 'react';
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  Palette,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { UserProfile } from '../types';
import { initialUserProfile, AVAILABLE_GRADES, GRADE_DIVISIONS } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, SupportedLanguage } from '../context/LanguageContext';
import { EcoEatLogo } from './EcoEatLogo';
import { CAMPUS_LINKS } from '../utils/urlHelper';
import { ExternalLink } from 'lucide-react';
import { registerStudentAccount, authenticateStudentAccount } from '../lib/authService';

interface SignInProps {
  onSignInSuccess: (userProfile: UserProfile) => void;
  onOpenThemePicker?: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSignInSuccess, onOpenThemePicker }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('Grade 9');
  const [section, setSection] = useState('A');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!emailOrId.trim()) {
      setErrorMessage('Please enter your BBS PIK Student Email or Student ID');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your account password');
      return;
    }

    setLoading(true);

    try {
      const resolvedUser = await authenticateStudentAccount(emailOrId, password);

      if (rememberMe) {
        localStorage.setItem('ecoeat_saved_email', emailOrId);
      } else {
        localStorage.removeItem('ecoeat_saved_email');
      }

      onSignInSuccess(resolvedUser);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please provide your full student name');
      return;
    }
    if (!emailOrId.trim()) {
      setErrorMessage('Please provide a valid BBS PIK student email');
      return;
    }
    if (!emailOrId.includes('@')) {
      setErrorMessage('Please provide a valid BBS PIK email (e.g. name@bbs-pik.edu)');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password should be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const newUser = await registerStudentAccount({
        fullName: fullName.trim(),
        email: emailOrId.trim(),
        password,
        grade,
        section,
      });

      setSuccessMessage('Student account created successfully! Signing in...');
      setTimeout(() => {
        onSignInSuccess(newUser);
      }, 600);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Account registration failed. Copying existing student accounts is prohibited.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-theme-bg text-theme-main flex flex-col justify-between selection:bg-theme-primary/30 transition-colors duration-300">
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <EcoEatLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-theme-main">EcoEat</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-theme-primary-bg text-theme-primary border border-theme-primary-border">
                BBS PIK
              </span>
            </div>
            <p className="text-xs text-theme-muted hidden sm:block">Campus Sustainability & Nutrition Hub</p>
          </div>
        </div>

        {/* Quick Utility Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative flex items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              aria-label="Select Language"
              className="appearance-none bg-theme-card border border-theme-card rounded-xl py-1.5 pl-7 pr-4 text-xs font-bold text-theme-main cursor-pointer hover:bg-theme-card-subtle focus:outline-none"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.name} className="bg-slate-900 text-white">
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
            <Globe className="w-3.5 h-3.5 text-theme-primary absolute left-2.5 pointer-events-none" />
          </div>

          {/* Theme Picker Trigger */}
          {onOpenThemePicker && (
            <button
              onClick={onOpenThemePicker}
              title="Change Color Theme"
              className="p-2 rounded-xl bg-theme-card border border-theme-card text-theme-primary hover:bg-theme-card-subtle transition-colors cursor-pointer"
            >
              <Palette className="w-4 h-4" />
            </button>
          )}

          {/* Dark/Light Mode */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-theme-card border border-theme-card text-theme-main hover:bg-theme-card-subtle transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </div>
      </header>

      {/* Main Sign In Container */}
      <main className="w-full max-w-5xl mx-auto px-4 py-4 sm:py-8 flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          
          {/* Left Column: Campus Sustainability Brand & Value Pitch */}
          <div className="lg:col-span-5 space-y-6 text-left hidden md:block">
            <div className="flex items-center gap-3.5">
              <EcoEatLogo size="lg" />
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-primary-bg border border-theme-primary-border text-theme-primary text-xs font-extrabold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bina Bangsa School PIK</span>
                </div>
                <p className="text-[11px] text-theme-muted font-semibold mt-1">Official Campus Dining & Zero Waste Hub</p>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-theme-main leading-tight">
                Turn Every Meal into <span className="text-theme-primary">Campus Eco-Impact</span>
              </h1>
              <p className="text-sm text-theme-muted leading-relaxed">
                Scan your dining plate, minimize food waste, earn XP for your grade, and help BBS PIK achieve its 1,000kg zero-waste semester goal.
              </p>
            </div>

            {/* Campus Impact Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-theme-card border border-theme-card space-y-1">
                <span className="text-2xl font-black text-theme-primary">1,240+</span>
                <p className="text-xs text-theme-muted font-medium">Active Students</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-theme-card border border-theme-card space-y-1">
                <span className="text-2xl font-black text-theme-primary">650 kg</span>
                <p className="text-xs text-theme-muted font-medium">Food Diverted</p>
              </div>
            </div>

            {/* Feature Badges */}
            <div className="space-y-2.5 pt-1 text-xs text-theme-muted">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-theme-primary shrink-0" />
                <span>Single Sign-On with BBS PIK Student ID & Email</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-theme-primary shrink-0" />
                <span>AI Vision camera for automated portion and clean-plate tracking</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-theme-primary shrink-0" />
                <span>Real-time Inter-Grade Rankings & Campus Dining Credits</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-7 w-full max-w-md mx-auto">
            <div className="bg-theme-card border border-theme-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl">
              
              {/* Card Mode Tabs (Anti-Copy Enforced: Official Student Accounts Only) */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-theme-card-subtle border border-theme-card rounded-2xl">
                <button
                  type="button"
                  id="tab-auth-signin"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-theme-primary text-black shadow-sm font-black'
                      : 'text-theme-muted hover:text-theme-main'
                  }`}
                >
                  Student Sign In
                </button>

                <button
                  type="button"
                  id="tab-auth-signup"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-theme-primary text-black shadow-sm font-black'
                      : 'text-theme-muted hover:text-theme-main'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Anti-Copy Protection Integrity Notice */}
              <div className="p-2.5 rounded-xl bg-theme-card-subtle border border-theme-primary-border/40 flex items-center gap-2 text-[11px] text-theme-muted">
                <ShieldCheck className="w-4 h-4 text-theme-primary shrink-0" />
                <span>
                  <strong className="text-theme-main">Account Verification:</strong> 1 official account per BBS PIK student. Account copying or duplicate registration is prohibited.
                </span>
              </div>

              {/* Success Alert Message */}
              {successMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Error Alert Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* MODE 1: SIGN IN FORM */}
              {authMode === 'signin' && (
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-theme-muted block" htmlFor="input-email-id">
                      BBS PIK Student Email or ID
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-theme-muted absolute left-3.5 pointer-events-none" />
                      <input
                        id="input-email-id"
                        type="text"
                        value={emailOrId}
                        onChange={(e) => setEmailOrId(e.target.value)}
                        placeholder="e.g. student.name@bbs-pik.edu"
                        className="w-full bg-theme-card-subtle border border-theme-card rounded-2xl py-3 pl-10 pr-4 text-sm text-theme-main placeholder:text-theme-muted/50 focus:outline-none focus:border-theme-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-theme-muted block" htmlFor="input-password">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(emailOrId);
                          setIsForgotModalOpen(true);
                        }}
                        className="text-[11px] font-bold text-theme-primary hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-theme-muted absolute left-3.5 pointer-events-none" />
                      <input
                        id="input-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-theme-card-subtle border border-theme-card rounded-2xl py-3 pl-10 pr-11 text-sm text-theme-main placeholder:text-theme-muted/50 focus:outline-none focus:border-theme-primary transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 p-1 text-theme-muted hover:text-theme-main transition-colors cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-theme-muted cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded accent-theme-primary cursor-pointer"
                      />
                      <span>Remember my student login</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    id="btn-submit-signin"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-theme-primary text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-theme-glow cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Campus Hub</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-theme-muted">
                      New to BBS PIK EcoEat?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('signup')}
                        className="font-bold text-theme-primary hover:underline cursor-pointer"
                      >
                        Create Student Account
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* MODE 2: REGISTER / SIGN UP */}
              {authMode === 'signup' && (
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-theme-muted block" htmlFor="input-signup-name">
                      Full Student Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-theme-muted absolute left-3.5 pointer-events-none" />
                      <input
                        id="input-signup-name"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Maya Lin"
                        className="w-full bg-theme-card-subtle border border-theme-card rounded-2xl py-3 pl-10 pr-4 text-sm text-theme-main placeholder:text-theme-muted/50 focus:outline-none focus:border-theme-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-theme-muted block" htmlFor="select-grade">
                        Grade
                      </label>
                      <div className="relative flex items-center">
                        <GraduationCap className="w-4 h-4 text-theme-muted absolute left-3.5 pointer-events-none" />
                        <select
                          id="select-grade"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full bg-theme-card-subtle border border-theme-card rounded-2xl py-3 pl-10 pr-3 text-sm text-theme-main focus:outline-none focus:border-theme-primary transition-colors cursor-pointer"
                        >
                          {GRADE_DIVISIONS.map((division) => (
                            <optgroup
                              key={division.name}
                              label={division.label}
                              className="bg-slate-900 text-white font-bold"
                            >
                              {division.grades.map((g) => (
                                <option key={g} value={g} className="bg-slate-900 text-white font-medium">
                                  {g}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-theme-muted block" htmlFor="select-section">
                        Section / Homeroom
                      </label>
                      <select
                        id="select-section"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                        className="w-full bg-theme-card-subtle border border-theme-card rounded-2xl py-3 px-3.5 text-sm text-theme-main focus:outline-none focus:border-theme-primary transition-colors cursor-pointer"
                      >
                        <option value="A" className="bg-slate-900 text-white">Section A ({grade}-A)</option>
                        <option value="B" className="bg-slate-900 text-white">Section B ({grade}-B)</option>
                        <option value="C" className="bg-slate-900 text-white">Section C ({grade}-C)</option>
                        <option value="D" className="bg-slate-900 text-white">Section D ({grade}-D)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-theme-muted block" htmlFor="input-signup-email">
                      School Email
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-theme-muted absolute left-3.5 pointer-events-none" />
                      <input
                        id="input-signup-email"
                        type="email"
                        value={emailOrId}
                        onChange={(e) => setEmailOrId(e.target.value)}
                        placeholder="student@bbs-pik.edu"
                        className="w-full bg-theme-card-subtle border border-theme-card rounded-2xl py-3 pl-10 pr-4 text-sm text-theme-main placeholder:text-theme-muted/50 focus:outline-none focus:border-theme-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-theme-muted block" htmlFor="input-signup-password">
                      Create Password
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-theme-muted absolute left-3.5 pointer-events-none" />
                      <input
                        id="input-signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-theme-card-subtle border border-theme-card rounded-2xl py-3 pl-10 pr-11 text-sm text-theme-main placeholder:text-theme-muted/50 focus:outline-none focus:border-theme-primary transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 p-1 text-theme-muted hover:text-theme-main transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="btn-submit-signup"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-theme-primary text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-theme-glow cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Join Campus Eco Program (+50 XP)</span>
                        <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-1 text-center space-y-2">
                    <p className="text-[11px] text-theme-muted">
                      By registering, you agree to the{' '}
                      <a
                        href={CAMPUS_LINKS.SUSTAINABILITY_CHARTER}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-theme-primary hover:underline font-medium"
                      >
                        Sustainability Charter
                      </a>{' '}
                      and{' '}
                      <a
                        href={CAMPUS_LINKS.PRIVACY_POLICY}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-theme-primary hover:underline font-medium"
                      >
                        Privacy Policy
                      </a>.
                    </p>
                    <p className="text-xs text-theme-muted">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('signin')}
                        className="font-bold text-theme-primary hover:underline cursor-pointer"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-theme-card border-t sm:border border-theme-card rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            <div className="w-12 h-1.5 bg-theme-muted/40 rounded-full mx-auto sm:hidden -mt-1 mb-1 shrink-0" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-theme-primary" />
                <h3 className="text-base font-extrabold text-theme-main">Reset Student Password</h3>
              </div>
              <button
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotPasswordSent(false);
                }}
                className="p-1 rounded-full text-theme-muted hover:text-theme-main cursor-pointer"
              >
                ✕
              </button>
            </div>

            {forgotPasswordSent ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-sm">Password Reset Link Dispatched!</p>
                <p className="text-theme-muted text-xs">
                  We sent instructions to <span className="font-semibold text-theme-main">{forgotEmail || 'your email'}</span>. Follow the campus link to choose a new password.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotPasswordSent(false);
                  }}
                  className="mt-3 w-full py-2.5 rounded-xl bg-theme-primary text-black font-extrabold text-xs cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-theme-muted leading-relaxed">
                  Enter your registered BBS PIK student email address. We will send a secure one-time reset code to your school inbox.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-theme-muted">Student Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@bbs-pik.edu"
                    className="w-full bg-theme-card-subtle border border-theme-card rounded-2xl py-3 px-4 text-sm text-theme-main focus:outline-none focus:border-theme-primary"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 py-3 rounded-2xl bg-theme-card-subtle text-theme-main font-bold text-xs hover:bg-black/20 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!forgotEmail.trim()) {
                        alert('Please enter your student email');
                        return;
                      }
                      setForgotPasswordSent(true);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-theme-primary text-black font-extrabold text-xs shadow-md cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer with verified https:// anchor tags */}
      <footer className="w-full max-w-6xl mx-auto px-4 py-6 text-center text-xs text-theme-muted border-t border-theme-card/50 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
          <a
            id="signin-footer-bbs"
            href={CAMPUS_LINKS.BBS_HOME}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-theme-primary transition-colors inline-flex items-center gap-1"
          >
            <span>Bina Bangsa School</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            id="signin-footer-pik"
            href={CAMPUS_LINKS.BBS_PIK_CAMPUS}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-theme-primary transition-colors inline-flex items-center gap-1"
          >
            <span>PIK Campus</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            id="signin-footer-sustainability"
            href={CAMPUS_LINKS.SUSTAINABILITY_CHARTER}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-theme-primary transition-colors inline-flex items-center gap-1"
          >
            <span>Sustainability Charter</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            id="signin-footer-privacy"
            href={CAMPUS_LINKS.PRIVACY_POLICY}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-theme-primary transition-colors inline-flex items-center gap-1"
          >
            <span>Privacy Policy</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            id="signin-footer-terms"
            href={CAMPUS_LINKS.TERMS_OF_SERVICE}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-theme-primary transition-colors inline-flex items-center gap-1"
          >
            <span>Terms of Service</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-[11px] text-theme-muted/80">
          BBS PIK EcoEat • Campus Sustainability & Food Waste Diversion Program 2026
        </p>
      </footer>
    </div>
  );
};
