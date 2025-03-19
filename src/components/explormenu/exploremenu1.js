import React, { useEffect, useState } from 'react';
import './exploremenu2.css';

const ExploreMenu = ({ category, setCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); // Error state
  

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        if (data.length > 0) {
          setCategories(data);
        } else {
          setError('No categories found');
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setError('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    // Loader animation while fetching data
    return (
      <div className="explore-menu-loader">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    // Error state when there is an issue fetching data
    return (
      <div className="explore-menu-error">
        <h3>{error}</h3>
      </div>
    );
  }

  return (
    <div className='explore-menu' id='explore-menu'>
      <h1>Explore our menu</h1>
      <p className='explore-menu-text1'>
        Choose from a diverse menu featuring a delectable array of dishes. Our mission is to satisfy your craving and elevate
        your dining experience, one delicious meal at a time.
      </p>
      <div className='explore-menu-list'>
        {categories.map(categoryItem => (
          <div
            key={categoryItem.name}
            className={`explore-menu-list-item ${category === categoryItem.name ? 'active' : ''}`}
            onClick={() => setCategory(prev => (prev === categoryItem.name ? 'All' : categoryItem.name))}
          >
            <img src={categoryItem.imageUrl} alt={categoryItem.name} className='img'/>
            <p className='explore-menu-text'>{categoryItem.name}</p>
          </div>
        ))}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;
