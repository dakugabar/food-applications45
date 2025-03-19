import React, { useEffect, useState } from 'react';
import './couponlist2.css'; // CSS for styling

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch('/api/getCoupons');
        if (!response.ok) {
          throw new Error('Failed to fetch coupons');
        }
        const data = await response.json();
        setCoupons(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const toggleStatus = async (couponId, currentStatus) => {
    const updatedStatus = { status: currentStatus === 'active' ? 'inactive' : 'active' };

    try {
      const response = await fetch(`/api/updateCoupon/${couponId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStatus),
      });

      if (!response.ok) {
        throw new Error('Failed to update coupon status');
      }

      setCoupons(coupons.map(coupon =>
        coupon._id === couponId ? { ...coupon, status: updatedStatus.status } : coupon
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setShowPopup(true);
  };

  const handleDelete = async (couponId) => {
    try {
      await fetch(`/api/deleteCoupon/${couponId}`, {
        method: 'DELETE',
      });
      setCoupons(coupons.filter(coupon => coupon._id !== couponId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setEditingCoupon(null);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    const updatedCoupon = {
      ...editingCoupon,
      // Include any changes made to the coupon here
    };

    try {
      const response = await fetch(`/api/updateCoupon/${editingCoupon._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCoupon),
      });

      if (!response.ok) {
        throw new Error('Failed to update coupon');
      }

      setCoupons(coupons.map(coupon =>
        coupon._id === editingCoupon._id ? updatedCoupon : coupon
      ));
      handlePopupClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>All Available Coupons</h1>
      
      {loading ? (
        <p className='loading'>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className='container-coupon'>
      
        
          <div className='coupon-title'>
            <b>Coupon Code</b>
            <b>Discount(%)</b>
            {/* <b>Maximum Discount</b> */}
            <b>Create/Expiry</b>
            <b>Usage Limit</b>
            <b>Min Price</b>
            <b>Status</b>
            <b>Actions</b>
            <b>Actions</b>
          </div>
        <div className='list-coupon'>
          {coupons.map((coupon) => (
            <tr key={coupon._id}>
              <td>{coupon.code}</td>
              <td>{coupon.rate}%</td>
              {/* <td>₹{coupon.maxDiscount}</td> */}
              <td>
                <p>
                  {`${new Date(coupon.createdAt).toLocaleDateString('en-GB')}-${new Date(coupon.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
                </p>
                <p>
                  {`${new Date(coupon.expiry).toLocaleDateString('en-GB')}-${new Date(coupon.expiry).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
                </p>
              </td>
              <td>{coupon.usageLimit}</td>
              <td>₹{coupon.cartPrice}</td>
              <td>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={coupon.status === 'active'} 
                    onChange={() => toggleStatus(coupon._id, coupon.status)} 
                  />
                  <span className="slider" />
                </label>
              </td>
              <td>
                <button className='button-copuon' onClick={() => handleEdit(coupon)}>Edit</button>
              </td>
              <td>
              <img 
  src="/bin.png" 
  alt="Delete" 
  className="coupon-image" 
  onClick={() => handleDelete(coupon._id)} 
/>
               
              </td>
            </tr>
          ))}
        </div>
      
      </div>
      )}
      
      {showPopup && (
       <div className="popup">
        <div className='popup-content'>
       <form onSubmit={handleEditSubmit}>
         <h2>Edit Coupon</h2>
         <div className="form-row">
           <label>
             Coupon Code:
             <input 
               type="text" 
               value={editingCoupon.code} 
               onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value })} 
             />
           </label>
           <label>
             Discount Rate:
             <input 
               type="number" 
               value={editingCoupon.rate} 
               onChange={(e) => setEditingCoupon({ ...editingCoupon, rate: e.target.value })} 
             />
           </label>
         </div>
         <label>
           Terms:
           <textarea 
             value={editingCoupon.terms} 
             onChange={(e) => setEditingCoupon({ ...editingCoupon, terms: e.target.value })} 
           />
         </label>
         <div className="form-row">
         <label>
             Usage Limit:
             <input 
               type="number" 
               value={editingCoupon.usageLimit} 
               onChange={(e) => setEditingCoupon({ ...editingCoupon, usageLimit: e.target.value })} 
             />
           </label>
           <label>
             Expiry:
             <input 
               type="datetime-local" 
               value={editingCoupon.expiry} 
               onChange={(e) => setEditingCoupon({ ...editingCoupon, expiry: e.target.value })} 
             />
           </label>
          
         </div>
         <div className="form-row">
          
           <label>
             Min Cart Price:
             <input 
               type="number" 
               value={editingCoupon.cartPrice} 
               onChange={(e) => setEditingCoupon({ ...editingCoupon, cartPrice: e.target.value })} 
             />
           </label>
           <label>
             Maximum Discount:
             <input 
               type="number" 
               value={editingCoupon.maxDiscount} 
               onChange={(e) => setEditingCoupon({ ...editingCoupon, maxDiscount: e.target.value })} 
             />
           </label>
         </div>
         <div className="button-group">
           <button type="submit">Update Coupon</button>
           <button type="button" onClick={handlePopupClose}>Cancel</button>
         </div>
       </form>
     </div>
     </div>
      )}
    </div>
  );
};

export default CouponList;
