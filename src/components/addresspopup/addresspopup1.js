import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../../pages/order1.css';

const AddressPopup = ({
  setShowPopup,
  location,
  setLocation,
  flatNo,
  setFlatNo,
  landmark,
  setLandmark,
  adminLocation,
  distanceThreshold,
  setSavedAddresses,
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const geocoder = useRef(null);
  const [isDeliverable, setIsDeliverable] = useState(true);
  const [errors, setErrors] = useState({ location: '', flatNo: '', landmark: '' });
  const [loading, setLoading] = useState(false);
  let googleMapsLoaded = false;

  // Load Google Maps only once
  const loadGoogleMaps = () => {
    if (googleMapsLoaded) return;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCuro_Das6SA4HRZzGnqR6VHHgyfprryCg&libraries=places`;
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      googleMapsLoaded = true;
      initMap();
    };
  };

  const initMap = () => {
    if (window.google && mapRef.current) {
      const defaultLocation = { lat: 26.9124, lng: 75.7873 }; // Example: Jaipur, India
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 12,
      });

      setMap(googleMap);
      geocoder.current = new window.google.maps.Geocoder();

      const mapMarker = new window.google.maps.Marker({
        position: defaultLocation,
        map: googleMap,
        draggable: true,
      });

      setMarker(mapMarker);

      // Handle click on map
      googleMap.addListener('click', (event) => {
        const clickedLocation = event.latLng;
        mapMarker.setPosition(clickedLocation);
        updateAddress(clickedLocation);
      });

      // Handle marker drag end
      mapMarker.addListener('dragend', () => {
        const newPosition = mapMarker.getPosition();
        updateAddress(newPosition);
      });
    }
  };

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  const updateAddress = (location) => {
    if (geocoder.current) {
      geocoder.current.geocode({ location }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const formattedAddress = results[0].formatted_address;
          setLocation(formattedAddress);
          checkDeliverability(location); // Pass coordinates
        } else {
          alert('Failed to retrieve address. Please try again.');
        }
      });
    }
  };

  const checkDeliverability = (userLocation) => {
    if (!window.google || !adminLocation) return;
    const service = new window.google.maps.DistanceMatrixService();

    geocoder.current.geocode({ address: adminLocation }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const adminCoords = results[0].geometry.location;

        service.getDistanceMatrix(
          {
            origins: [adminCoords],
            destinations: [userLocation],
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (response, status) => {
            if (status === 'OK') {
              const distanceInMeters = response.rows[0].elements[0].distance.value;
              const distanceInKm = distanceInMeters / 1000;
              setIsDeliverable(distanceInKm <= distanceThreshold);
            } else {
              alert('Error calculating distance');
            }
          }
        );
      } else {
        alert('Failed to retrieve admin location');
      }
    });
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (map && marker) {
            map.setCenter(userLocation);
            marker.setPosition(userLocation);
            updateAddress(userLocation); // Update user's location
          }
        },
        (error) => {
          alert('Error getting location: ' + error.message);
        },
        { timeout: 10000 }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleSaveAddress = async () => {
    setLoading(true); // Start loading state
    const newErrors = { location: '', flatNo: '', landmark: '' };
    let hasError = false;
  
    // Validate input fields
    if (!location) {
      newErrors.location = 'Please fill this field';
      hasError = true;
    }
    if (!flatNo) {
      newErrors.flatNo = 'Please fill this field';
      hasError = true;
    }
    if (!landmark) {
      newErrors.landmark = 'Please fill this field';
      hasError = true;
    }
  
    setErrors(newErrors);
  
    if (hasError) {
      setLoading(false); // Stop loading if there are errors
      return;
    }
  
    // Check if delivery is available
    if (!isDeliverable) {
      alert('Delivery is not available for this location');
      setLoading(false); // Stop loading
      return;
    }
  
    const token = localStorage.getItem('token');
    if (!token) {
      alert('User not authenticated');
      setLoading(false); // Stop loading
      return;
    }
  
    const addressData = { token, location, flatNo, landmark };
  
    try {
      // API call to save the address
      const response = await axios.post('/api/address', addressData);
  
      if (response.data.success) {
        // Update saved addresses if the API call is successful
        const newAddress = response.data.address;
        setSavedAddresses((prev) => [newAddress, ...prev]);
  
        // Reset the form fields and close the popup
        setLocation('');
        setFlatNo('');
        setLandmark('');
        setErrors({}); // Clear any previous error messages
        setShowPopup(false); // Close the address popup
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('An unexpected error occurred');
    } finally {
      setLoading(false); // Stop loading after the request is finished
    }
  };
  

  return (
    <div className="popup-container">
      <div className="popup">
        <div className="popup-header">
          <h3>Save Delivery Address</h3>
          <FontAwesomeIcon icon={faTimes} className="remove-icon" onClick={() => setShowPopup(false)} />
        </div>
        <div className="map-container">
          <div ref={mapRef} className="map"></div>
        </div>
        {!isDeliverable && <p className="error-message">Delivery is not available for this location.</p>}
        <p className="locate">
          <input
            type="text"
            placeholder="Enter Address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input-field1"
          />
          <button className="locate-me-btn" onClick={handleLocateMe}>Locate Me</button>
        </p>
        {errors.flatNo && <span className="error-text">{errors.flatNo}</span>}
        <input
          type="text"
          placeholder="Flat No."
          value={flatNo}
          onChange={(e) => setFlatNo(e.target.value)}
          className={`input-field ${errors.flatNo ? 'error-border' : ''}`}
        />
        {errors.landmark && <span className="error-text">{errors.landmark}</span>}
        <input
          type="text"
          placeholder="Landmark"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          className={`input-field ${errors.landmark ? 'error-border' : ''}`}
        />
       <button 
        className="save-address-btn" 
        onClick={handleSaveAddress} 
        disabled={loading} // Disable button when loading
      >
        {loading ? (
          <span className="loading-spinner"></span> // Show loading spinner
        ) : (
          'Save Address' // Normal button text
        )}
      </button>
      </div>
    </div>
  );
};

export default AddressPopup;
