import React, { useEffect, useState } from 'react';
import './header2.css';

const Header = () => {
  const [headerImage, setHeaderImage] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchHeaderImages = async () => {
      try {
        const response = await fetch('/api/headerImage');
        const data = await response.json();

        if (data.length > 0) {
          setHeaderImage(data[0]);
        } else {
          setError('No header images found');
        }
      } catch (error) {
        setError('Error fetching header images');
        console.error('Error fetching header images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderImages();
  }, []);

  if (loading) {
    // Skeleton or loading state with centered animation
    return (
      <div className="header-loader">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    // Error state when no data is found
    return (
      <div className="header-error">
        <h3>{error}</h3>
      </div>
    );
  }

  // Main content when data is loaded
  return (
    <div
      className="header"
      style={{
        backgroundImage: `url(${headerImage?.imagePath || '/header_img.png'})`, // Fallback image
      }}
    >
      <div className="header-contents">
        <h2>{headerImage?.title || 'Default Title'}</h2>
        <p>{headerImage?.description || 'Default Description'}</p>
        <a href={headerImage?.url || '#'}>
          <button>View Menu</button>
        </a>
      </div>
    </div>
  );
};

export default Header;
