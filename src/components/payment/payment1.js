import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './payment2.css';
// import '../addcategory/addCategory2.css';

const Payment = () => {
  const [items, setItems] = useState([]);
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoadingPayments(true);
      try {
        const { data } = await axios.get('/api/payment');
        setItems(data);
      } catch {
        setError('Failed to fetch payments');
      } finally {
        setLoadingPayments(false);
      }
    };
    fetchPayments();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };

  const handleAddPayment = async () => {
    if (imageFile && name && title) {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('title', title);
      formData.append('image', imageFile);

      try {
        const { data } = await axios.post('/api/payment', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setItems([...items, data.Payment]);
        setImage(null);
        setImageFile(null);
        setName('');
        setTitle('');
      } catch {
        setError('Failed to add payment');
      } finally {
        setLoading(false);
      }
    } else {
      setError('All fields and an image are required');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setLoading(true);
    try {
      const newStatus = status === 'Active' ? 'Deactive' : 'Active';
      const { data } = await axios.put(`/api/update-payment?id=${id}`, { status: newStatus });
      setItems(items.map(item => (item._id === id ? data : item)));
    } catch {
      setError('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/api/delete-payment?id=${id}`);
      setItems(items.filter(item => item._id !== id));
    } catch {
      setError('Failed to delete payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="add-category1">
        <h3>Add New Payment</h3>
        <div className="flex-row">
          <label htmlFor="file-upload" className="custom-file-upload">
            <img src={image || '/upload_area.png'} alt="Upload Preview" className="image-upload" />
          </label>
          <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} />
          <input type="text11" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input type="text11" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className='add-btn-button'>
        <button className="add-item-btn" onClick={handleAddPayment} disabled={loading}>
          {loading ? 'Adding...' : 'Add Payment'}
        </button>
        {error && <p className="error">{error}</p>}
        </div>
      </div>

      <div className="payment-list">
        <h3>Payment List</h3>
        {loadingPayments ? <p className='loading'>Loading payments...</p> : (
          items.length > 0 ? (
            <ul className="list-table">
              <li className="list-table-header">
                <b>Image</b><b>Name</b><b>Title</b><b>Status</b><b>Actions</b>
              </li>
              {items.map(item => (
                <li key={item._id} className={`payment-item ${item.status}`}>
                  <b>
                  <img className='img-scen' src={item.imageUrl} alt="Payment" />
                  </b>
                  <b>{item.name}</b>
                  <b>{item.title}</b>
                  <b>
                  <label className="switch">
                    <input type="checkbox" checked={item.status === 'Active'} onChange={() => handleUpdateStatus(item._id, item.status)} />
                    <span className="slider"></span>
                  </label>
                  </b>
                  <span>
                  <img
  src="/bin.png" /* Path to your delete icon image */
  alt="Delete"
  className="delete-icon"
  onClick={() => handleDelete(item._id)}
/>
</span>

                </li>
              ))}
            </ul>
          ) : <p>No payments found.</p>
        )}
      </div>
    </div>
  );
};

export default Payment;
