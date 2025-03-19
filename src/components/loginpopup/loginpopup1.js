'use client';
import React, { useState, useEffect, useRef } from 'react';
import './loginpopup2.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const countryCodes = [
  { code: '+91', flag: '🇮🇳' },
  { code: '+1', flag: '🇺🇸' },
  { code: '+44', flag: '🇬🇧' },
];

const OTP_EXPIRY_TIME = 60; // 1 minute for OTP expiration countdown
const EXTENDED_EXPIRY_TIME = 15 * 60; // 15 minutes for extended wait time
const TOKEN_EXPIRY_TIME = 3600 * 1000; // 1 hour for token expiration

const LoginPopup = ({ setShowLogin, setIsLoggedIn }) => {
  const [currentState, setCurrentState] = useState('Enter details');
  const [formData, setFormData] = useState({
    mobileNumber: '',
    countryCode: '+91',
    otp: '',
  });
  const [error, setError] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isOtpFocused, setIsOtpFocused] = useState(false);

  const otpInputRef = useRef(null);

  useEffect(() => {
    if (isOtpSent && otpExpiry > 0) {
      const timer = setInterval(() => {
        setOtpExpiry((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOtpSent, otpExpiry]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setFormData({ ...formData, otp: value });
    }
  };

  const isSendOtpEnabled = formData.mobileNumber.length === 10;
  const isVerifyOtpEnabled = formData.otp.length === 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (currentState === 'Enter details') {
        if (!/^\d{10}$/.test(formData.mobileNumber)) {
          setError('Please enter a valid 10-digit mobile number');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobileNumber: `${formData.countryCode}${formData.mobileNumber}`,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to send OTP');
        }

        setIsOtpSent(true);
        setOtpExpiry(OTP_EXPIRY_TIME);
        setCurrentState('Verify OTP');
        toast.success('OTP sent successfully');
      } else if (currentState === 'Verify OTP') {
        const otpCode = formData.otp;

        if (otpCode.length !== 6) {
          setError('Please enter the complete OTP');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobileNumber: `${formData.countryCode}${formData.mobileNumber}`,
            otp: otpCode,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invalid OTP');
        }

        const now = new Date().getTime();
        const tokenExpiry = now + TOKEN_EXPIRY_TIME;
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenExpiry', tokenExpiry);

        toast.success('Login successful');
        setIsLoggedIn(true);
        setShowLogin(false);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpExpiry > 0) {
      toast.info('Please wait until the OTP expires');
      return;
    }

    if (resendAttempts >= 3) {
      setOtpExpiry(EXTENDED_EXPIRY_TIME);
      toast.warning('Too many attempts. Please try again after 15 minutes.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: `${formData.countryCode}${formData.mobileNumber}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setOtpExpiry(OTP_EXPIRY_TIME);
      setResendAttempts((prev) => prev + 1);
      toast.success('OTP resent successfully');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return minutes > 0 ? `${minutes}m:${seconds}s` : `${seconds}s`;
  };

  return (
    <div className="login-popup">
      <ToastContainer />
      <form className="login-popup-container" onSubmit={handleSubmit}>
        <div className="login-popup-title">
          <h2>{currentState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src="/cross_icon.png"
            alt="Close"
            className="login-cross"
          />
        </div>
        {error && <p className="error">{error}</p>}
        <div className="login-popup-inputs">
          {currentState === 'Enter details' && (
            <>
              <div className="country-code-dropdown">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                >
                  {countryCodes.map((country, index) => (
                    <option key={index} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <div className="mobile-number-input">
                  <input
                    type="number"
                    name="mobileNumber"
                    placeholder="Your mobile number"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    disabled={isOtpSent}
                    required
                    pattern="\d{10}"
                    onFocus={() => setIsOtpFocused(true)}
                    title="Please enter exactly 10 digits."
                  />
                   
                </div>
              </div>
            </>
          )}
        {isOtpSent && (
  <div className="otp-input">
    <input
      type={isOtpFocused ? "text" : "password"}
      name="otp"
      placeholder= "•  •  •  •  •  •"
      value={formData.otp}
      onChange={handleOtpChange}
      onFocus={() => setIsOtpFocused(true)}
      onBlur={() => setIsOtpFocused(false)}
      required
    />
  
  </div>
)}
        </div>
        <div className="button-container">
          {!isOtpSent && (
            <button type='submit' disabled={!isSendOtpEnabled || loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
          )}
          {isOtpSent && (
            <button type='submit' disabled={!isVerifyOtpEnabled || loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          )}
          {isOtpSent && otpExpiry > 0 && (
            <p className="otp-expiry-info">Resend OTP in: {formatTime(otpExpiry)}</p>
          )}
        </div>
        {isOtpSent && otpExpiry === 0 && (
          <p className="resend-otp">
            Didn’t receive code?{' '}
            <span className="request-again" onClick={handleResendOtp}>
              Request again
            </span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
