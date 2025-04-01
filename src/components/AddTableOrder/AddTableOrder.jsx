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
  useEffect(() => {
    // Load QZ Tray script dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qz-tray@2.1.1';
    script.async = true;
    document.body.appendChild(script);
  
    return () => {
      // Cleanup
      document.body.removeChild(script);
    };
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
  const printBill = async () => {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    let hours = currentDate.getHours();
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';
    
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = `${hours}:${minutes} ${ampm}`;
  
    try {
      // Check if QZ Tray is loaded
      if (typeof qz === 'undefined') {
        throw new Error("QZ Tray is not loaded. Make sure QZ Tray is installed and running.");
      }

      // Connect to QZ Tray
      qz.api.setPromiseType(resolver => new Promise(resolver));
      await qz.websocket.connect();

      // Find printers
      const printers = await qz.printers.find();
      if (!printers || printers.length === 0) {
        throw new Error("No printers found");
      }

      // Select the first printer
      const printer = printers[0];
      
      // Create configuration for thermal printer (80mm width)
      const config = qz.configs.create(printer, {
        scaleContent: true,
        size: { 
          width: 576,  // 80mm in dots (1mm = 8 dots for 203 DPI)
          height: null // Auto-height
        },
        margins: {
          top: 0,
          left: 0
        },
        rasterize: false
      });

      // Create ESC/POS receipt content
      const receiptContent = [
        '\x1B\x40',         // Initialize printer
        '\x1B\x61\x01',     // Center alignment
        '\x1B\x21\x30',     // Double height + bold
        'Tomato Restaurant\n',
        '\x1B\x21\x00',     // Normal text
        'Kitchen Slip\n\n',
        
        // Table and Customer
        '\x1B\x61\x00',     // Left alignment
        `Table: ${selectedTable}`,
        '\x1B\x61\x02',     // Right alignment
        `Customer: ${customerName || 'Walk-in'}\n`,
        
        // Date and Time
        '\x1B\x61\x00',     // Left alignment
        `Date: ${formattedDate}  Time: ${formattedTime}\n\n`,
        
        // Divider line
        '\x1B\x61\x01',     // Center alignment
        '--------------------------------\n',
        
        // Items header
        '\x1B\x61\x00',     // Left alignment
        'Item Name',
        '\x1B\x61\x02',     // Right alignment
        'Qty\n',
        '\x1B\x61\x01',     // Center alignment
        '--------------------------------\n',
        
        // Order items
        ...orderItems.flatMap(item => {
          const nameLine = '\x1B\x61\x00' + item.name;
          const qtyLine = '\x1B\x61\x02' + item.quantity;
          return `${nameLine}${qtyLine}\n`;
        }),
        
        // Divider line
        '\x1B\x61\x01',     // Center alignment
        '--------------------------------\n\n',
        
        // Remark
        '\x1B\x61\x00',     // Left alignment
        `Note: ${description || "No remarks entered."}\n\n`,
        
        // Footer
        '\x1B\x61\x01',     // Center alignment
        'Items Prepared Quickly\n',
        '--------------------------------\n',
        
        // Add some line feeds before cutting
        '\n\n\n\n',
        '\x1B\x69'         // Partial cut
      ].join('');

      // Print data for thermal printer
      const data = [{
        type: 'raw',
        format: 'plain',
        data: receiptContent
      }];

      // Print and wait for completion
      await qz.print(config, data);
      
      toast.success(`Bill printed successfully to ${printer}!`, { autoClose: 3000 });
      return true;
      
    } catch (error) {
      console.error("Printing error:", error);
      toast.error(`Printing failed: ${error.message}`, { autoClose: 5000 });
      return false;
    } finally {
      setTimeout(() => {
        if (qz.websocket.isActive()) {
          qz.websocket.disconnect();
        }
      }, 3000);
    }
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
