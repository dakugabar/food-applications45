import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faKey, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './adminlogin.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // State to store the previous page URL
  const [redirectUrl, setRedirectUrl] = useState('/AdminPanel'); // Default to /AdminPanel

  useEffect(() => {
    // Capture the redirect query parameter if it exists
    const redirect = router.query.redirect;
    if (redirect) {
        setRedirectUrl(redirect); // Save the redirect URL
    }
}, [router.query.redirect]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/loginadmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok) {
        document.cookie = `adminId=${result.token}; path=/; max-age=3600`; // Store adminId in a cookie

        // Redirect to the stored redirect URL
        router.push(redirectUrl);
      } else {
        setError(result.message || 'Invalid credentials.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login">
      <img src="food8.jpg" alt="Login Background" className="login__img" />

      <form onSubmit={handleLogin} className="login__form">
        <h1 className="login__title">Admin Login</h1>

        <div className="login__content">
          <div className="login__box">
            <FontAwesomeIcon icon={faLock} className="login__icon" />
            <div className="login__box-input">
              <input
                type="text"
                required
                className={`login__input ${username ? "filled" : ""}`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label htmlFor="" className={`login__label ${username ? "hidden" : ""}`}>
                Username
              </label>
            </div>
          </div>

          <div className="login__box">
            <FontAwesomeIcon icon={faKey} className="login__icon" />
            <div className="login__box-input">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className={`login__input ${password ? "filled" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="" className={`login__label ${password ? "hidden" : ""}`}>
                Password
              </label>
              <FontAwesomeIcon
                onClick={togglePasswordVisibility}
                icon={showPassword ? faEyeSlash : faEye}
                className="login__eye"
              />
            </div>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="login__button" disabled={loading}>
          {loading ? (
            <div className="spinner-login">
              <div className="spinner"></div>
            </div>
          ) : (
            'Login'
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
