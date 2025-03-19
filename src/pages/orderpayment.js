import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../components/navbar/navbar1';
import Footer from '../components/footer/footer1';
import LoginPopup from '../components/loginpopup/loginpopup1';

import './orderpayment.css';
import '../components/cartpopup/cartpopup2.css';
import '../app/globals.css';
import './order2.css';

const OrderPayment = ({ cartItems = [], totalAmount, selectedAddress, userId }) => {
  const [payments, setPayments] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();

  useEffect(() => {
    const handleTokenExpiration = () => {
     
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setShowLogin(true);
      router.push('/'); // Redirect to the home page
    };

    const fetchPayments = async () => {
      try {
        const response = await axios.get('/api/paymentshow', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (response.data.success) {
          setPayments(response.data.data || []);
        } else if (response.data.error === 'Token expired') {
          handleTokenExpiration();
        } else {
          console.error('Failed to fetch payment methods:', response.data.message);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          handleTokenExpiration();
        } else {
          console.error('Error fetching payment methods:', error.message);
        }
      }
    };

    if (typeof window !== 'undefined') {
      const localStorageToken = localStorage.getItem('token');
      if (localStorageToken) {
        setToken(localStorageToken);
        setIsLoggedIn(true);
        fetchPayments();
      } else {
        setShowLogin(true);
        router.push('/');
      }
    }
  }, [token, router]);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setInputValue('');
    setErrorMessage('');
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setInputValue(value);
      setErrorMessage('');
    } else {
      setErrorMessage('Please enter a valid 12-digit UTR.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Start loading
    try {
      const token = localStorage.getItem('token'); 
      const orderResponse = await axios.post(
        '/api/order',
        {
          paymentMethod: selectedOption,
          UTR: selectedOption === 'CashOnDelivery' ? null : inputValue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      if (orderResponse.data.success) {
        const couponResponse = await axios.post(
          '/api/couponstatusupdate',
          { token, couponStatus: 'active' },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (couponResponse.data.success) {
          router.push('/MyOrder');
        } else {
          setError(couponResponse.data.message || 'Failed to update coupon status.');
        }
      } else {
        setError(orderResponse.data.message || 'Failed to place the order.');
      }
    } catch (error) {
      console.error('Error during submission:', error);
      setError('Your UTR Wrong. Please try again later.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowLogin(true);
    router.push('/');
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      {showLogin && !isLoggedIn && (
        <LoginPopup setShowLogin={setShowLogin} setIsLoggedIn={setIsLoggedIn} />
      )}
      {showPopup && (
        <div className="popup small-popup">
          <p>{error}</p>
          <button onClick={closePopup}>Close</button>
        </div>
      )}
      <div className='back-navbar'>
      <div className='app'>
        <div className="navbar-fixed">
          <Navbar
            isLoggedIn={isLoggedIn}
            setShowLogin={setShowLogin}
            handleLogout={handleLogout}
          />
          <div className="back-arrow">
            <FontAwesomeIcon 
              icon={faArrowLeft} 
              className="back-arrow-icon" 
              onClick={() => router.back()} 
            />
          </div>
        </div>
        </div>
        </div>
        <div className='app'>
        <div className='order-payment-wrapper'>
          <div className='order-payment-container'>
            <div className='column options-column'>
              <h1>Payment Options</h1>
              <div className='options-list'>
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <div
                      key={payment._id}
                      className={`option-item ${selectedOption === payment.title ? 'selected' : ''}`}
                      onClick={() => handleOptionChange(payment.title)}
                    >
                      <div className='circle'></div>
                      <span>{payment.title}</span>
                    </div>
                  ))
                ) : (
                  <p>Loading...</p>
                )}
                <div
                  className={`option-item ${selectedOption === 'CashOnDelivery' ? 'selected' : ''}`}
                  onClick={() => handleOptionChange('CashOnDelivery')}
                >
                  <div className='circle'></div>
                  <span>Cash on Delivery</span>
                </div>
              </div>
            </div>
            <div className='column details-column'>
              {selectedOption && (
                <div className='details-content'>
                  {selectedOption === 'CashOnDelivery' ? (
                    <div className='cash-on-delivery'>
                      <p>Selected Cash on Delivery. You can proceed to submit.</p>
                    </div>
                  ) : (
                    payments
                      .filter(payment => payment.title === selectedOption)
                      .map(payment => (
                        <div key={payment._id} className='payment-details'>
                          <img src={payment.imageUrl} alt={payment.title} className='payment-image' />
                          <div className='download'>
                            <a
                              href={payment.imageUrl}
                              download={`${payment.title}.png`}
                              className='download-link'
                            >
                              Download QR
                            </a>
                          </div>
                          <p>{payment.name}</p>
                          <label>
                            <input
                              type='text'
                              value={inputValue}
                              onChange={handleInputChange}
                              placeholder='Enter UTR 12-digit here'
                              className={`payment-input ${errorMessage ? 'input-error' : ''}`}
                              maxLength={12}
                              required
                            />
                          </label>
                          {errorMessage && <p className='error-message'>{errorMessage}</p>}
                        </div>
                      ))
                  )}
                </div>
              )}
              {selectedOption && (
                <button
                  onClick={handleSubmit}
                  className='submit-button1'
                  disabled={loading} // Disable button during loading
                >
                  {loading ? 'Processing...' : 'PLACE ORDER'}
                </button>
              )}
              {error && <p className='error-message'>{error}</p>}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderPayment;
