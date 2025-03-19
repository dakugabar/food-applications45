import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Navbar from '../components/navbar/navbar1';
import Footer from '../components/footer/footer1';
import LoginPopup from '../components/loginpopup/loginpopup1';
import ReviewPopup from '../components/starpopup/star1'; // Import the new ReviewPopup component
import '../components/cartpopup/cartpopup2.css';
import '../app/globals.css';
import './order2.css';
import './MyOrder2.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const CartPage = () => {
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupOrderId, setPopupOrderId] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false); // State for review popup
  const [selectedOrderId, setSelectedOrderId] = useState(null); // Track order for review
  const [orderItemNames, setOrderItemNames] = useState(''); // State for order item names

  const router = useRouter();

 
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
        await fetchOrders(token);
      } else {
        handleTokenExpiration();
      }
    };

    const fetchOrders = async (token) => {
      try {
        const response = await axios.get('/api/getOrders', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setOrders(response.data.orderPayments);
          setTotal(calculateTotal(response.data.orderPayments));
        } else {
          handleTokenExpiration();
        }
      } catch (error) {
        if (error.response?.status === 401) {
          handleTokenExpiration();
        } else {
          console.error('Error fetching orders:', error.response || error.message);
          setError('Error fetching orders');
        }
      }
    };

    const calculateTotal = (orders) => {
      return orders.reduce((acc, order) => acc + order.amount, 0);
    };

    const handleTokenExpiration = () => {
     
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setShowLogin(true);
      router.push('/'); // Redirects to the home page
    };

    checkLoginStatus();
  }, [router]);

  const handleStatusUpdate = async (orderId) => {
    try {
      const response = await axios.get(`/api/getOrderStatus?orderId=${orderId}`);

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: response.data.status } : order
          )
        );
      } else {
        setError('Failed to fetch order status');
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
      setError('Error fetching order status');
    }
  };

  const handleCancelOrder = async (orderId) => {
    const order = orders.find(order => order._id === orderId);
    if (!order) {
      console.error('Order not found');
      return;
    }

    if (order.status === 'Out for delivery' || order.status === 'Delivered') {
      setPopupMessage(`Your order is ${order.status}. You cannot cancel it.`);
      setPopupOrderId(orderId);
      setShowPopup(true);
      return;
    }

    try {
      const response = await axios.put(`/api/updateOrderStatus1`, {
        orderId,
        status: 'Cancelled',
      });

      if (response.data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: 'Cancelled' } : order
          )
        );
      } else {
        setError('Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      setError('Error cancelling order');
    }
  };

  const calculateTotal = (orders) => {
    return orders.reduce((acc, order) => {
      const orderTotal = order.items.reduce((subtotal, item) => {
        if (item.foodId) {
          return subtotal + item.foodId.price * (item.discount / 100) * item.quantity;
        }
        return subtotal;
      }, 0);

      const deliveryFee = order.deliveryFee || 0;
      const gst = (orderTotal * (order.gstRate || 0) / 100);
      return acc + orderTotal + deliveryFee + gst;
    }, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowLogin(true);
    router.push('/'); // Redirect to the home page
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupMessage('');
    setPopupOrderId(null);
  };

  const openReviewPopup = (orderId, itemNames) => {
    setSelectedOrderId(orderId);
    setOrderItemNames(itemNames); // Set the order item names
    setShowReviewPopup(true); // Open the review popup
  };

  const closeReviewPopup = () => {
    setShowReviewPopup(false); // Close the review popup
  };

  return (
    <>
      {showLogin && !isLoggedIn && (
        <LoginPopup setShowLogin={setShowLogin} setIsLoggedIn={setIsLoggedIn} />
      )}
      {showPopup && (
        <div className="popup small-popup">
          <p>{popupMessage}</p>
          <button onClick={closePopup}>Close</button>
        </div>
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
        <div className='my-orders'>
          <h2>My Orders</h2>
          {error && <p className="error">{error}</p>}
          <div className='container'>
            {orders.length === 0 ? (
              <p>No orders found</p>
            ) : (
              orders.slice().reverse().map((order) => {
                const itemNames = order.items
                  .filter(item => item.foodId) // Filter to avoid null/undefined foodId
                  .map(item => `${item.foodId.name} x ${item.quantity}`).join(', ');
                return (
                  <div key={order._id} className='my-orders-order'>
                    <img src='/parcel_icon.png' alt='parcel icon' />
                    <p>{itemNames}</p>
                    <p> <span className='tometo'>₹ </span>{order.totalAmount}</p>
                    <p>Items<span className='tometo'>:</span> {order.items.length}</p>
                    <p><span>&#x25cf;</span> <b>{order.status}</b></p>
                    <button onClick={() => handleStatusUpdate(order._id)}>Track Order</button>

                    <button 
                      onClick={() => handleCancelOrder(order._id)} 
                      className='cancel-button'
                      disabled={order.status === 'Out for delivery' || order.status === 'Delivered'}
                    >
                      Cancel
                    </button>

                    {/* Show the "Add Review" button if the order status is "Delivered" */}
                    {order.status === 'Delivered' && (
                      <button onClick={() => openReviewPopup(order._id, itemNames)}>
                        Add Review
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Review Popup */}
      {showReviewPopup && (
        <ReviewPopup
          orderId={selectedOrderId}
          orderItemName={orderItemNames} // Pass order item names to ReviewPopup
          closeReviewPopup={closeReviewPopup}
        />
      )}

      <Footer />
    </>
  );
};

export default CartPage;
