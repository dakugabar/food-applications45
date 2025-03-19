import React, { useEffect, useRef, useState } from 'react';
import './image.css';

const HeaderImage = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('/upload_area.png');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [existingImageId, setExistingImageId] = useState(null); // For tracking existing image ID
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Fetch existing data from the database when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/headerImage'); // Replace with your actual API endpoint
        if (response.ok) {
          const data = await response.json();
          // Assume the first item is the one you want
          if (data.length > 0) {
            const existingData = data[0]; // Adjust based on your data structure
            setTitle(existingData.title);
            setDescription(existingData.description);
            setUrl(existingData.url);
            setImagePreview(existingData.imagePath); // Assuming imagePath is the URL
            setExistingImageId(existingData._id); // Store the ID for updates
          }
        } else {
          console.error('Error fetching data');
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };

    fetchData();
  }, []); // Empty dependency array to run only once on mount

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!title || !imagePreview) {
      alert('Title and image are required!');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('url', url);
    if (image) {
      formData.append('image', image); // Append image only if it's present
    }

    setIsSaving(true);

    try {
      const method = existingImageId ? 'PUT' : 'POST'; // Use PUT if an existing image ID is available
      const url = existingImageId ? `/api/headerImage?id=${existingImageId}` : '/api/headerImage';
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (res.ok) {
        console.log(existingImageId ? 'Image data updated successfully!' : 'Image data saved successfully!');
        // Optionally, you can refetch data to update the state with the latest
        // await fetchData();
      } else {
        // Handle error response
        console.error('Error response:', await res.json());
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='header-back'>
      <div className='header-back-title'>
       <h2> Header Image </h2>
      </div>
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
        <div className="header-container">
          <div className="image-preview" onClick={() => fileInputRef.current.click()}>
            <img
              src={imagePreview}
              alt="Uploaded"
              className="preview-img"
            />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title"
            className="title-input"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter an optional URL"
            className="url-input"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description"
            rows="6"
            className="description-input"
          />
          <button className='submit-btn' onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving...' : existingImageId ? 'Update' : 'Save'}
          </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HeaderImage;
