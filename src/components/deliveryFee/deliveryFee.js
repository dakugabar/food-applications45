import React, { useState, useEffect } from 'react';
import './deliveryFee.css';

const DeliveryFee = () => {
  const [ranges, setRanges] = useState([]);
  const [newRange, setNewRange] = useState({ min: '', max: '', fee: '' });
  const [editRange, setEditRange] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Fetch all delivery ranges
  const fetchRanges = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/delivery-range');
      const { data } = await response.json();
      setRanges(data);
    } catch (error) {
      console.error('Error fetching ranges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanges();
  }, []);

  // Handle new range input changes
  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    setNewRange((prev) => ({ ...prev, [name]: value }));
  };

  // Add a new range
  const addNewRange = async () => {
    const { min, max, fee } = newRange;
    if (min && max && fee) {
      setLoadingAdd(true);
      try {
        const response = await fetch('/api/delivery-range', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ min, max, fee }),
        });
        if (response.ok) {
          fetchRanges();
          setNewRange({ min: '', max: '', fee: '' });
        }
      } catch (error) {
        console.error('Error adding range:', error);
      } finally {
        setLoadingAdd(false);
      }
    }
  };

  // Delete a range
  const deleteRange = async (id) => {
    try {
      await fetch('/api/delivery-range', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchRanges();
    } catch (error) {
      console.error('Error deleting range:', error);
    }
  };

  // Open the edit popup
  const openEditPopup = (range) => {
    setEditRange(range);
    setIsEditing(true);
  };

  // Close the edit popup
  const closeEditPopup = () => {
    setEditRange(null);
    setIsEditing(false);
  };

  // Update a range
  const updateRange = async () => {
    const { _id, min, max, fee } = editRange;
    setLoadingUpdate(true);
    try {
      const response = await fetch('/api/delivery-range', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: _id, min, max, fee }),
      });
      if (response.ok) {
        fetchRanges();
        closeEditPopup();
      }
    } catch (error) {
      console.error('Error updating range:', error);
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="delivery-fee-container">
      <div className="add-range-form">
        <h3 className="title-delivery">Add New Range</h3>
        <input
          type="number"
          name="min"
          value={newRange.min}
          onChange={handleRangeChange}
          placeholder="Min Distance (km)"
        />
        <input
          type="number"
          name="max"
          value={newRange.max}
          onChange={handleRangeChange}
          placeholder="Max Distance (km)"
        />
        <input
          type="number"
          name="fee"
          value={newRange.fee}
          onChange={handleRangeChange}
          placeholder="Fee (₹)"
        />
        <button type="button" onClick={addNewRange} className="submit-btn">
          {loadingAdd ? <span className="spinner"></span> : 'Add Range'}
         
        </button>
      </div>

      <div className="range-display">
        <h3 className="title-delivery1">Defined Ranges and Fees</h3>
        <ul className="ranges-list">
          {loading ? (
            <p className="loading">Loading...</p>
          ) : (
            ranges.map((range, index) => (
              <li key={index} className="range-item">
                <div className="range-distance">
                  <span>{range.min} km</span> ---- <span>{range.max} km</span>
                </div>
                <div className="range-fee">₹{range.fee}</div>
                <div className="range-actions">
                  <button className="edit-btn" onClick={() => openEditPopup(range)}>
                    Update
                  </button>
                  </div>
                  <div className="range-actions">
                  <button className="delete-btn-fee" onClick={() => deleteRange(range._id)}>
                    &times;
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {isEditing && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-title-range">
              <h3 className="popup-title">Edit Range</h3>
            </div>
            <div className="popup-delivery">
              <div className="popup-field">
                <label htmlFor="min">Min Distance (km)</label>
                <input
                  type="number"
                  name="min"
                  value={editRange.min}
                  onChange={(e) =>
                    setEditRange((prev) => ({ ...prev, min: e.target.value }))
                  }
                />
              </div>
              <div className="popup-field">
                <label htmlFor="max">Max Distance (km)</label>
                <input
                  type="number"
                  name="max"
                  value={editRange.max}
                  onChange={(e) =>
                    setEditRange((prev) => ({ ...prev, max: e.target.value }))
                  }
                />
              </div>
              <div className="popup-field">
                <label htmlFor="fee">Fee (₹)</label>
                <input
                  type="number"
                  name="fee"
                  value={editRange.fee}
                  onChange={(e) =>
                    setEditRange((prev) => ({ ...prev, fee: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="popup-buttons">
              <button className="close-btn" onClick={closeEditPopup}>
                Close
              </button>
              <button className="update-btn" onClick={updateRange}>
                {loadingUpdate ? <span className="spinner"></span> : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryFee;
