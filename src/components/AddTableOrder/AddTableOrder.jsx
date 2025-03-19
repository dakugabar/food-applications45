import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "./AddTableOrder.css";
import { toast, ToastContainer } from "react-toastify"; // Importing toast and ToastContainer
import "react-toastify/dist/ReactToastify.css";

const AddTableOrder = ({ selectedTable, totalSeats, onClose, onPlaceOrder }) => {
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [category, setCategory] = useState("");
  const [categoryItem, setCategoryItem] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [customerNameError, setCustomerNameError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch items for a selected category
  useEffect(() => {
    const fetchItems = async () => {
      if (!category) return;

      try {
        const response = await fetch(`/api/itemtable?category=${category}`);
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [category]);

  // Add item to order
  const handleAddItem = () => {
    if (!categoryItem) return;

    const selectedItem = items.find((item) => item.name === categoryItem);
    if (!selectedItem) return;

    const existingItemIndex = orderItems.findIndex((item) => item.name === selectedItem.name);

    if (existingItemIndex !== -1) {
      setOrderItems((prevItems) =>
        prevItems.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price,
              }
            : item
        )
      );
    } else {
      const newItem = {
        name: selectedItem.name,
        price: selectedItem.price,
        quantity: 1,
        total: selectedItem.price,
        itemId: selectedItem._id,
        discount:selectedItem.discount,
        gstRate:selectedItem.gstRate,
      };
      setOrderItems((prevItems) => [...prevItems, newItem]);
    }

    setCategoryItem("");
  };
  const handleRemark = () => {
    // Show the popup or handle the remark functionality
    setShowPopup(true);
  };
 
  // Handle quantity change
  const handleQuantityChange = (index, delta) => {
    setOrderItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: item.quantity + delta,
              total: (item.quantity + delta) * item.price,
            }
          : item
      ).filter((item) => item.quantity > 0)
    );
  };

  // Delete item from order
  const handleDeleteItem = (index) => {
    setOrderItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    return orderItems.reduce((total, item) => total + item.total, 0);
  };

  // Place order and save to database
  const handlePlaceOrder = async () => {
    if (!customerName) {
      setCustomerNameError(true);
      return;
    }
  
    const orderData = {
      customerName,
      mobileNumber,
      seatNumber,
      tableNumber: selectedTable,
      maxPax: totalSeats,
      orderItems,
      totalPrice: calculateTotalPrice(),
    };
  
    try {
      setLoading(true);
      const response = await fetch("/api/savetable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Update table status to "occupied"
        const updateResponse = await fetch("/api/updatestatus1", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tableName: selectedTable,
            status: "occupied",
          }),
        });
  
        const updateData = await updateResponse.json();
  
        if (updateResponse.ok) {
          toast.success("Order added and table status updated successfully!", {
            autoClose: 3000,
          });
   printBill();
          // Reset form and close popup
          onClose();
          onPlaceOrder(data);
          setCustomerName("");
          setMobileNumber("");
          setSeatNumber("");
          setOrderItems([]);
         
        } else {
          toast.error(updateData.error || "Failed to update table status", {
            autoClose: 3000,
          });
        }
      } else {
        toast.error(data.message || "Failed to place the order", {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("An error occurred while placing the order", {
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const printBill = () => {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const year = currentDate.getFullYear();
    let hours = currentDate.getHours();
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  
    // Determine AM or PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    // Convert 24-hour format to 12-hour format
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12'; // The hour '0' should be '12'
  
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes} ${ampm}`;

    const billContent = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; padding: 0; line-height: 1.4; max-width: 300px; margin: 0 auto; margin-left:-6px; margin-right:10px;">
      <h2 style="text-align: center; margin-bottom: 2px;">Tomato Restaurant</h2>
     
  
    
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #333; font-weight: bold;">
         <div>
      Kitchen Slip
    </div>
        <div>Table: ${selectedTable}</div>
     


      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px;">
    <div>Date: ${formattedDate}</div>
        <div>Time: ${formattedTime}</div>
    </div>
    
  
      <div style="border-bottom: 1px dotted #000; margin-bottom: 10px;"></div>
  
      <div style="font-weight: bold; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; text-align: center;">
          <span style="flex: 1; text-align: left;">Item Name</span>
          <span style="flex: 1;text-align:right;">Qty</span>
        </div>
      </div>
  
      <div style="border-bottom: 1px dotted #000; margin-bottom: 10px;"></div>
  
      ${orderItems
        .map(
          (item) => `
            <div style="display: flex; justify-content: space-between; text-align: center; font-size: 12px;">
              <span style="flex: 3; text-align: left;">${item.name}</span>
              <span style="flex: 1; text-align: right;">${item.quantity}</span>
            </div>`
        )
        .join('')}
          <div style="flex: 1; border-top: 1px dotted #000;margin-top: 7px;"></div>
 <div style="margin-bottom: 4px; margin-top: 8px;line-height: 1.6;">
 
 Note:   ${description || "No remarks entered."}
 </div>

    <div style="flex: 1; border-top: 1px dotted #000;"></div>
      <div style="display: flex; align-items: center; font-weight: bold; font-size: 14px; margin-top: 10px; margin-bottom: 20px;">
        <div style="flex: 1; border-top: 1px dotted #000;"></div>
        <div style="padding: 0 10px; text-align: center;">
        Items Prepared Quickly
        </div>
        <div style="flex: 1; border-top: 1px dotted #000;"></div>
      </div>


    </div>
  `;
  
  // Open a new window for printing
  const printWindow = window.open( 'width=350,height=600');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bill</title>
      </head>
      <body>
        ${billContent}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
  };  
  const handleRemarkClose = () => {
    // Close the remark popup and reset the description
    setShowPopup(false);
   
  };

  
  const handleSave = () => {
    // Save the remark and close the popup
    console.log("Remark Saved:", description);
    setShowPopup(false); // Close the popup after saving
  };
  
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="top-row">
          <h2>Table No: {selectedTable}</h2>
          <h2>Max Pax: {totalSeats}</h2>
        </div>

        <div className="input-row">
          <input
            type="text"
            placeholder="Customer Name *"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className={customerNameError ? "error" : ""}
            required
          />
          <input
            type="text"
            placeholder="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />
          <input
            type="number"
            placeholder="Pax"
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
          />
        </div>

        <div className="input-row">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={categoryItem}
            onChange={(e) => setCategoryItem(e.target.value)}
            disabled={!category}
          >
            <option value="">Select Item</option>
            {items.map((item) => (
              <option key={item._id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <button onClick={handleAddItem}>Add</button>
        </div>

        <div className="order-items-container">
          <table>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>
                    <div className="order-incress">
                      <div className="quantity-order">
                        <button onClick={() => handleQuantityChange(index, -1)}>-</button>
                        {item.quantity}
                        <button onClick={() => handleQuantityChange(index, 1)}>+</button>
                      </div>
                    </div>
                  </td>
                  <td>{item.price}</td>
                  <td>{item.total}</td>
                  <td>
                    <button onClick={() => handleDeleteItem(index)} className="delete-button">
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bottom-row">
          <button onClick={onClose}>Close</button>
          <button onClick={handleRemark}>Remark</button>
          <button onClick={handlePlaceOrder} disabled={loading}>
            {loading ? "Placing Order..." : `Place Order (₹${calculateTotalPrice()})`}
          </button>
        </div>
        {showPopup && (
        <div className="popup-remake">
          <div className="popup-content-remake">
            <div className="popup-header-remake">
              <h3>Remark</h3>
            </div>
            <div className="popup-body-remake">
              <label htmlFor="description">Note:</label>
              <textarea
  id="description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Enter your remark here"
  rows={5}  // This will make the textarea 5 rows high
  style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
/>
            </div>
            <div className="popup-footer-remake">
           
            <button onClick={handleRemarkClose}>Close</button>
              <button onClick={handleSave}>Save</button>
                
              
            </div>
          </div>
        </div>
      )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default AddTableOrder;
