import React, { useEffect, useState } from 'react';
import './confirmationPopup2.css';

const AppliedCouponCard = ({ coupon, discount, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger the animation when the component mounts
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete before closing
  };

  return (
    <div className={`applied-coupon-card ${isVisible ? 'show' : ''}`}>
     
      <div className="applied-coupon-content">
        <div className="coupon-cart-img">
        <img src="/Coupon.png" alt="Celebration" className="celebration-icon" />
        </div>
       
        <p className="coupon-code"> <strong>‘{coupon.code}’ applied</strong></p>
        <p className="discount-saved"> {coupon.rate}%</p>
        <p className='discount-saved-text'>savings with this coupon</p>
        <div className='summry'>
        Happy to have you back! Look out for great offers on every order
          <p className='line-coupon'></p>
        
       </div>

        <p className="close-popup" onClick={handleClose}>YAY!</p>
      </div>
    </div>
  );
};

export default AppliedCouponCard;
