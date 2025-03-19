import React, { useEffect, useState } from 'react';
import './prome2.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import ConfirmationPopup from '../confirmationPopup1';

const PromoCodePopup = ({ isVisible, onClose, onApplyCoupon, subtotal }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCouponId, setExpandedCouponId] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [savedAmount, setSavedAmount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);

      try {
        // Get token from localStorage or cookies (assumes token is stored here)
        const token = localStorage.getItem('token'); // Or use cookies if needed

        if (!token) {
          setError('User not authenticated');
          return;
        }

        const response = await fetch('/api/coupons2', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Pass the token in the Authorization header
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setCoupons(data.data);
        } else {
          setError(data.message || 'Failed to fetch coupons.');
        }
      } catch (err) {
        console.error('Error fetching coupons:', err);
        setError('Error fetching coupons.');
      } finally {
        setLoading(false);
      }
    };

    if (isVisible) {
      fetchCoupons(); // Call the fetch function when the popup is visible
    }
  }, [isVisible]);



  if (error) {
    return <div>Error: {error}</div>; // Error message
  }

  const handleMoreClick = (couponId) => {
    setExpandedCouponId(expandedCouponId === couponId ? null : couponId);
  };

  const handleApplyCoupon = (coupon) => {
    const discount = ((coupon.rate / 100) * subtotal).toFixed(2);
    setAppliedCoupon(coupon);
    setSavedAmount(discount);
    onApplyCoupon(coupon); // Callback to apply coupon in parent component
  };

  const handleCloseCouponCard = () => {
    setAppliedCoupon(null);
  };

  return (
    <>
      <div className={`promo-code-popup-overlay ${isVisible ? 'show' : ''}`}>
        <div className="promo-code-popup-content">
          <div className='top-title'>
            <div className="promo-code-popup-header">
              <img src="/cross_icon.png" alt="Close" className="close-icon" onClick={onClose} />
            </div>
          </div>
          <div className="coupon-list">
            {coupons.length > 0 ? (
              coupons.map((coupon) => {
                const isCouponAvailable = subtotal >= coupon.cartPrice;
                const additionalAmount = isCouponAvailable ? 0 : (coupon.cartPrice - subtotal).toFixed(2);

                return (
                  <div className="coupon-list1" key={coupon._id}>
                    <p className="title">{isCouponAvailable ? 'Available Coupons' : 'Unavailable Coupons'}</p>
                    <p className="code">{coupon.code}</p>
                    <p className="flate-rate">Get FLAT {coupon.rate}% off</p>
                    <p className="rate-cart">
                      Use Code {coupon.code} and get FLAT {coupon.rate}% off on orders above Rs.{coupon.cartPrice}. No Upper Limit.
                    </p>
                    <p className="max-discount">
                      Maximum discount up to ₹{coupon.maxDiscount} on orders above ₹{coupon.cartPrice}
                    </p>
                    {expandedCouponId === coupon._id ? (
                      <>
                        <p className="Terms">Terms and Conditions</p>
                        <div className='dot-point1'>
                          <p className='dot-point'></p>
                         <p className="terms-1">{coupon.terms}</p>
                        </div>
                      </>
                    ) : (
                      <p className="more" onClick={() => handleMoreClick(coupon._id)}>
                        <FontAwesomeIcon icon={faPlus} /> MORE
                      </p>
                    )}
                    <div className='apply-button' onClick={() => isCouponAvailable ? handleApplyCoupon(coupon) : null}>
                      {isCouponAvailable ? 'APPLY COUPON' : `Add ₹${Math.round(additionalAmount)} more to available this offer`}
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No coupons available</p>
            )}
          </div>
        </div>
      </div>
      {appliedCoupon && (
        <ConfirmationPopup 
          coupon={appliedCoupon} 
          discount={savedAmount} 
          onClose={handleCloseCouponCard} 
        />
      )}
    </>
  );
};

export default PromoCodePopup;
