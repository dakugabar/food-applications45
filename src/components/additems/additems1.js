import React, { useState, useEffect } from 'react';
import './additems2.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddItem = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    discount: "",
    vegOrNonVeg: "",
    gstRate: "", 
  });
  const [categories, setCategories] = useState([]);
  const [gstList, setGstList] = useState([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchGstList(); 
  }, []);

  // Clean up the image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/getcategories');
      if (response.ok) {
        const result = await response.json();
        setCategories(result.categories);
      } else {
        handleError('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error:', error);
      handleError('An error occurred while fetching categories');
    }
  };

  const fetchGstList = async () => {
    try {
      const response = await fetch('/api/gst');
      if (response.ok) {
        const result = await response.json();
        setGstList(result); 
      } else {
        handleError('Failed to fetch GST list');
      }
    } catch (error) {
      console.error('Error:', error);
      handleError('An error occurred while fetching GST list');
    }
  };

  const handleError = (message) => {
    toast.error(message);
  };

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Validate form data
    if (!image || !data.name || !data.description || !data.price || !data.discount || !data.category || !data.vegOrNonVeg || !data.gstRate) {
      handleError('Please fill all the required fields.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price);
    formData.append('discount', data.discount);
    formData.append('category', data.category);
    formData.append('gstRate', data.gstRate); 
    formData.append('vegOrNonVeg', data.vegOrNonVeg);
    formData.append('image', image);

    try {
      const response = await fetch('/api/additem', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Form submitted', result);
        setImage(null);
        setImagePreview(null);  // Clear the image preview
        setData({
          name: "",
          description: "",
          price: "",
          discount: "",
          category: "",
          vegOrNonVeg: "",
          gstRate: "", 
        });
        toast.success('Food Added');
      } else {
        handleError('Failed to submit form');
      }
    } catch (error) {
      console.error('Error:', error);
      handleError('An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        handleError('Image size should be less than 2MB');
      } else if (!['image/png', 'image/jpeg'].includes(file.type)) {
        handleError('Only PNG or JPEG images are allowed');
      } else {
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  return (
    <div className='add-item-section1'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className='add-img-upload flex-col'>
          <p>Upload Image</p>
          <label htmlFor='image' className='image-upload-label1'>
            <img 
              src={imagePreview ? imagePreview : '/upload_area.png'} 
              alt='Upload Preview' 
              className='image-upload'
            />
          </label>
          <input
            onChange={handleImageChange}
            type='file'
            id='image'
            hidden
            required
          />
        </div>
      
        <div className='add-product-name flex-col'>
          <p>Product Name</p>
          <input
            onChange={onChangeHandler}
            name='name'
            value={data.name}
            type='text'
            placeholder='Enter Name'
            required
          />
        </div>
       

        <div className='add-product-description flex-col'>
          <p>Product Description</p>
          <textarea
            onChange={onChangeHandler}
            name='description'
            value={data.description}
            placeholder='Enter Description'
            rows={4}
            required
          ></textarea>
        </div>
        <div className="input-row2">
          <div className='add-price flex-col'>
            <p>Product Category</p>
            <select
              onChange={onChangeHandler}
              name='category'
              value={data.category}
              required
            >
               <option value="" disabled>
      Choose categories
    </option>
              {categories.length > 0 ? (
                categories.map((category) => (
                  
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>No categories available</option>
              )}
            </select>
          </div>
          <div className="add-product-name flex-col">
          <p>Food Type</p>
          
            <select name="vegOrNonVeg" value={data.vegOrNonVeg} onChange={onChangeHandler} required>
              <option value="" disabled>
                Choose Food Type
              </option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
            </select>
        
        </div>
          <div className='add-price flex-col'>
            <p>Product Discount (%)</p>
            <input
              onChange={onChangeHandler}
              name='discount'
              value={data.discount}
              type='number'
              placeholder='Enter Discount'
            />
          </div>
        </div>
        <div className="input-row2">
          <div className='add-price flex-col'>
            <p>Product Price</p>
            <input
              onChange={onChangeHandler}
              name='price'
              value={data.price}
              type='number'
              placeholder='₹200'
              required
            />
          </div>
          <div className='add-price flex-col'>
            <p>GST Rate (%)</p>
            <select
              onChange={onChangeHandler}
              name='gstRate'
              value={data.gstRate}
            >
              <option value="">Choose GST Rate</option> 
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
        <button className='add-item-btn1' type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Item'}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddItem;
