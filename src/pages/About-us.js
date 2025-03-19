// app/page.js
'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar/navbar1.js';
import '../app/globals.css';
import Footer from '../components/footer/footer1.js';
import LoginPopup from '../components/loginpopup/loginpopup1.js';

import './AboutUs2.css';

const TermsAndConditions = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState('');

  const foodItems = [
    { name: 'Sandwich', description: 'Stone-baked to perfection.', image: '/food_14.png' },
    { name: 'Rolls', description: 'A rolls that melts in your mouth.', image: '/food_7.png' },
    { name: 'Pasta', description: 'A perfect blend of Italian flavors.', image: '/food_26.png' },
    { name: 'Ice Cream ', description: 'A treat for every sweet tooth.', image: '/food_12.png' },
  ];
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
  const handleFoodClick = (name) => {
    setPopupContent(name);
    setShowPopup(true);
  };

  const closePopup = () => setShowPopup(false);
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
        <div className="about-container">
      <header className="about-header">
        <h1>Welcome to Tomato</h1>
        <p>Where every meal is an experience, and every bite is a delight!</p>
      </header>

      <section className="about-content">
        <h2>Our Story</h2>
        <p>
          Tomato was born from a passion for good food and great company. From humble beginnings to becoming a favorite 
          destination for food lovers, we remain committed to providing exceptional dishes with an unforgettable dining experience.
        </p>
        <p>
          Whether you're craving a quick snack or a gourmet meal, our chefs craft each dish with love and the freshest ingredients. 
          We bring food to life, creating a journey for your taste buds that you’ll cherish forever.
        </p>
      </section>

      <section className="food-gallery">
        <h2>Our Signature Dishes</h2>
        <div className="food-items">
          {foodItems.map((item, index) => (
            <div key={index} className="food-card" onClick={() => handleFoodClick(item)}>
              <img src={item.image} alt={item.name} />
              <p>{item.name}</p>
            </div>
          ))}
        </div>
      </section>

      {showPopup && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content">
            <h2>{popupContent.name}</h2>
            <img src={popupContent.image} alt={popupContent.name} />
            <p>{popupContent.description}</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsAndConditions;