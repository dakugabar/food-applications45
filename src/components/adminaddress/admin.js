import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './adminaddres.css';

const AdminPage = () => {
  const [adminLocation, setAdminLocation] = useState('');
  const [distanceThreshold, setDistanceThreshold] = useState(12); // Default distance in km
  const [isLoading, setIsLoading] = useState(false);  // Loading state for API requests
  const [isSaving, setIsSaving] = useState(false);    // Loading state for saving settings

  // Fetch admin settings when component loads
  useEffect(() => {
    const fetchAdminSettings = async () => {
      setIsLoading(true);  // Start loading
      try {
        const response = await axios.get('/api/adminSettings');
        if (response.data.success) {
          setAdminLocation(response.data.adminLocation || '');
          setDistanceThreshold(response.data.distanceThreshold || 12);
        } else {
          console.error('Failed to fetch admin settings');
          alert('Failed to fetch admin settings. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching admin settings:', error);
        alert('An error occurred while fetching admin settings.');
      }
      setIsLoading(false);  // Stop loading
    };
    fetchAdminSettings();
  }, []);

  // Save updated settings
  const handleSaveSettings = async () => {
    if (!adminLocation || distanceThreshold <= 0) {
      alert('Please provide valid admin location and distance threshold.');
      return;
    }

    setIsSaving(true);  // Start saving
    try {
      const response = await axios.post('/api/updateAdminSettings', {
        adminLocation,
        distanceThreshold,
      });
      if (response.data.success) {
        toast.success('Address saved successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error('Error updating settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('An unexpected error occurred');
    }
    setIsSaving(false);  // Stop saving
  };

  return (
    <div className='order-admin'>
      <h1>Admin Address</h1>
      {isLoading ? (
        <p className='loading'>Loading settings...</p>
      ) : (
        <>
          <label>
            Admin Location:
            <input
              type="text"
              value={adminLocation}
              placeholder="Enter admin address"
              onChange={(e) => setAdminLocation(e.target.value)}
            />
          </label>
          <label>
            Distance Threshold (km):
            <input
              type="number"
              placeholder="Distance Threshold (km)"
              value={distanceThreshold}
              onChange={(e) => setDistanceThreshold(e.target.value)}
            />
          </label>
          <button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Address'}
          </button>
        </>
      )}
      <ToastContainer />
    </div>
  );
};

export default AdminPage;
