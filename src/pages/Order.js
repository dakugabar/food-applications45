import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './order1.css';
import './order2.css';
import Navbar from '../components/navbar/navbar1';
import Footer from '../components/footer/footer1';
import AddressPopup from '../components/addresspopup/addresspopup1';
import LoginPopup from '../components/loginpopup/loginpopup1';
import axios from 'axios';
import { useRouter } from 'next/router';
import '../components/cartpopup/cartpopup2.css';
import '../app/globals.css';

const Order = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [location, setLocation] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [landmark, setLandmark] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [error, setError] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [cartTotal, setCartTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCartTotalId, setSelectedCartTotalId] = useState(null);
  const [adminLocation, setAdminLocation] = useState('');
  const [distanceThreshold, setDistanceThreshold] = useState(12);
  const [deliveryFeeS, setDeliveryFeeS] = useState(0);
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
 // Replace with actual user ID
 


 useEffect(() => {
  const handleTokenExpiration = () => {
   
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowLogin(true);
    router.push('/'); // Redirect to the home page
  };

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

  const fetchAddresses = async (token) => {
    try {
      const response = await axios.get('/api/getAddresses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setSavedAddresses(response.data.deliveries);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleTokenExpiration();
      } else {
        console.error('Error fetching saved addresses:', error.message);
      }
    }
  };

  const fetchCartItems = async (token) => {
    try {
      const response = await axios.get('/api/getCartItems', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setCartItems(response.data.cartItems);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleTokenExpiration();
      } else {
        console.error('Error fetching cart items:', error.message);
      }
    }
  };

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
        setError(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleTokenExpiration();
      } else {
        console.error('Error fetching cart total:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const token = localStorage.getItem('token');

  if (token) {
    setIsLoggedIn(true);
    fetchAddresses(token);
    fetchCartItems(token);
    fetchCartTotal(token);
  } else {
    handleTokenExpiration();
  }

  fetchAdminSettings();
}, [router]);


  const handleSaveAddress = (newAddress) => {
    setSavedAddresses((prevAddresses) => [newAddress, ...prevAddresses]);
    setLocation('');
    setFlatNo('');
    setLandmark('');
    setShowPopup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setShowLogin(true);
    router.push('/');
  };
  

 const handleCheckoutClick = async () => {
  // Ensure a delivery address is selected before proceeding
  if (!selectedAddressId) {
    alert('Please select a delivery address.');
    return;
  }

  setLoading(true); // Set loading to true when the button is clicked

  try {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No token found'); // If no token, display error
      setLoading(false); // Stop loading
      return;
    }

    // Send the request to save the selected address and cart total ID
    const response = await axios.post(
      '/api/saveCheckoutAddress', // Your API endpoint
      {
        addressId: selectedAddressId, // Address ID selected by the user
        cartTotalId: selectedCartTotalId,
        deliveryFee : deliveryFeeS,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      }
    );

    
    if (response.data.success) {
      
      router.push('/orderpayment');
    } else {
      
      setError(response.data.message || 'Failed to save address.');
    }
  } catch (error) {
    
    console.error('Error during checkout:', error);
    if (error.response && error.response.data) {
      setError(error.response.data.message || 'Network error, please try again later.');
    } else {
      setError('An unexpected error occurred. Please try again later.');
    }
  } finally {
    setLoading(false); 
  }
};

  


  
  const subtotal = cartTotal ? cartTotal.subtotal : 0;
  const itemDiscount= cartTotal ? cartTotal.itemDiscount : 0;
  const  couponDiscount= cartTotal ? cartTotal.couponDiscount : 0;
  const  totalGst= cartTotal ? cartTotal.totalGst : 0;
  const deliveryFee = cartTotal ? cartTotal.deliveryFee : 0;
  const total = cartTotal ? cartTotal.total : 0;

  const handleAddressChange = async (index) => {
    if (!savedAddresses[index]) {
      console.error('Invalid address selected.');
      return;
    }
  
    const selectedLocation = savedAddresses[index].location;
    setSelectedAddress(savedAddresses[index]);
   
     setSelectedAddressId(savedAddresses[index]._id);
    
    if (!adminLocation) {
      console.error('Admin location is not defined.');
      setCartTotal((prev) => ({ ...prev, deliveryFee: 0 }));
      return;
    }
  
    try {
      // Show a loader or disable UI if necessary
      const response = await axios.post('/api/calculateDeliveryFee', {
        userLocation: selectedLocation,
        adminLocation,
      });
  
      if (response.data.success) {
        const { fee, distance } = response.data;
        setDeliveryFeeS(fee);
        // console.log(`Delivery fee: ${fee}, Distance: ${distance} km`);
        setCartTotal((prev) => ({ ...prev, deliveryFee: fee }));
      } else {
        console.warn('Delivery fee calculation failed:', response.data.message);
        setCartTotal((prev) => ({ ...prev, deliveryFee: 0 }));
      }
    } catch (error) {
      console.error('Error calculating delivery fee:', error.message || error);
      setCartTotal((prev) => ({ ...prev, deliveryFee: 0 }));
    } finally {
      // Hide loader or re-enable UI
    }
  };
  




// Function to calculate delivery fee using userLocation and adminLocation
const calculateDeliveryFee = async (userLocation, adminLocation) => {
  try {
    // Make the API call to calculate the delivery fee
    const response = await axios.post('/api/calculateDeliveryFee', {
      userLocation,
      adminLocation,
    });

    if (response.data.success) {
      const { fee, distance } = response.data;
      return { fee, distance };
    } else {
      console.warn('Delivery fee calculation failed:', response.data.message);
      return { fee: 0, distance: 0 };
    }
  } catch (error) {
    console.error('Error calculating delivery fee:', error.message || error);
    return { fee: 0, distance: 0 };
  }
};

useEffect(() => {
  // Check if all necessary values are available
  if (!savedAddresses || !adminLocation || !selectedAddressId) {
    return; // Do nothing if values are not available
  }

  // Filter the saved addresses array to find the selected address
  const selectedAddress = savedAddresses.find(address => address._id === selectedAddressId);

  if (!selectedAddress) {
    console.error('Selected address not found.');
    return;
  }

  // Get the location from the selected address
  const userLocation = selectedAddress.location;

  // Call the calculateDeliveryFee function with userLocation and adminLocation
  const calculateFee = async () => {
    try {
      const response = await axios.post('/api/calculateDeliveryFee', {
        userLocation,
        adminLocation,
      });

      if (response.data.success) {
        const { fee, distance } = response.data;
        setDeliveryFeeS(fee);
        // console.log(`Delivery fee: ${fee}, Distance: ${distance} km`);
        setCartTotal((prev) => ({ ...prev, deliveryFee: fee }));
      } else {
        console.warn('Delivery fee calculation failed:', response.data.message);
        setCartTotal((prev) => ({ ...prev, deliveryFee: 0 }));
      }
    } catch (error) {
      console.error('Error calculating delivery fee:', error.message || error);
      setCartTotal((prev) => ({ ...prev, deliveryFee: 0 }));
    }
  };

  // Call the function to calculate the delivery fee
  calculateFee();

}, [savedAddresses, adminLocation, selectedAddressId]);


  return (
    <>
      {showLogin && !isLoggedIn && (
        <LoginPopup setShowLogin={setShowLogin} setIsLoggedIn={setIsLoggedIn} />
      )}
      <div className='back-navbar'>
      <div className="app">
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
        <div className="app">
        <div className="cart-page">
          <div className="back-arrow">
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="back-arrow-icon"
              onClick={() => window.history.back()}
            />
          </div>
          <div className="place-order">
            <div className='place-order-left'>
              <div className="address-header">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
                <h2>Delivery Addresses</h2>
              </div>

              {savedAddresses.length > 0 && (
  <div className="address-list">
   {savedAddresses.map((addr, index) => (
  <div key={index} className="address-item">
    <input
      type="radio"
      name="saved-address"
      value={index}
      checked={addr._id === selectedAddressId} // Compare _id with selectedAddressId
      onChange={() => handleAddressChange(index)} // Ensure this function handles selection
    />
    <span>{addr.flatNo}, {addr.location}</span>
  </div>
))}

  </div>
)}


              <p className="add-new-btn" onClick={() => setShowPopup(true)}>
                <span>
                  <FontAwesomeIcon icon={faPlus} className="location-icon1" />
                </span>{' '}
              <span className='add-new'> Add New Address</span>
              </p>
            </div>
            <div className='place-order-right'>
  <div className="cart-bottom1">
    <div className="cart-total">
      <h2>Cart Total</h2>
      <div className="cart-total-details">
        <p>Subtotal</p>
        <p>₹{subtotal.toFixed(2)}</p>
      </div>
      <hr />
      
      {itemDiscount > 0 && (
        <>
          <div className="cart-total-details">
            <p>Item Discount</p>
            <p>-₹{itemDiscount.toFixed(2)}</p>
          </div>
          <hr />
        </>
      )}
      
      {couponDiscount > 0 && (
        <>
          <div className="cart-total-details">
            <p>Coupon Discount</p>
            <p>-₹{Math.round(couponDiscount).toFixed(2)}</p>
          </div>
          <hr />
        </>
      )}
      
      {totalGst > 0 && (
        <>
          <div className="cart-total-details">
            <p>GST</p>
            <p>+₹{totalGst.toFixed(2)}</p>
          </div>
          <hr />
        </>
      )}
      
     
       
          <div className="cart-total-details">
            <p>Delivery Fee</p>
            <p>+₹{typeof cartTotal?.deliveryFee === 'number' ? cartTotal.deliveryFee.toFixed(2) : '0'}</p>
          </div>
          <hr />
   

      
      <div className="cart-total-details">
        <b>Total</b>
        <b>₹{
      (subtotal + totalGst + deliveryFee - itemDiscount - couponDiscount).toFixed(2)
    }</b>
      </div>
      <div className="checkout-btn">
        <button
          onClick={handleCheckoutClick}
          className="checkout-button"
          disabled={cartItems.length === 0}
        >
          {loading ? 'Processing...' : 'Proceed to Payment'.toUpperCase()}
        </button>
      </div>
    </div>
  </div>
</div>


            {showPopup && (
               <AddressPopup
               setShowPopup={setShowPopup}
               location={location}
               setLocation={setLocation}
               flatNo={flatNo}
               setFlatNo={setFlatNo}
               landmark={landmark}
               setLandmark={setLandmark}
               adminLocation={adminLocation}
               distanceThreshold={distanceThreshold}
               setSavedAddresses={setSavedAddresses}
             />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Order;
