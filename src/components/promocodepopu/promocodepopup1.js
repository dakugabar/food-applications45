import React, { useEffect, useState } from 'react';
import './prome2.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import ConfirmationPopup from '../confirmationPopup1';

const PromoCodePopup = ({ isVisible, onClose, onApplyCoupon, subtotal }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCouponId, setExpandedCouponId] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [savedAmount, setSavedAmount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Please login to view available coupons');
          return;
        }

        const response = await fetch('/api/coupons2', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setCoupons(data.data);
        } else {
          setError(data.message || 'Failed to fetch coupons. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching coupons:', err);
        setError('Network error. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isVisible) {
      fetchCoupons();
    }
  }, [isVisible]);

  const handleMoreClick = (couponId) => {
    setExpandedCouponId(expandedCouponId === couponId ? null : couponId);
  };

  const handleApplyCoupon = (coupon) => {
    const discount = Math.min(
      (coupon.rate / 100) * subtotal,
      coupon.maxDiscount
    ).toFixed(2);
    setAppliedCoupon(coupon);
    setSavedAmount(discount);
    onApplyCoupon(coupon);
  };

  const handleCloseCouponCard = () => {
    setAppliedCoupon(null);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="promo-code-popup-overlay show">
        <div className="promo-code-popup-content">
          <div className='top-title'>
            <div className="promo-code-popup-header">
              <h2>Available Coupons</h2>
              <img 
                src="/cross_icon.png" 
                alt="Close" 
                className="close-icon" 
                onClick={onClose} 
              />
            </div>
          </div>
          
          <div className="coupon-list">
            {loading ? (
              <div className="loading-container">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                <p>Loading coupons...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
              </div>
            ) : coupons.length > 0 ? (
              coupons.map((coupon) => {
                const isCouponAvailable = subtotal >= coupon.cartPrice;
                const additionalAmount = isCouponAvailable ? 0 : (coupon.cartPrice - subtotal).toFixed(2);
                const maxDiscount = coupon.maxDiscount || 'No limit';

                return (
                  <div className={`coupon-card ${isCouponAvailable ? 'available' : 'unavailable'}`} key={coupon._id}>
                    <div className="coupon-header">
                      <div className="coupon-percent">{coupon.rate}% OFF</div>
                      <div className="coupon-code">{coupon.code}</div>
                    </div>
                    
                    <div className="coupon-details">
                      <p className="coupon-description">
                        Get {coupon.rate}% off on orders above ₹{coupon.cartPrice}
                      </p>
                      <p className="coupon-max-discount">
                        Max discount: ₹{maxDiscount}
                      </p>
                      
                      {expandedCouponId === coupon._id ? (
                        <>
                          <div className="coupon-terms">
                            <h4>Terms and Conditions</h4>
                            <p>{coupon.terms}</p>
                          </div>
                          <button 
                            className="show-less-btn"
                            onClick={() => handleMoreClick(coupon._id)}
                          >
                            <FontAwesomeIcon icon={faMinus} /> LESS
                          </button>
                        </>
                      ) : (
                        <button 
                          className="show-more-btn"
                          onClick={() => handleMoreClick(coupon._id)}
                        >
                          <FontAwesomeIcon icon={faPlus} /> MORE
                        </button>
                      )}
                    </div>
                    
                    <div 
                      className={`apply-btn ${isCouponAvailable ? '' : 'disabled'}`}
                      onClick={() => isCouponAvailable && handleApplyCoupon(coupon)}
                    >
                      {isCouponAvailable ? (
                        'APPLY COUPON'
                      ) : (
                        `Add ₹${additionalAmount} more to use this coupon`
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-coupons">
                <p>No coupons available at this time</p>
                <p>Check back later for exciting offers!</p>
              </div>
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