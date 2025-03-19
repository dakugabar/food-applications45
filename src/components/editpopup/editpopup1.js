import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './editpopup2.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const EditPopup = ({ item, onClose, onUpdate }) => {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [price, setPrice] = useState(item.price || '');
  const [discount, setDiscount] = useState(item.discount || '');
  const [description, setDescription] = useState(item.description || '');
  const [image, setImage] = useState(null);
  const [gstRate, setGstRate] = useState(item.gstRate || '');
  const [categories, setCategories] = useState([]);
  const [gstList, setGstList] = useState([]);
  const [vegOrNonVeg, setVegOrNonVeg] = useState(item.vegOrNonVeg || 'Veg');
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        toast.error('Failed to fetch categories');
      }
    };

    const fetchGstRates = async () => {
      try {
        const response = await fetch('/api/gst');
        const data = await response.json();
        setGstList(data);
      } catch (error) {
        toast.error('Failed to fetch GST rates');
      }
    };

    fetchCategories();
    fetchGstRates();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleUpdate = async () => {
    // Validation
    if (!name || !category || !price || !gstRate) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (price < 0) {
      toast.error('Price cannot be negative.');
      return;
    }

    setLoading(true); // Set loading to true before making the request

    const formData = new FormData();
    formData.append('id', item._id);
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('discount', discount);
    formData.append('gstRate', gstRate);
    formData.append('vegOrNonVeg', vegOrNonVeg);

    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch(`/api/updateitem`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const updatedItem = {
          ...item,
          name,
          category,
          price,
          description,
          discount,
          gstRate,
          vegOrNonVeg,
          imageUrl: image ? URL.createObjectURL(image) : item.imageUrl,
        };

        onUpdate(updatedItem);
        toast.success('Item updated successfully');
        onClose();
      } else {
        const errorResponse = await response.json();
        toast.error(`Failed to update item: ${errorResponse.message || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error('An error occurred while updating the item');
    } finally {
      setLoading(false); // Reset loading state after request
    }
  };

  return (
    <div className="popup2" role="dialog" aria-labelledby="edit-popup-title" aria-modal="true">
      <ToastContainer />
      <div className="popup-content2">
        <div className="popup-header2">
          <h2 id="edit-popup-title">Edit Item</h2>
          <FontAwesomeIcon
            icon={faTimes}
            className="close-icon"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        <div className='text-form3'>Upload Image</div>
        <label htmlFor='image-upload' className='image-upload-label2'>
          <img
            src={image ? URL.createObjectURL(image) : '/upload_area.png'}
            alt='Upload Preview'
          />
        </label>
        <input
          id='image-upload'
          type='file'
          accept="image/*" // Accept only image files
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />

        <div className="input-row2">
          <div>
            <div className='text-form3'> Name</div>
            <input
              onChange={(e) => setName(e.target.value)}
              name='name'
              value={name}
              type='text'
              placeholder='Enter Name'
              required
            />
          </div>
          <div>
            <div className='text-form3'> Discount (%)</div>
            <input 
              type="number" 
              value={discount} 
              onChange={(e) => setDiscount(parseFloat(e.target.value) || '')}
              placeholder="Discount (%)"
            />
          </div>
          <div>
          <div className='text-form3'>Type</div>
          <select 
            value={vegOrNonVeg} 
            onChange={(e) => setVegOrNonVeg(e.target.value)}
          >
            <option value='Veg'>Veg</option>
            <option value='Non-Veg'>Non-Veg</option>
          </select>
          </div>
        </div>

        <div className="input-row2">
          <div>
            <div className='text-form3'> Category</div>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className='text-form3'> Price</div>
            <input 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(parseFloat(e.target.value) || '')}
              placeholder="Price"
              required
            />
          </div>
          
          <div>
            <div className='text-form3'>GST Rate (%)</div>
            <select
              onChange={(e) => setGstRate(e.target.value)}
              value={gstRate}
              required
            >
              {gstList.length > 0 ? (
                gstList.map((gst) => (
                  <option key={gst._id} value={gst.gstRate}>
                    {gst.gstName} - {gst.gstRate}%
                  </option>
                ))
              ) : (
                <option value="" disabled>No GST rates available</option>
              )}
            </select>
          </div>
        </div>

        <div className='text-form3'>Product Description</div>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          placeholder='Enter Description'
          rows='4'
        />

        <div className='updatebutton'>
          <button onClick={handleUpdate} disabled={loading}>
            {loading ? 'Updating...' : 'Update Item'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPopup;
