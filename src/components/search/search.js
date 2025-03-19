'use client';
import React, { useState, useEffect } from 'react';
import './search.css'; // Add your CSS file
import { assets } from '../../assets/assets';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import jwt_decode from 'jwt-decode';

const SearchPopup = ({ setShowSearchPopup }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const savedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      setCartItems(savedCartItems);
      setCartItemCount(savedCartItems.reduce((count, item) => count + item.quantity, 0));

      const fetchCategories = async () => {
        if (checkTokenExpiration()) return;
        try {
          setIsLoading(true);
          const response = await fetch('/api/categories');
          if (response.ok) {
            const data = await response.json();
            setCategories(data);
          } else {
            throw new Error('Failed to fetch categories');
          }
        } catch (error) {
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCategories();
    }
  }, [isMounted]);

  const fetchItems = async (category = '', searchText = '') => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/selectitem?category=${category}&searchText=${searchText}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        throw new Error('Failed to fetch items');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchText.trim() !== '' && !selectedCategory) {
      fetchItems('', searchText);
    } else {
      setItems([]);
    }
  }, [searchText]);

  const handleCategorySelect = (categoryName) => {
    setSearchText('');
    setSelectedCategory(categoryName);
    fetchItems(categoryName);
  };

  const handleArrowClick = () => {
    setSelectedCategory('');
    setSearchText('');
    setItems([]);
  };

  const clearCategorySelection = () => {
    setSearchText('');
    setSelectedCategory('');
    setItems([]);
  };

  const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token); // Decode the JWT token without verifying
        if (decoded && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token'); // Remove the expired token
          setShowSearchPopup(false); // Close the search popup
          setShowLoginPopup(true); // Show the login popup
          return true;
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    return false;
  };

  const handleAddClick = async (food) => {
    if (checkTokenExpiration()) return; // Check token expiration

    const existingItemIndex = cartItems.findIndex(item => item.foodId._id === food._id);
    let updatedCartItems;

    if (existingItemIndex > -1) {
      // Item already exists in the cart, call the update API to increase quantity
      updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += 1;
      setCartItems(updatedCartItems);

      // Call the update API
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in first.');
        }

        const response = await fetch('/api/cart/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            foodId: food._id,
            quantity: updatedCartItems[existingItemIndex].quantity,
          }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          console.error('Failed to update item quantity:', result.message);
        }
      } catch (error) {
        console.error('Error updating item quantity:', error);
      }
    } else {
      // Item is new, call the add API to add the item with quantity 1
      updatedCartItems = [...cartItems, { foodId: food, quantity: 1 }];
      setCartItems(updatedCartItems);

      // Call the add API
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in first.');
        }

        const response = await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            foodId: food._id,
            quantity: 1,
            imageUrl: food.imageUrl,
            name: food.name,
            price: food.price,
          }),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
          console.error('Failed to add item to cart:', result.message);
        }
      } catch (error) {
        console.error('Error adding item to cart:', error);
      }
    }
  };

  const handleRemoveClick = async (food) => {
    if (checkTokenExpiration()) return; // Check token expiration

    const existingItemIndex = cartItems.findIndex(item => item.foodId._id === food._id);
    let updatedCartItems;

    if (existingItemIndex > -1) {
      const updatedItem = { ...cartItems[existingItemIndex] };

      if (updatedItem.quantity > 1) {
        // Decrease the quantity and update the cart
        updatedItem.quantity -= 1;
        updatedCartItems = [...cartItems];
        updatedCartItems[existingItemIndex] = updatedItem;

        setCartItems(updatedCartItems);

        // Update the quantity via the API
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No token found. Please log in first.');
          }

          const response = await fetch('/api/cart/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token,
              foodId: food._id,
              quantity: updatedItem.quantity,
            }),
          });

          const result = await response.json();
          if (!response.ok || !result.success) {
            console.error('Failed to update item quantity:', result.message);
          }
        } catch (error) {
          console.error('Error updating item quantity:', error);
        }
      } else {
        // Remove the item from the cart entirely
        updatedCartItems = cartItems.filter(item => item.foodId._id !== food._id);
        setCartItems(updatedCartItems);

        // Call the remove API
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No token found. Please log in first.');
          }

          const response = await fetch('/api/cart/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token,
              foodId: food._id,
            }),
          });

          const result = await response.json();
          if (!response.ok || !result.success) {
            console.error('Failed to remove item from cart:', result.message);
          }
        } catch (error) {
          console.error('Error removing item from cart:', error);
        }
      }
    }
  };

  const handleGoToCart = () => {
    if (router) {
      setShowSearchPopup(false);
      router.push('/Cart');
    }
  };

  useEffect(() => {
    const fetchCartData = async () => {
      const token = localStorage.getItem('token'); // Retrieve the JWT token from localStorage

      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/cart/get', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Set the token in the Authorization header
          },
        });

        const data = await response.json();

        if (response.ok) {
          // If the cart is empty, handle this case
          if (data.cartItems && data.cartItems.length === 0) {
            setCartItems([]);  // Set empty cart if no items found
            setError('');  // Clear error message
          } else {
            setCartItems(data.cartItems);
          }
        } else {
          setError(data.message || 'Failed to fetch cart data');
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        setError('Error fetching cart data');
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  useEffect(() => {
    // Fetch categories only once when the component is mounted
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();

        if (response.ok) {
          setCategories(data.categories);  // Set categories when fetched successfully
        } else {
          setError('Failed to load categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Error fetching categories');
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="search-popup-overlay">
      <div className="search-popup">
        <div className="search-popup-header">
          <h2>Search Items</h2>
        </div>
        <div className="search-popup-body">
          <div className="search-input-container">
            {(searchText || selectedCategory) && (
              <div className="arrow-icon-button" onClick={handleArrowClick}>
                <FontAwesomeIcon icon={faArrowLeft} className="arrow-icon" />
              </div>
            )}
            <input
              type="text"
              className="search-popup-input"
              placeholder={selectedCategory ? `${selectedCategory}` : 'Search for items...'}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              disabled={!!selectedCategory}
            />
            {(searchText || selectedCategory) ? (
              <button className="clear-category-button" onClick={clearCategorySelection}>
                ×
              </button>
            ) : (
              <button className="search-icon-button">
                <Image src={assets.search_icon} alt="Search" className="searchButton" />
              </button>
            )}
          </div>
        </div>

        <div className="search-popup-categories">
          <div className="categories-title2">
            {!selectedCategory && !searchText && <div className="categories-title1">Popular Cuisines</div>}
          </div>
          {searchText || selectedCategory ? (
            <div className="filtered-items">
              {isLoading ? (
                <p className="loading-item">Loading items...</p>
              ) : error ? (
                <p className="error">{error}</p>
              ) : items.length > 0 ? (
                <div className="items-list">
                  {items.map((item) => (
                    <div className="item-row" key={item._id}>
                      <div className="item-image">
                        <img src={item.imageUrl} alt={item.name} />
                      </div>
                      <div className="item-details">
                        <p className="item-name">{item.name}</p>
                        <p className="item-description">Dish</p>
                       
                      </div>
                      <div>
                      {cartItems.some((cartItem) => cartItem.foodId && cartItem.foodId._id === item._id) ? (
  <div className="quantity-controls">
    <button
      className="quantity-decrease"
      onClick={() => handleRemoveClick(item)} // Decrease quantity
    >
      -
    </button>
    <span className="quantity">
      {
        cartItems.find((cartItem) => cartItem.foodId._id === item._id)?.quantity // Display current quantity
      }
    </span>
    <button
      className="quantity-increase"
      onClick={() => handleAddClick(item)} // Increase quantity
    >
      +
    </button>
  </div>
) : (
  <button className="add-to-cart" onClick={() => handleAddClick(item)}>
    Add
  </button>
)}

                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty">No items found for {selectedCategory || searchText}.</p>
              )}
            </div>
          ) : (
            <div className="categories-list1">
              {isLoading ? (
                <p className="loading-item">Loading categories...</p>
              ) : error ? (
                <p className="error">{error}</p>
              ) : categories.length > 0 ? (
                <div className="categories-container">
                  {categories.map((category, index) => (
                    <div
                      key={category._id}
                      className={`category-item1 ${index < categories.length - 3 ? 'has-border' : ''}`}
                      onClick={() => handleCategorySelect(category.name)}
                    >
                      <img src={category.imageUrl} alt={category.name} className="img1" />
                      <p>{category.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty">No categories found.</p>
              )}
            </div>
          )}
        </div>

        <div className='cart-close'>
          <button className="search-popup-close" onClick={() => setShowSearchPopup(false)}>
            Close
          </button>

          {cartItems.length > 0 && (
            <button onClick={handleGoToCart} className='go-to-cart-button'>
            Go to Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
          </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;
