import { useState, useEffect } from 'react';
import './listitems2.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditPopup from '../editpopup/editpopup1';

export default function Home() {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/data');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleRemove = async (id) => {
    try {
      const response = await fetch(`/api/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setData((prevData) => prevData.filter(item => item._id !== id));
      toast.success("Food Removed");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const updateItemInState = (updatedItem) => {
    setData((prevData) =>
      prevData.map((item) =>
        item._id === updatedItem._id ? updatedItem : item
      )
    );
  };

  return (
    <div className='list add1 flex-col'>
      <ToastContainer />
      <div className='list-item-title'>
      <p>All Food List</p>
      </div>
      {loading ? (
        <p className='loading'>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className='list-table'>
          <div className='list-table-format1 title'>
            <b>Image</b>
            <b>Name</b>
            
            <b>Category</b>
            <b>Price</b>
            <b>Discount (%)</b>
            <b>GST (%)</b> {/* New GST column */}
            <b>Edit</b>
            <b>Action</b>
          </div>

          {data.map(item => (
            <div key={item._id} className='list-table-format1'>
              <span> <img src={item.imageUrl} alt={item.name} className='image' /></span>
             
              <h2 className='name'>{item.name}</h2>
              {/* <p className='category'>{item.vegOrNonVeg}</p> */}
              <p className='category'>{item.category}</p>
              <p className='price'>₹{item.price.toFixed(2)}</p>
              <p className='discount'>{item.discount ? `${item.discount}%` : 'N/A'}</p>
              <p className='discount'>{item.gstRate ? `${item.gstRate}%` : 'N/A'}</p> {/* Display GST */}
              <p className='action-edit'>
                <button
                  className='edit-button-list'
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
              </p>
              <p
                className='cursor'
                onClick={() => handleRemove(item._id)}
              >
                <img src='/bin.png' alt='Delete'  className='icon-delet' />
              </p>
            </div>
          ))}
        </div>
      )}

      {isPopupOpen && (
        <EditPopup
          item={selectedItem}
          onClose={closePopup}
          onUpdate={updateItemInState}
        />
      )}
    </div>
  );
}
