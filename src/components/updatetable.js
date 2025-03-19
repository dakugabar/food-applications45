import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../components/AddTableOrder/AddTableOrder.css";

const UpdatePopup = ({ table, onClose, onUpdate }) => {
  const [orderItems, setOrderItems] = useState(table.orderItems || []);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("");
  const [categoryItem, setCategoryItem] = useState("");
  const [customerName, setCustomerName] = useState(table.customerName || "");
  const [mobileNumber, setMobileNumber] = useState(table.mobileNumber || "");
  const [seatNumber, setSeatNumber] = useState(table.seatNumber || "");
  const [loading, setLoading] = useState(false);
 const [description, setDescription] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [previousOrderItems, setPreviousOrderItems] = useState(orderItems);
  
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

  // Fetch items based on category
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

  // Add item to the order
  const handleAddItem = () => {
    if (!categoryItem) return;

    const selectedItem = items.find((item) => item.name === categoryItem);
    if (!selectedItem) return;

    const newItem = {
      itemId: selectedItem._id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity: 1,
      total: selectedItem.price,
      itemstatus: "Pending", 
      discount: selectedItem.discount,
      gstRate:selectedItem.gstRate,
      
    };

    setOrderItems((prevItems) => {
      const pendingItems = prevItems.filter((item) => item.name === categoryItem && item.itemstatus === "Pending");
      if (pendingItems.length > 0) {
        return prevItems.map((item) =>
          item.name === categoryItem && item.itemstatus === "Pending"
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prevItems, newItem];
    });

    setCategoryItem(""); // Reset category item
  };

  // Change item quantity (only for "Pending" status)
  const handleQuantityChange = (index, delta) => {
    setOrderItems((prevItems) =>
      prevItems.map((item, i) => {
        if (i === index && item.itemstatus === "Pending") {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity, total: newQuantity * item.price };
        }
        return item;
      })
    );
  };

  // Delete item from the order
  const handleDeleteItem = (index) => {
    setOrderItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  // Calculate total order price
  const calculateTotalPrice = () => {
    return orderItems.reduce((total, item) => total + item.total, 0);
  };

  // Handle status change
  const handleStatusChange = async (index, newStatus) => {
    // Update the status in the local state
    const updatedItems = [...orderItems];
    updatedItems[index].itemstatus = newStatus;
    setOrderItems(updatedItems);
  
    // Make an API call to update the status in the database
    try {
      const response = await fetch("/api/updateitems", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId: table._id, // Table ID
          itemId: orderItems[index]._id, // Item ID
          newStatus,
          
          
           // New status selected by the user
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        // Show success toast notification
        toast.success("Status updated successfully!", { position: "top-right", autoClose: 3000 });
      } else {
        toast.error(result.message || "Failed to update status.", { position: "top-right", autoClose: 3000 });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status.", { position: "top-right", autoClose: 3000 });
    }
  };
  

  // Handle update order and send to the backend
  const handleUpdateOrder = async () => {
    const updatedOrderData = {
      customerName,
      mobileNumber,
      seatNumber,
      orderItems,
      totalPrice: calculateTotalPrice(),
    };
  
    if (!table._id) {
      console.error("Table ID is missing");
      return;
    }
  
    try {
      setLoading(true);
      const response = await fetch("/api/updatetable", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId: table._id,
          updatedOrderData,
        }),
      });
  
      const result = await response.json();
      setLoading(false);
  
      if (response.ok) {
        toast.success("Order updated successfully!", { autoClose: 3000 });
        const isNewItemAdded = orderItems.length > previousOrderItems.length;

        if (isNewItemAdded) {
          // Print the bill only when new items are added
          printBill();
        }
  
        // After success, update the previous order items to the current state
        setPreviousOrderItems(orderItems);
        onUpdate(result.table);
        
        onClose(); 
        
      } else {
        console.error(result.message || "Failed to update the order");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error updating order:", error);
    }
  };
 
  const printBill = () => {
    const newOrderItems = orderItems.filter(item => 
      !previousOrderItems.some(prevItem => prevItem.name === item.name)
    ); // Filter to get only the new items
  
    if (newOrderItems.length === 0) {
      console.log("No new items to print.");
      return; // If no new items, don't print
    }
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
        <div>Table: ${table.tableNumber}</div>
     


      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px;">
    <div>Date: ${formattedDate}</div>
        <div>Time: ${formattedTime}</div>
    </div>
    
  
      <div style="border-bottom: 1px dotted #000; margin-bottom: 10px;"></div>
  
      <div style="font-weight: bold; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; text-align: center;">
          <span style="flex: 3; text-align: left;">Item Name</span>
          <span style="flex: 1;text-align:right;">Qty</span>
        </div>
      </div>
  
      <div style="border-bottom: 1px dotted #000; margin-bottom: 10px;"></div>
  
      
       ${newOrderItems.map(item => `
        <div style="display: flex; justify-content: space-between; text-align: center;">
          <span style="flex: 1; text-align: left;">${item.name}</span>
          <span style="flex: 1;text-align:right;">${item.quantity}</span>
        </div>
      `).join('')}
          <div style="flex: 1; border-top: 1px dotted #000;margin-top: 7px;"></div>
 <div style="margin-bottom: 4px; margin-top: 8px;line-height: 1.6;">
 
 Note:  <div style="font-size:8px"> ${description || "No remarks entered."}</div>
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
  const handleRemark = () => {
    // Show the popup or handle the remark functionality
    setShowPopup(true);
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
          <h2>Table No: {table.tableNumber}</h2>
          <h2>Max Pax: {table.maxPax}</h2>
        </div>
        <div className="input-row">
          <input type="text" placeholder="Customer Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <input type="text" placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
          <input type="number" placeholder="Pax" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} />
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
          <select value={categoryItem} onChange={(e) => setCategoryItem(e.target.value)} disabled={!category}>
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
                <th>Status</th>
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
                    <button onClick={() => handleQuantityChange(index, -1)} disabled={item.itemstatus !== "Pending"}>
                      -
                    </button>
                    {item.quantity}
                    <button onClick={() => handleQuantityChange(index, 1)} disabled={item.itemstatus !== "Pending"}>
                      +
                    </button>
                    </div>
                    </div>
                  </td>
                  <td>
                    <select  className="status-dropdown1" value={item.itemstatus} onChange={(e) => handleStatusChange(index, e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Served">Served</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{item.price}</td>
                  <td>{item.total}</td>
                  <td>
                    <button  className="delete-button" onClick={() => handleDeleteItem(index)} disabled={item.itemstatus !== "Pending"}>
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
          <button onClick={handleUpdateOrder}>{loading ? "Updating..." : `Update Order (₹${calculateTotalPrice()})`}</button>
        </div>
        {showPopup && (
        <div className="popup-remake">
          <div className="popup-content-remake">
            <div className="popup-header-remake">
              <h3 className="remark">Remark</h3>
            </div>
            <div className="popup-body-remake">
              <label htmlFor="description">
                <div className="description1">
                Note:
                </div>
                </label>
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
    </div>
  );
};

export default UpdatePopup;
