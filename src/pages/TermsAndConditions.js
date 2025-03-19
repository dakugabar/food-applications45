// app/page.js
'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar/navbar1.js';
import '../app/globals.css';
import Footer from '../components/footer/footer1.js';
import LoginPopup from '../components/loginpopup/loginpopup1.js';
import './termsandconditions2.css';

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
        <div className="terms-container">
      <div className="terms-header">
        <h1>Terms and Conditions</h1>
        {/* <p>Effective Date: October 15, 2024</p> */}
      </div>

      <div className="terms-content">
        <h2>1. Introduction</h2>
        <p>Welcome to our food delivery website. By accessing or using our services, you agree to comply with these terms and conditions. Please read them carefully.</p>

        <h2>2. Eligibility</h2>
        <p>Our services are available only to individuals who are at least 18 years old. By using our services, you confirm that you meet this requirement.</p>

        <h2>3. Orders and Payments</h2>
        <ul>
          <li>All orders are subject to availability and confirmation of the order price.</li>
          <li>We reserve the right to refuse service or cancel orders if necessary.</li>
          <li>Payments must be made via the methods provided on our website.</li>
        </ul>

        <h2>4. Delivery</h2>
        <p>We strive to deliver your order within the estimated delivery time. However, delays may occur due to unforeseen circumstances.</p>

        <h2>5. Cancellation and Refund Policy</h2>
        <ul>
          <li>Orders can be canceled within 10 minutes of placing them.</li>
          <li>If an order is canceled after preparation, no refund will be provided.</li>
          <li>Refunds will be processed within 7 business days.</li>
        </ul>

        <h2>6. User Responsibilities</h2>
        <p>You agree to provide accurate information during the ordering process and maintain the confidentiality of your account credentials.</p>

        <h2>7. Limitation of Liability</h2>
        <p>We are not responsible for any direct, indirect, or incidental damages resulting from the use of our services beyond the order value.</p>

        <h2>8. Changes to Terms</h2>
        <p>We may update these terms and conditions from time to time. Continued use of the website signifies your acceptance of the updated terms.</p>

        <h2>9. Contact Us</h2>
        <p>If you have any questions about these terms, please contact us at support@foodwebsite.com.</p>
      </div>
    </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsAndConditions;