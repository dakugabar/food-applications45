
'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar/navbar1.js';
import '../app/globals.css';
import Footer from '../components/footer/footer1.js';
import LoginPopup from '../components/loginpopup/loginpopup1.js';
import './refundreturnpolicy2.css';

const TermsAndConditions = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    const userToken = localStorage.getItem('token');
    if (userToken) {
      setIsLoggedIn(true);
    } else {
      const timer = setTimeout(() => {
        setShowLogin(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setShowLogin(true);
  };

  return (
    <>
      
      {showLogin && !isLoggedIn && (
        <LoginPopup setShowLogin={setShowLogin} setIsLoggedIn={setIsLoggedIn} />
      )}
       <div className='back-navbar'>
      <div className='app'>
        <div className="navbar-fixed">
          <Navbar 
            isLoggedIn={isLoggedIn} 
            setShowLogin={setShowLogin} 
            handleLogout={handleLogout} 
           
          />
        </div>
        </div>
        </div>
        <div className='app'>
        <div className="policy-container">
      <div className="policy-header">
        <h1>Refund and Return Policy</h1>
        
      </div>

      <div className="policy-content">
        <h2>1. Overview</h2>
        <p>
          At Foodie Haven, customer satisfaction is our top priority. If you are not satisfied with your order, we are here to help. Please read our refund and return policy carefully.
        </p>

        <h2>2. Refund Eligibility</h2>
        <ul>
          <li>If the food item was delivered in poor condition or is incorrect.</li>
          <li>If the order was not delivered at the promised time (within a reasonable delay).</li>
          <li>If payment was processed but the order was not fulfilled.</li>
        </ul>

        <h2>3. Non-Refundable Cases</h2>
        <ul>
          <li>If you change your mind after placing the order.</li>
          <li>If the delivery address provided is incorrect or unreachable.</li>
          <li>Partial consumption of the food item makes it ineligible for a refund.</li>
        </ul>

        <h2>4. How to Request a Refund</h2>
        <p>
          To request a refund, please contact us within 24 hours of delivery. Provide your order ID and a description of the issue at <a href="mailto:support@foodiehaven.com">support@foodiehaven.com</a>.
        </p>

        <h2>5. Refund Process</h2>
        <p>
          Once we receive your request, our team will investigate the issue and process the refund if eligible. Refunds will be credited to your original payment method within 7-10 business days.
        </p>

        <h2>6. Replacement Policy</h2>
        <p>
          In case of a wrong or damaged delivery, we will offer a replacement at no extra cost. Contact our support team to initiate the process.
        </p>

        <h2>7. Cancellations</h2>
        <p>
          Orders can only be canceled before they are dispatched. Once the order is out for delivery, it cannot be canceled.
        </p>

        <h2>8. Contact Us</h2>
        <p>
          If you have any questions or concerns about our refund and return policy, please contact us at <a href="mailto:support@foodiehaven.com">support@foodiehaven.com</a>.
        </p>
      </div>
    </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsAndConditions;