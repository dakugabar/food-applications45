import React, { useState } from 'react';
import './coupon2.css';

const Coupon = () => {
  const [couponCode, setCouponCode] = useState('');
  const [couponRate, setCouponRate] = useState(0);
  const [maxDiscountPrice, setMaxDiscountPrice] = useState(0); // New state for maximum discount price
  const [terms, setTerms] = useState('');
  const [expiry, setExpiry] = useState('');
  const [usageLimit, setUsageLimit] = useState(0);
  const [cartPrice, setCartPrice] = useState(0);
  const [couponActive, setCouponActive] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!couponCode) newErrors.couponCode = 'Coupon Code is required';
    if (!couponRate || couponRate <= 0) newErrors.couponRate = 'Coupon Rate must be greater than 0';
    if (!maxDiscountPrice || maxDiscountPrice <= 0) newErrors.maxDiscountPrice = 'Maximum Discount Price must be greater than 0'; // Validation for max discount
    if (!expiry) newErrors.expiry = 'Expiry Date & Time is required';
    if (!usageLimit || usageLimit <= 0) newErrors.usageLimit = 'Usage Limit must be greater than 0';
    if (!cartPrice || cartPrice <= 0) newErrors.cartPrice = 'Minimum Cart Price must be greater than 0';
    if (!terms) newErrors.terms = 'Terms & Conditions are required';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const couponData = {
      code: couponCode,
      rate: couponRate,
      maxDiscount: maxDiscountPrice, // Include max discount in coupon data
      terms,
      expiry,
      usageLimit,
      cartPrice,
    };

    const response = await fetch('/api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(couponData),
    });

    if (response.ok) {
      const savedCoupon = await response.json();
      setCoupon(savedCoupon);
    
      // Reset form fields after successful submission
      resetForm();
    } else {
      alert('Failed to create coupon.');
    }
  };

  const resetForm = () => {
    setCouponCode('');
    setCouponRate(0);
    setMaxDiscountPrice(0); // Reset max discount price
    setTerms('');
    setExpiry('');
    setUsageLimit(0);
    setCartPrice(0);
    setCouponActive(false);
    setErrors({});
  };

  return (
    <div className="couponForm">
      <h2>Create New Coupon</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="inputGroup">
          <label htmlFor="couponCode">Coupon Code</label>
<input
  type="text"
  id="couponCode"
  value={couponCode}
  onChange={(e) => setCouponCode(e.target.value.toUpperCase())} // Convert to uppercase
  placeholder="Enter coupon code"
/>

            {errors.couponCode && <p className="error">{errors.couponCode}</p>}
          </div>
          <div className="inputGroup">
            <label htmlFor="couponRate">Coupon Rate (%)</label>
            <input
              type="number"
              id="couponRate"
              value={couponRate}
              onClick={() => setCouponRate('')}
              onChange={(e) => setCouponRate(e.target.value)}
              placeholder="Enter discount rate in ₹"
            />
            {errors.couponRate && <p className="error">{errors.couponRate}</p>}
          </div>
          <div className="inputGroup">
            <label htmlFor="maxDiscountPrice">Maximum Discount Price (₹)</label> {/* New input */}
            <input
              type="number"
              id="maxDiscountPrice"
              value={maxDiscountPrice}
              onClick={() => setMaxDiscountPrice('')}
              onChange={(e) => setMaxDiscountPrice(e.target.value)}
              placeholder="Enter maximum discount price"
            />
            {errors.maxDiscountPrice && <p className="error">{errors.maxDiscountPrice}</p>} {/* Error handling */}
          </div>
        </div>

        <div className="form-row">
          <div className="inputGroup">
            <label htmlFor="expiry">Expiry Date & Time</label>
            <input
              type="datetime-local"
              id="expiry"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
            {errors.expiry && <p className="error">{errors.expiry}</p>}
          </div>
          <div className="inputGroup">
            <label htmlFor="usageLimit">Number of Uses</label>
            <input
              type="number"
              id="usageLimit"
              value={usageLimit}
              onClick={() => setUsageLimit('')}
              onChange={(e) => setUsageLimit(e.target.value)}
              min="1"
              placeholder="Enter usage limit"
            />
            {errors.usageLimit && <p className="error">{errors.usageLimit}</p>}
          </div>
          <div className="inputGroup">
            <label htmlFor="cartPrice">Minimum Cart Price (₹)</label>
            <input
              type="number"
              id="cartPrice"
              value={cartPrice}
              onClick={() => setCartPrice('')}
              onChange={(e) => setCartPrice(e.target.value)}
              placeholder="Enter minimum cart price"
            />
            {errors.cartPrice && <p className="error">{errors.cartPrice}</p>}
          </div>
        </div>

        <div className="form-row full-width">
          <div className="inputGroup">
            <label htmlFor="terms">Terms & Conditions</label>
            <textarea
              id="terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Enter terms and conditions"
            />
            {errors.terms && <p className="error">{errors.terms}</p>}
          </div>
        </div>

        <button className="submitButton" type="submit">
          Create Coupon
        </button>
      </form>
    </div>
  );
};

export default Coupon;
