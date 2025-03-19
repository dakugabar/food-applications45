import React, { useState, useEffect } from 'react';
import './star2.css'; 
import axios from 'axios'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faTimes } from '@fortawesome/free-solid-svg-icons'; 


const ReviewPopup = ({ orderId, orderItemName, closeReviewPopup }) => {
  const [review, setReview] = useState('');
  const [ratings, setRatings] = useState({});
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await axios.get(`/api/reviews/${orderId}`);
        if (response.data.success) {
          setExistingReview(response.data.data);
          setReview(response.data.data.comment || '');
          const initialRatings = {};
          response.data.data.reviews.forEach(({ item, rating }) => {
            initialRatings[item] = rating;
          });
          setRatings(initialRatings);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchReview();
  }, [orderId]);

  const handleStarClick = (item, star) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [item]: star,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reviewData = Object.keys(ratings).map((item) => ({
      item,
      rating: ratings[item],
    }));

    try {
      const response = await axios.post('/api/reviews', {
        orderId,
        reviews: reviewData,
        comment: review,
      });

      if (response.data.success) {
       
        closeReviewPopup(); 
      } else {
        alert('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    }
  };

  return (
    <div className="review-popup">
      <div className="review-popup-content">
        <div className="popup-header">
          <h2 className="popup-title">Review Your Order</h2>
          <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={closeReviewPopup} />
        </div>
<hr/>
        <div className="food-items">
          <h3 className="restaurant-review-title">Food Review</h3>
          {orderItemName.split(', ').map((item, index) => (
            <div key={index} className="food-item">
              <span>{item}</span>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${ratings[item] >= star ? 'filled' : ''}`}
                    onClick={() => handleStarClick(item, star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <hr />
        <h3 className="delivery-review-title">Restaurant Review</h3>
        <div className="delivery-item">
          <span>Restaurant</span>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${ratings['Restaurant'] >= star ? 'filled' : ''}`}
                onClick={() => handleStarClick('Restaurant', star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <hr />
        <h3 className="delivery-review-title">Delivery Review</h3>
        <div className="delivery-item">
          <span>Delivery Boy</span>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${ratings['Delivery Boy'] >= star ? 'filled' : ''}`}
                onClick={() => handleStarClick('Delivery Boy', star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <hr />
        <div className="delivery-item1">
          <span>Comment</span>
          <textarea
            rows="4"
            className="review-textarea"
            placeholder="Write your review..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>
        <button className="submit-button" onClick={handleSubmit}>
          {existingReview ? 'Update Review' : 'Submit Review'}
        </button>
        
      </div>
    </div>
  );
};

export default ReviewPopup;
