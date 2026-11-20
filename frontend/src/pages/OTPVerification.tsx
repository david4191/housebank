import { useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AuthTitle from '../components/AuthTitle.tsx';
import Button from '../components/Button.tsx';
import { authContainerStyle, authOTPInputStyle } from './SignIn.tsx';
import useAuth from '../hooks/useAuth.tsx';
import { roleHomePath } from '../context/AuthContext.tsx';
import Seo from '../components/Seo.tsx';

const CODE_LENGTH = 6; // matches the backend's 6-digit OTP (see hb-backend/src/models/OtpCode.js)

interface OTPVerificationLocationState {
  userId?: number;
}

const resendErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object') {
    if ('data' in error && error.data && typeof error.data === 'object' && 'message' in error.data) {
      const { message } = error.data;
      if (typeof message === 'string') return message;
    }
    if ('message' in error && typeof error.message === 'string') return error.message;
  }
  return 'Could not resend the code. Please try again.';
};

export default function OTPVerification() {
  const [otp, setOtp] = useState<string[]>(new Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<HTMLInputElement[]>([]);

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const stateUserId = (location.state as OTPVerificationLocationState | null)?.userId;
  const paramUserId = searchParams.get('userId');
  const parsedUserId = paramUserId ? Number(paramUserId) : undefined;
  const candidateUserId = stateUserId ?? parsedUserId;
  const userId = Number.isSafeInteger(candidateUserId) && Number(candidateUserId) > 0
    ? Number(candidateUserId)
    : undefined;

  const handleOtpChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH - index);
    const newOtp = [...otp];
    if (!digits) {
      if (value) return;
      newOtp[index] = '';
      setOtp(newOtp);
      setError('');
      setNotice('');
      return;
    }
    digits.split('').forEach((digit, offset) => {
      newOtp[index + offset] = digit;
    });
    setOtp(newOtp);
    setError('');
    setNotice('');
    inputsRef.current[Math.min(index + digits.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleOtpPaste = (index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    event.preventDefault();
    handleOtpChange(index, pasted);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setError('');
    setNotice('');

    if (!userId) {
      setError('We lost track of which account this is for — please sign up again.');
      return;
    }

    const code = otp.join('');
    if (code.length !== CODE_LENGTH) {
      setError(`Please enter the full ${CODE_LENGTH}-digit code.`);
      return;
    }

    setSubmitting(true);
    const result = await auth.verifyOtp(userId, code);
    setSubmitting(false);

    if (result.ok) {
      navigate(roleHomePath(result.user.role), { replace: true });
      return;
    }
    setError(result.message);
  };

  const handleResend = async () => {
    setError('');
    setNotice('');
    if (!userId) {
      setError('We lost track of which account this is for — please sign up again.');
      return;
    }
    setResending(true);
    try {
      await auth.resendOtp(userId, 'signup_verification');
      setNotice('A new code has been sent to your email.');
    } catch (error) {
      setError(resendErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={authContainerStyle}>
      <Seo title="OTP Verification" description="Verify your HouseBank account." noindex />
      <AuthTitle
        headerText="OTP Verification"
        subtitle="You don't have an account?"
        linkText="Sign Up"
        linkTo="/signup"
      />
      <div>
        {/* OTP Input Section */}
        <div className="mb-8 w-full">
          <label id="otp-label" className="block mb-6 font-medium text-gray-800 text-[19px]">
            Enter {CODE_LENGTH}-digit Code
          </label>
          <div className="flex gap-2 sm:gap-3 justify-start" role="group" aria-labelledby="otp-label">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'otp-error' : undefined}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                className={authOTPInputStyle}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onPaste={(e) => handleOtpPaste(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => {
                  if (el) inputsRef.current[index] = el;
                }}
                autoFocus={index === 0}
              />
            ))}
          </div>
        </div>
        {error && <p id="otp-error" className="mb-4 text-sm text-red-600" role="alert">{error}</p>}
        {notice && <p className="mb-4 text-sm text-green-700" role="status">{notice}</p>}
      </div>
      <div className="w-full sm:w-2/5 mt-8">
        <Button text={submitting ? 'Verifying…' : 'Verify'} onClick={handleVerify} disabled={submitting || resending} />
      </div>
      <div className="w-full sm:w-2/5 mt-8">
        <Button
          text={resending ? 'Resending…' : 'Resend Code'}
          onClick={handleResend}
          variant="link"
          disabled={resending || submitting}
        />
      </div>
    </div>
  );
}
