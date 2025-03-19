import React, { useState, useEffect } from "react";
import "./edit.css";

const EditPopup = ({ show, category, onClose, fetchCategories }) => {
  const [updatedCategory, setUpdatedCategory] = useState({
    name: category?.name || "",  // Initialize with the current category name
    image: null,  // No image selected initially
  });
  const [isUpdating, setIsUpdating] = useState(false);  // State to manage update process

  useEffect(() => {
    if (category) {
      setUpdatedCategory({
        name: category?.name || "",  // Initialize name when category changes
        image: null,  // Reset image when category changes
      });
    }
  }, [category]);

  // Handle image change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUpdatedCategory((prevState) => ({
        ...prevState,
        image: file,  // Update the image when a new file is selected
      }));
    }
  };

  // Handle the update process
  const handleUpdate = async () => {
    // Check if category name is not empty
    if (!updatedCategory.name) {
      alert("Category name is required.");
      return;
    }

    // Show loading state
    setIsUpdating(true);

    // Prepare FormData for the API request
    const formData = new FormData();
    formData.append("name", updatedCategory.name);
    if (updatedCategory.image) {
      formData.append("image", updatedCategory.image);  // Add image if it's updated
    }

    try {
      // Make a PUT request to update the category
      const response = await fetch(`/api/updatecategory/${category._id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        // Success, alert the user and close the popup
        const updatedCategoryData = await response.json();
        alert("Category updated successfully!");
        onClose();
        fetchCategories();  // Re-fetch the categories to show the updated list
      } else {
        const errorData = await response.json();
        alert(`Update failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert("An error occurred while updating the category.");
    } finally {
      // Reset updating state
      setIsUpdating(false);
    }
  };

  // If the popup isn't supposed to show, return null
  if (!show) return null;

  return (
    <div className="popup-overlay-category ">
      <div className="popup-container-category ">
        {/* Image upload and preview */}
        <label htmlFor="image-upload" className="image-upload-label2">
          <img
            src={
              updatedCategory.image
                ? URL.createObjectURL(updatedCategory.image)  // Show uploaded image preview
                : category.imageUrl || "/upload_area.png"  // Default image if no new one is selected
            }
            alt="Upload Preview"
            className="category-image-preview"
          />
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}  // Handle new image upload
          style={{ display: "none" }}
        />
        
        {/* Category name input with label */}
        <label htmlFor="category-name" className="popup-input-label">
          Category Name
        </label>
        <input
          id="category-name"
          type="text"
          className="popup-input"
          value={updatedCategory.name}  // Show the current or updated category name
          onChange={(e) =>
            setUpdatedCategory((prevState) => ({
              ...prevState,
              name: e.target.value,  // Update the category name as the user types
            }))
          }
          placeholder="Enter category name"
        />
        
        {/* Popup buttons */}
        <div className="popup-buttons">
          <button className="popup-close-btn" onClick={onClose}>
            Close
          </button>
          <button
            className="popup-update-btn"
            onClick={handleUpdate}  // Trigger the update on button click
            disabled={isUpdating}  // Disable the button while updating
          >
            {isUpdating ? "Updating..." : "Update"}  {/* Show loading state */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPopup;
