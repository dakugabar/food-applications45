import React, { useState, useEffect } from 'react';
import './gst2.css';

const Gst = () => {
  const [gstName, setGstName] = useState('');
  const [gstRate, setGstRate] = useState('');
  const [gstList, setGstList] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    fetchGstList();
  }, []);

  const fetchGstList = async () => {
    try {
      const response = await fetch('/api/gst');
      const data = await response.json();
      setGstList(data);
    } catch (error) {
      console.error('Error fetching GST list:', error);
    } finally {
      setIsLoading(false); // Set loading to false once data is fetched or error occurs
    }
  };

  const handleGstNameChange = (e) => setGstName(e.target.value.toUpperCase());
  const handleGstRateChange = (e) => setGstRate(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/gst/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gstName, gstRate }),
      });
      const newGst = await response.json();
      setGstList([...gstList, newGst]);
      setGstName('');
      setGstRate('');
    } catch (error) {
      console.error('Error adding GST:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/gst/delete/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGstList(gstList.filter((gst) => gst._id !== id));
      } else {
        const errorText = await response.text();
        console.error('Error deleting GST item:', errorText);
      }
    } catch (error) {
      console.error('Error deleting GST item:', error);
    }
  };

  return (
    <div className="gst-container">
      <h2>GST</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="gst-name">GST Name</label>
          <input
            type="text"
            id="gst-name"
            value={gstName}
            onChange={handleGstNameChange}
            placeholder="Enter GST name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="gst-rate">GST Rate (%)</label>
          <input
            type="number"
            id="gst-rate"
            value={gstRate}
            onChange={handleGstRateChange}
            placeholder="Enter GST rate"
            required
          />
        </div>

        <button type="submit">Save</button>
      </form>

      <div className="gst-list">
        <h3>GST List</h3>
        {isLoading ? (
          <p className='loading'>Loading...</p> // Display a loading indicator
        ) : (
          <ul>
            {gstList.map((gst) => (
              <li key={gst._id}>
                {gst.gstName} - {gst.gstRate}%
                <p className='delete1'>
                <img 
  src="/bin.png" 
  alt="Delete" 
  className="delete-image" 
  onClick={() => handleDelete(gst._id)} 
/>

          </p>    </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Gst;
