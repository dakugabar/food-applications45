import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/navbar/navbar1';
import Footer from '../components/footer/footer1';
import LoginPopup from '../components/loginpopup/loginpopup1';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import '../components/cartpopup/cartpopup2.css';
import '../app/globals.css';
import { toast } from 'react-toastify';
import PromoCodePopup from '../components/promocodepopu/promocodepopup1';

const CartPage = () => {
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const router = useRouter();
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  

 
 
  const handlePromoClick = () => {
    setShowPromoPopup(true);
  };

  const handleClosePromoPopup = () => {
    setShowPromoPopup(false);
  };

  const handleApplyCoupon = (coupon) => {
    setAppliedCoupon(coupon);
    setShowPromoPopup(false);
  };


 

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowLogin(true);
    router.push('/'); // Redirect to the home page
  };

  useEffect(() => {
    // Function to handle token expiration
    const handleTokenExpiration = () => {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setShowLogin(true); // Show login popup
      router.push('/'); // Redirect to the home page
    };

    // Fetch admin settings
    const fetchAdminSettings = async () => {
      try {
        const response = await axios.get('/api/adminSettings');
        if (response.data.success) {
          setAdminLocation(response.data.adminLocation);
          setDistanceThreshold(response.data.distanceThreshold);
        } else {
          console.error('Failed to fetch admin settings');
        }
      } catch (error) {
        console.error('Error fetching admin settings:', error.message);
      }
    };

    // Fetch saved addresses
    const fetchAddresses = async (token) => {
      try {
        const response = await axios.get('/api/getAddresses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setSavedAddresses(response.data.deliveries);
        }
      } catch (error) {
        if (error.response?.status === 401) handleTokenExpiration();
        else console.error('Error fetching saved addresses:', error.message);
      }
    };

    // Fetch cart items
    const fetchCartItems = async (token) => {
      try {
        const response = await axios.get('/api/getCartItems', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setCartItems(response.data.cartItems);
        } else {
          console.error('Failed to fetch cart items');
        }
      } catch (error) {
        if (error.response?.status === 401) handleTokenExpiration();
        else console.error('Error fetching cart items:', error.message);
      }
    };

    // Fetch cart total
    const fetchCartTotal = async (token) => {
      try {
        const response = await axios.get('/api/getCartInfo', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setCartTotal(response.data.cartTotal);
          setSelectedCartTotalId(response.data.cartTotal._id);
          setSelectedAddressId(response.data.selectedAddressId);
        } else {
          console.error('Failed to fetch cart total');
        }
      } catch (error) {
        if (error.response?.status === 401) handleTokenExpiration();
        else console.error('Error fetching cart total:', error.message);
      } finally {
        setLoading(false);
      }
    };

    // Validate token and fetch necessary data
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchAddresses(token);
      fetchCartItems(token);
      fetchCartTotal(token);
    } else {
      handleTokenExpiration(); // Handle missing or invalid token
    }

    // Fetch admin settings
    fetchAdminSettings();
  }, [router]);
  

  const fetchCartItems = async (token) => {

  
    try {
      const response = await axios.get('/api/getCartItems', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.data.success) {
        setCartItems(response.data.cartItems);
      } else if (response.data.error === 'TokenExpired') {
        handleTokenExpiration();
        router.push('/');  // Redirect to home page
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleTokenExpiration();
        router.push('/');  // Redirect to home page
      } else {
        console.error('Error fetching cart items:', error);
        setError('Error fetching cart items');
      }
    }
  };
  const updateCartItem = async (itemId, newQuantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/updateCartItem',
        { itemId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCartItems(prevItems => prevItems.map(item =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        ));
      } else if (response.data.error === 'TokenExpired') {
        handleTokenExpiration();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleTokenExpiration();
      } else {
        console.error('Error updating cart item:', error);
        setError('Error updating cart item');
      }
    }
  };

  const handleRemoveClick = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete('/api/removeCartItem', {
        headers: { Authorization: `Bearer ${token}` },
        data: { itemId },
      });

      if (response.data.success) {
        setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
      } else if (response.data.error === 'TokenExpired') {
        handleTokenExpiration();
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleTokenExpiration();
      } else {
        console.error('Error removing cart item:', error);
        setError('Error removing cart item');
      }
    }
  };

  const handleTokenExpiration = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowLogin(true);
  };

  const incrementQuantity = (itemId, currentQuantity) => {
    updateCartItem(itemId, currentQuantity + 1);
  };

  const decrementQuantity = (itemId, currentQuantity) => {
    if (currentQuantity > 1) {
      updateCartItem(itemId, currentQuantity - 1);
    } else {
      handleRemoveClick(itemId);
    }
  };

  const subtotal = cartItems.reduce((total, item) => {
    if (item.foodId) {
      const originalPrice = item.foodId.price;
      const discountAmount = originalPrice * (item.foodId.discount / 100);
     // const gstAmount = discountAmount * (item.foodId.gstRate / 100);
      const priceWithGst = originalPrice - discountAmount;
      const pricewithless=originalPrice-priceWithGst
      const itemTotal = pricewithless * item.quantity;
      return total + itemTotal;
    }
    return total;
  }, 0);


  const totalGst = cartItems.reduce((total, item) => {
    if (item.foodId) {
      const originalPrice = item.foodId.price;
  
      // Price after applying item discount
      const discountAmount = originalPrice * (1 - (item.foodId.discount / 100));
  
      // Apply coupon discount, if available
      const discountAmountAfterCoupon = appliedCoupon
        ? originalPrice * (1 - appliedCoupon.rate / 100) // Coupon discount
        : discountAmount; 
      const gstAmount = discountAmountAfterCoupon * (item.foodId.gstRate / 100) * item.quantity;
  
      return total + gstAmount; 
    }
    return total;
  }, 0);
  
  
  
  
  

  const subtotalWithD = cartItems.reduce((total, item) => {
    if (item.foodId) {
      const originalPrice = item.foodId.price*item.quantity;

      return total + originalPrice;
    }
    return total;
  }, 0);

   
 


 
  // Check if the coupon is valid based on subtotal
  const couponAvailable = appliedCoupon && subtotalWithD >= appliedCoupon.cartPrice;

  // Auto-remove coupon if subtotal is below the required cart price
  useEffect(() => {
    if (appliedCoupon && subtotalWithD < appliedCoupon.cartPrice) {
      setAppliedCoupon(null);
    }
  }, [subtotalWithD, appliedCoupon]);

  const deliveryFee = 0;
  const total = subtotalWithD + deliveryFee;


  
  const handleCheckoutClick = async () => {
    if (cartItems.length === 0) {
        setError('Please add items to the cart before proceeding to checkout.');
    } else {
      setLoading(true);
        try {
            await saveCartTotal(); // Attempt to save the cart total
            router.push('/Order'); // Redirect to the order page only if save is successful
        } catch (error) {
            // Handle any errors that occurred during the save process
            console.error('Error saving cart total:', error);
            setError('An error occurred while saving the cart. Please try again.');
        }
    }
};

const saveCartTotal = async () => {
  const cartData = {
    subtotal: Number(subtotalWithD.toFixed(2)), // Converts to number after applying toFixed
    itemDiscount: Number (
      appliedCoupon 
        ? 0 // Subtotal becomes 0 if coupon is applied
        : (subtotal.toFixed(2)) // If no coupon, show regular subtotal
    ), // Same here
    couponDiscount: appliedCoupon
      ? Number(Math.min((subtotalWithD * appliedCoupon.rate / 100).toFixed(2), appliedCoupon.maxDiscount).toFixed(2))
      : 0, // Ensure the final value is also fixed to 2 decimal places
    deliveryFee: Number(deliveryFee.toFixed(2)),
    totalGst: Number(totalGst.toFixed(2)),
    total: Number((
      (subtotalWithD) - 
      (
        appliedCoupon 
          ? 0 // Subtotal becomes 0 if coupon is applied
          : subtotal // If no coupon, show regular subtotal
      ) - 
      (appliedCoupon ? (subtotalWithD * appliedCoupon.rate / 100) : 0) + 
      (deliveryFee) + 
      (totalGst)
    ).toFixed(2)), // Make sure total is also toFixed(2)
    couponId: appliedCoupon ? appliedCoupon._id : null,
    couponStatus: 'active', // Assuming this is correct
  };

  
    try {
      const token = localStorage.getItem('token'); // Get the token from local storage or wherever you're storing it
      if (!token) {
        setError('No token found');
        setLoading(false); // Stop loading if no token is found
        return;
      }
      const response = await fetch('/api/saveCartTotal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token in the header
        },
        body: JSON.stringify(cartData),
      });
  
      const data = await response.json();
      if (data.success) {
        // console.log('Cart total saved successfully:', data.cartTotal);
      } else {
        console.error('Failed to save cart total:', data.message);
      }
    } catch (error) {
      console.error('Error saving cart total:', error);
    }finally {
      setLoading(false); 
    }
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
          <div className="back-arrow">
            <FontAwesomeIcon 
              icon={faArrowLeft} 
              className="back-arrow-icon" 
              onClick={() => router.back()} 
            />
          </div>
        </div>
        </div>
        </div>
        <div className='app'>
        <div className="cart-page">
          
          <div className='cart-container'>
            <div className='cart-header'></div>
            <div className='cart-body'>
              <div className='cart-header1'>
                <span>Item</span>
                <span>Title</span>
                <span>Rate</span>
                <span>Qty</span>
                <span>Tax</span>
                 <span>Amount</span> 
                <span>Remove</span>
               
              </div>
              <div className='cart-items-container'>
  {error && <p className='error-message'>{error}</p>}
  {cartItems.length === 0 ? (
    <p>Your cart is empty</p>
  ) : (
    cartItems.map(item => (
      <div key={item._id} className='cart-item'>
        <div className='cart-item-img'>
          {item.foodId && (
            <img src={item.foodId.imageUrl} alt={item.foodId.name} className='item-image' />
          )}
        </div>
        <div className='cart-item-details'>
          <h3>{item.foodId ? item.foodId.name : 'Unknown Item'}</h3>
        </div>
       
        <div className='cart-item-price1'>
          {/* Original Price with Strikethrough */}
          <p className='original-price2'>₹{item.foodId ? item.foodId.price: 'N/A'}</p>
         
          <p className='discounted-price3'>
            ₹{item.foodId ? (item.foodId.price - (item.foodId.price * (item.foodId.discount / 100))) : 'N/A'}
          </p>
        </div>
       
<div className='quantity-item'>
        <div className='cart-item-quantity'>
          <button onClick={() => decrementQuantity(item._id, item.quantity)}>-</button>
          <p>{item.quantity}</p>
          <button onClick={() => incrementQuantity(item._id, item.quantity)}>+</button>
        </div>
        </div>
        <div className='cart-item-price'>
          <p>{item.foodId ? item.foodId.gstRate : 'N/A'}%</p>
        </div>
        <div className='cart-item-total'>
          <p>
            ₹
            {item.foodId
              ? ((item.foodId.price - (item.foodId.price * (item.foodId.discount / 100))) * item.quantity)
              : 'N/A'}
          </p>
        </div>
        <div className='cart-item-remove'>
          <img
            src='/cross_icon.png'
            alt='Remove'
            onClick={() => handleRemoveClick(item._id)}
            className='remove-icon'
          />
        </div>
      </div>
    ))
  )}
</div>
            </div>
            <div className='cart-bottom'>
            <div className='cart-total'>
    <h2>Cart Total</h2>
    <div className='cart-total-details'>
      <p>Subtotal</p>
      <p>₹{subtotalWithD.toFixed(2)}</p>
    </div>
    <hr />
   {appliedCoupon ? (
  <>
    <div className='cart-total-details'>
      <p>Coupon Discount</p>
      <p>
        -₹{
          Math.min(
            (subtotalWithD * appliedCoupon.rate / 100),
            appliedCoupon.maxDiscount
          ).toFixed(2)
        }
      </p>
    </div>
    <hr />
  </>
) : (
  <>
    {subtotal > 0 && (
      <>
        <div className='cart-total-details'>
          <p>Item Discount</p>
          <p>-₹{subtotal.toFixed(2)}</p>
        </div>
        <hr />
      </>
    )}
  </>
)}

    
    
   
    {totalGst > 0 && (
      <>
        <div className='cart-total-details'>
          <p>GST</p>
          <p>+₹{totalGst.toFixed(2)}</p>
        </div>
        <hr />
      </>
    )}
     <div className='cart-total-details'>
      <p>Delivery Fee</p>
      <p>+₹{deliveryFee}</p>
    </div>
    <hr/>

    <div className='cart-total-details'>
      <b>Total</b>
     
      <b>₹{
        (subtotalWithD - 
          (
            appliedCoupon 
              ? 0 // Subtotal becomes 0 if coupon is applied
              : subtotal // If no coupon, show regular subtotal
          ) - 
          (appliedCoupon 
            ? (subtotalWithD * appliedCoupon.rate / 100) // Apply coupon discount if available
            : 0)  + 
         deliveryFee + 
         totalGst
        ).toFixed(2)}</b>
    </div>
     <div className="checkout-button">
                {error && <div className="error-message">{error}</div>}
      <button onClick={handleCheckoutClick} disabled={loading}>
      {loading ? 'Processing...' : 'Proceed to Checkout'.toUpperCase()}
      </button>
                </div>
  </div>
              <div className='cart-promocode'>
                <div>
                  <p>If you want coupon code list, enter it here:</p>
                  <div className='cart-promocode-input'>
  {appliedCoupon ? (
    <>
      <input
        type='text'
        value={appliedCoupon.code}
        placeholder='Promo code'
        readOnly 
      />
      <img
        src='/cross_icon.png'
        alt='Remove'
        onClick={() => setAppliedCoupon(null)} 
        className='remove-icon'
      />
    </>
  ) : (
    <input
      type='text'
      placeholder='Enter promo code'
      onClick={handlePromoClick} 
    />
  )}
  <button >Apply Coupon</button>
</div>
                </div>
              </div>
            </div>
          </div>
        </div>
       
      </div>
     
      <PromoCodePopup 
        isVisible={showPromoPopup} 
        onClose={() => setShowPromoPopup(false)} 
        onApplyCoupon={handleApplyCoupon} 
        subtotal={subtotalWithD} 
        userId={userId}
      />
       <Footer />
    </>
  );
};

export default CartPage;
