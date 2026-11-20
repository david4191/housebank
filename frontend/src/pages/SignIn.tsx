import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button.tsx';
import AuthTitle from '../components/AuthTitle.tsx';
import useAuth from '../hooks/useAuth.tsx';
import { roleHomePath } from '../context/AuthContext.tsx';

export const authInputStyle = `w-full h-12 bg-[color:var(--color-bg)] border border-[color:var(--color-border)]
              rounded-md px-4 text-base text-[color:var(--color-dark)] placeholder-[color:var(--color-gray)]
              outline-none focus:ring-2 focus:ring-[color:var(--color-green)] focus:border-[color:var(--color-green)] transition-all`;

export const authContainerStyle = `w-full md:w-3/5 h-full flex flex-col place-content-center px-6 sm:px-10 md:px-12`;

export const authOTPInputStyle = `w-10 h-10 sm:w-12 sm:h-12 bg-[color:var(--color-white)] border border-[color:var(--color-border)] rounded-md text-center text-lg sm:text-xl font-semibold
text-[color:var(--color-dark)] outline-none focus:ring-2 focus:ring-[color:var(--color-green)] focus:border-[color:var(--color-green)] transition-all`;

import Seo from '../components/Seo.tsx';

interface SignInLocationState {
  passwordReset?: boolean;
  from?: { pathname?: string };
}

export default function SignIn() {
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Second-factor step — only entered when the account has 2FA enabled.
  // loginInUser stops short of issuing tokens on such accounts and hands
  // back a short-lived pending_token instead (see hb-backend's
  // POST /auth/signin and POST /auth/2fa/verify-login).
  const [step, setStep] = useState<'credentials' | 'twoFactor'>('credentials');
  const [pendingToken, setPendingToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as SignInLocationState | null;
  const passwordWasReset = Boolean(locationState?.passwordReset);

  const handleSubmit = async () => {
    if (submitting) return;
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email or phone number and password.');
      return;
    }

    setSubmitting(true);
    const result = await auth.login({ userName: email.trim(), password, rememberMe });
    setSubmitting(false);

    if (result.ok) {
      const redirectTo = locationState?.from?.pathname || roleHomePath(result.user.role);
      navigate(redirectTo, { replace: true });
      return;
    }

    if ('requires2fa' in result) {
      const twoFactorResult = result as { ok: false; requires2fa: true; pendingToken: string };
      setPendingToken(twoFactorResult.pendingToken);
      setStep('twoFactor');
      return;
    }

    const failure = result as { ok: false; message: string; requiresVerification?: boolean; userId?: number };
    if (failure.requiresVerification && failure.userId) {
      navigate(`/verify-otp?userId=${failure.userId}`, { state: { userId: failure.userId, purpose: 'signup_verification' } });
      return;
    }

    setError(failure.message);
  };

  const handleVerifyTwoFactor = async () => {
    if (verifying) return;
    setTwoFactorError('');

    if (!twoFactorCode.trim()) {
      setTwoFactorError('Enter the code we emailed you.');
      return;
    }

    setVerifying(true);
    const result = await auth.verifyTwoFactorLogin(pendingToken, twoFactorCode.trim(), rememberMe);
    setVerifying(false);

    if (result.ok) {
      const redirectTo = locationState?.from?.pathname || roleHomePath(result.user.role);
      navigate(redirectTo, { replace: true });
      return;
    }

    setTwoFactorError(result.message);
  };

  const backToCredentials = () => {
    setStep('credentials');
    setPendingToken('');
    setTwoFactorCode('');
    setTwoFactorError('');
  };

  if (step === 'twoFactor') {
    return (
      <div className={authContainerStyle}>
        <AuthTitle
          headerText="Two-Factor Verification"
          subtitle="You don't have an account?"
          linkText="Sign Up"
          linkTo="/signup"
        />
        <div>
          <div className="mb-8 w-full">
            <label className="block mb-6 font-medium text-[color:var(--color-dark)] text-base">
              Enter the code we emailed you
            </label>
            <input
              type="text"
              className={authInputStyle}
              placeholder="6-digit code or recovery code"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyTwoFactor()}
              autoFocus
            />
            <p className="mt-3 text-sm text-gray-500">
              Lost access to your email? Use one of your recovery codes instead.
            </p>
          </div>

          {twoFactorError && <p className="mb-4 text-sm text-red-600">{twoFactorError}</p>}
        </div>
        <div className="w-full sm:w-2/5 mt-8">
          <Button text={verifying ? 'Verifying…' : 'Verify'} onClick={handleVerifyTwoFactor} disabled={verifying} />
        </div>
        <div className="w-full sm:w-2/5 mt-8">
          <Button text="Back" onClick={backToCredentials} variant="link" />
        </div>
      </div>
    );
  }

  return (
    <div className={authContainerStyle}>
      <Seo title="Sign In" description="Sign in to your HouseBank account." noindex />
      <AuthTitle
        headerText="Sign In"
        subtitle="You don't have an account?"
        linkText="Sign Up"
        linkTo="/signup"
      />
      <div>
        {passwordWasReset && (
          <p className="mb-6 text-sm text-green-700">
            Your password has been reset. Please sign in with your new password.
          </p>
        )}
        {/* Email Address */}
        <div className="mb-8 w-full">
          <label className="block mb-6 font-medium text-[color:var(--color-dark)] text-base" htmlFor="signin-identifier">
            Email or Phone Number
          </label>
          <input
            id="signin-identifier"
            type="text"
            className={authInputStyle}
            placeholder="Enter your email or phone number"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-8 w-full">
          <label className="block mb-3 font-medium text-[color:var(--color-dark)] text-base">
            Password
          </label>
          <input
            type="password"
            className={authInputStyle}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <div className="mt-3 text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-[color:var(--color-green)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="mb-8 w-full">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 accent-green-700"
            />
            Remember me on this device
          </label>
        </div>
      </div>
      <div className="w-full sm:w-2/5 mt-8">
        <Button text={submitting ? 'Signing in…' : 'Sign In'} onClick={handleSubmit} disabled={submitting} />
      </div>
    </div>
  );
}
