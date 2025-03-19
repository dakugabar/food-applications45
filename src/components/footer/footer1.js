import React from 'react';
import './footer2.css';
import { useRouter } from 'next/navigation';

const Footer = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push('TermsAndConditions');
  };
  const handleClick1 = () => {
    router.push('MyOrder');
  };
  const handleClick2 = () => {
    router.push('Privacy-policy');
  };
  const handleClick3 = () => {
    router.push('Refund-and-Return-Policy');
  };

  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
        <a href='http://localhost:3000/'>   <img src="/logo.png" alt="Logo" /></a>
          <p>
            Welcome to our food website, where we bring you an exquisite collection 
            of mouth-watering dishes that cater to every taste. Explore our diverse 
            categories, including salads, rolls, desserts, sandwiches, cakes, pure veg, 
            pasta, and noodles.
          </p>
          <div className="footer-social-icon">
            <img src="/facebook_icon.png" alt="Facebook" />
            <img src="/twitter_icon.png" alt="Twitter" />
            <img src="/linkedin_icon.png" alt="LinkedIn" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
          <li onClick={handleClick1}>My Order</li>
            
            <li  onClick={handleClick}>  Terms and Conditions</li>
            <li onClick={handleClick2}>Privacy policy</li>
            <li  onClick={handleClick3}> Refund and Return Policy</li>
          </ul>
         
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+91-9001498993</li>
            <li>info@temoto.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2024 ©<a href='http://localhost:3000/'> Tomato.com</a> - All Right Reserved.
      </p>
    </div>
  );
};

export default Footer;
