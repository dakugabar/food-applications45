
'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar/navbar1.js';
import '../app/globals.css';
import Footer from '../components/footer/footer1.js';
import LoginPopup from '../components/loginpopup/loginpopup1.js';

import './privacypolicy2.css';

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
        <div className="privacy-container">
      <div className="privacy-header">
        <h1>Privacy Policy</h1>
        {/* <p>Effective Date: October 15, 2024</p> */}
      </div>

      <div className="privacy-content">
        <h2>1. Introduction</h2>
        <p>We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information.</p>

        <h2>2. Information We Collect</h2>
        <ul>
          <li>Personal information: Name, email, phone number, address, etc.</li>
          <li>Payment information: Credit/debit card details (processed securely).</li>
          <li>Order history: Previous orders and interactions with the website.</li>
          <li>Location data: For delivery purposes with your consent.</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To process and deliver your orders.</li>
          <li>To improve our services and user experience.</li>
          <li>To send you promotional offers and updates.</li>
          <li>To ensure compliance with legal obligations.</li>
        </ul>

        <h2>4. Data Sharing</h2>
        <p>We do not share your personal data with third parties, except:</p>
        <ul>
          <li>With payment gateways for secure payment processing.</li>
          <li>With delivery partners to fulfill your orders.</li>
          <li>When required by law or to prevent fraud.</li>
        </ul>

        <h2>5. Data Retention</h2>
        <p>We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy, or as required by law.</p>

        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access and update your personal information.</li>
          <li>Request the deletion of your personal data.</li>
          <li>Opt out of marketing communications.</li>
        </ul>

        <h2>7. Security</h2>
        <p>We implement appropriate measures to protect your data against unauthorized access, alteration, and disclosure.</p>

        <h2>8. Cookies</h2>
        <p>We use cookies to enhance your browsing experience. You can manage your cookie preferences through your browser settings.</p>

        <h2>9. Changes to this Policy</h2>
        <p>We may update this policy from time to time. Continued use of our services constitutes acceptance of the updated policy.</p>

        <h2>10. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@foodwebsite.com.</p>
      </div>
    </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsAndConditions;