'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import './navbar2.css';
import { assets } from '../../assets/assets';
import { useRouter, usePathname } from 'next/navigation';
import SearchPopup from '../../components/search/search';

const Navbar = ({ isLoggedIn, setShowLogin, handleLogout }) => {
  const [isLoading, setIsLoading] = useState(false); // State for loading spinner
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname
  const [token, setToken] = useState(null); // State to monitor token
  const [showSearchPopup, setShowSearchPopup] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        handleTokenExpiration();
      } else {
        setToken(storedToken);
      }
    };

    const handleTokenExpiration = () => {
      localStorage.removeItem('token');
      setToken(null);
      setShowLogin(true); // Show the login popup
      router.push('/'); // Redirect to the home page
    };

    // Check token on component mount
    checkToken();

    // Optional: Poll or listen for token changes
    const interval = setInterval(checkToken, 5000); // Adjust interval as needed
    return () => clearInterval(interval);
  }, [router, setShowLogin]);

  const handleCheckoutClick = async () => {
    setIsLoading(true); // Show spinner
    setTimeout(async () => { // Simulate a delay for loading
      if (!token) {
        setShowLogin(true); // Show login popup if not logged in
      } else {
        await router.push('/Cart'); // Redirect to cart page if logged in
      }
      setIsLoading(false); // Hide spinner after navigation
    }, 1500); // Adjust delay as necessary
  };

  const handleOrderClick = () => {
    if (token) {
      router.push('/MyOrder'); // Replace '/order' with the actual path to your order page
    } else {
      setShowLogin(true); // Show login popup if not logged in
    }
  };

  const handleSearchClick = () => {
    if (pathname === '/') { // Only allow search on the home page
      if (!token) {
        setShowLogin(true); // Show login popup if not logged in
      } else {
        setShowSearchPopup(true); // Open the search popup if logged in
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <a href="/"><Image src={assets.logo} alt="Logo" /></a>
      </div>
      <div className="navbar-menu">
        <ul>
          <li>
            <a 
              href="/" 
              className={pathname === '/' ? "active" : ""}
            >
              Home
            </a>
          </li>
          <li>
            <a 
              href="/About-us" 
              className={pathname === '/About-us' ? "active" : ""}
            >
              About us
            </a>
          </li>
          <li>
            <a 
              href="/" 
              className={pathname === '/Blog' ? "active" : ""}
            >
              Blog
            </a>
          </li>
          <li>
            <a 
              href="#footer" 
              className={pathname === '/Contact-us' ? "active" : ""}
            >
              Contact us
            </a>
          </li>
        </ul>
      </div>
      <div className="navbar-right basket">
        <Image 
          onClick={handleSearchClick} 
          src={assets.search_icon} 
          alt="Search" 
          className={`searchButton ${pathname !== '/' ? 'disabled' : ''}`} 
          style={pathname !== '/' ? { cursor: 'not-allowed' } : {}} // Disable search icon on non-home pages
        />
      </div>
      <div className='navbar-search-icon'>
        {isLoading ? (
          <div className="spinner"></div> 
        ) : (
          <>
            <div className='basket'>
              <Image 
                src={assets.basket_icon} 
                alt='Cart' 
                onClick={handleCheckoutClick}
                className="basketIcon"
              />
              <div className='dot'></div>
            </div>
          </>
        )}
      </div>

      {token ? (
        <div className="navbar-profile">
          <Image src={assets.profile_icon} alt="Profile" />
          <ul className="nav-profile-dropdown">
            <li onClick={handleOrderClick}>
              <Image src={assets.bag_icon} alt="Order" />
              <p>Orders</p>
            </li>
            <hr />
            <li onClick={handleLogout}>
              <Image src={assets.logout_icon} alt="Logout" />
              <p>Logout</p>
            </li>
          </ul>
        </div>
      ) : (
        <button onClick={() => setShowLogin(true)} className="signInButton">Sign In</button>
      )}
      {showSearchPopup && (
        <SearchPopup setShowSearchPopup={setShowSearchPopup} />
      )}
    </nav>
  );
};

export default Navbar;
