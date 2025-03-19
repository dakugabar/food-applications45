import React, { useState, useEffect } from 'react';
import './addcategory2.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditPopup from '../categoryedit/edit';

const AddCategory = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", image: null });
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingAddCategory, setLoadingAddCategory] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('/api/getcategories');
      if (response.ok) {
        const result = await response.json();
        setCategories(result.categories);
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      toast.error('An error occurred while fetching categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.image) {
      toast.error('Please provide a category name and image.');
      return;
    }

    setLoadingAddCategory(true);

    const formData = new FormData();
    formData.append('name', newCategory.name);
    formData.append('image', newCategory.image);

    try {
      const response = await fetch('/api/addcategory', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setCategories((prevState) => [...prevState, result.category]);
        setNewCategory({ name: "", image: null });
        toast.success('Category added successfully');
      } else {
        throw new Error('Failed to add category');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while adding the category');
    } finally {
      setLoadingAddCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    try {
      const response = await fetch(`/api/deletecategory/${categoryName}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter((category) => category.name !== categoryName));
        toast.success('Category deleted successfully');
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while deleting the category');
    }
  };

  const handleIconClick = () => {
    document.getElementById('category-file-input').click();
  };

  const handleCategoryImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewCategory((prevState) => ({
        ...prevState,
        image: file,
      }));
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsPopupOpen(true);
  };

  return (
    <div className="category1">
      <div className="add-category">
        <h3>Add New Category</h3>
        <div className="flex-row1">
          <img
            src={newCategory.image ? URL.createObjectURL(newCategory.image) : '/upload_area.png'}
            alt="Upload Preview"
            onClick={handleIconClick}
            style={{ cursor: 'pointer' }}
          />
          <input
            id="category-file-input"
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleCategoryImageChange}
            style={{ display: 'none' }}
          />
          <p>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory((prevState) => ({ ...prevState, name: e.target.value }))
              }
            />
          </p>
        </div>
        <button
          className="add-item-btn1"
          onClick={handleAddCategory}
          disabled={loadingAddCategory}
        >
          {loadingAddCategory ? 'Adding...' : 'Add Category'}
        </button>
      </div>
      <div className="category-list">
        <h3>Category List</h3>
        {loadingCategories ? (
          <p className="loading">Loading categories...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <ul>
            <div className="list-table">
              <div className="list-table-format title">
                <b>Image</b>
                <b>Category</b>
                <b>Action</b>
                <b>Action</b>
              </div>
              <div className="table-category">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <li key={category._id}>
                      <span>
                        <img
                          src={category.imageUrl || '/default_image.png'}
                          alt={category.name}
                          className="category-image"
                        />
                      </span>
                      <span>{category.name}</span>
                      <span>
                        <button
                          className="edit-category"
                          onClick={() => handleEdit(category)}
                        >
                          Edit
                        </button>
                      </span>
                      <span>
                        <img
                          src="/bin.png"
                          alt="Delete"
                          className="delete-icon"
                          onClick={() => handleDeleteCategory(category.name)}
                        />
                      </span>
                    </li>
                  ))
                ) : (
                  <li>No categories available</li>
                )}
              </div>
            </div>
          </ul>
        )}
      </div>
      <EditPopup
        show={isPopupOpen}
        category={selectedCategory}
        onClose={() => setIsPopupOpen(false)}
        fetchCategories={fetchCategories}
      />
      <ToastContainer />
    </div>
  );
};

export default AddCategory;
