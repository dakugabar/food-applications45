// viewtableorder
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import UpdatePopup from "../../components/updatetable"; // Ensure the path to UpdatePopup is correct
import "react-toastify/dist/ReactToastify.css"; // Import styles for react-toastify
import "./ViewTableOrder.css"; // Ensure your CSS file path is correct\\
import BillPopup from "../../components/ViewBill/ViewBillPopup";
import { FaCheckCircle } from "react-icons/fa";
const AddTableContent = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null); // For the update popup
  const [showPopup, setShowPopup] = useState(false); // Toggle the update popup visibility
  const [showBillPopup, setShowBillPopup] = useState(false);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch("/api/findtables");
        const data = await response.json();
        if (response.ok) {
        
          setTables(data);
         

        } else {
          setError(data.message || "Something went wrong");
        }
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);


  const handleStatusChange = async (tableId, tableName, newStatus) => {
    const previousStatus = tables.find((table) => table._id === tableId)?.status;
  
    try {
      // Optimistically update the UI
      setTables((prevTables) =>
        prevTables.map((table) =>
          table._id === tableId ? { ...table, status: newStatus } : table
        )
      );
  
      // API call to update the status in the database
      const response = await fetch("/api/orderstatus", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableName: tableName,
          status: newStatus,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update status in the database.");
      }
  
      const data = await response.json();
      console.log("Updated table data:", data);
  
      // Show success toast after a successful API call
      toast.success("Table status updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error updating table status:", error);
  
      // Revert the status back if the update fails
      setTables((prevTables) =>
        prevTables.map((table) =>
          table._id === tableId ? { ...table, status: previousStatus } : table
        )
      );
  
      // Show error toast
      toast.error("Failed to update table status. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  
  
  
  
  

  const formatDate = (date) => {
    const newDate = new Date(date);
    return `${newDate.toLocaleDateString()} ${newDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const handleUpdateClick = (table) => {
    setSelectedTable(table); // Set the table for updating
    setShowPopup(true); // Show the update popup
  };

  const handlePopupClose = () => {
    setShowPopup(false); // Close the popup
  };
  const handleViewBills = (table) => {
    setSelectedTable(table);
    setShowBillPopup(true);
  };

  const handleBillPopupClose = () => {
    setShowBillPopup(false);
  };

  const handleUpdate = (updatedTable) => {
    console.log("updatedTable",updatedTable);
    setTables((prevTables) =>
      prevTables.map((table) =>
        table._id === updatedTable._id ? { ...table, ...updatedTable } : table
      )
    );
    setShowPopup(false); // Close the popup
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="table-container1">
      <div className="table-header1">
        <div>S.No</div>
        <div>Customer Name</div>
        <div>Table Name</div>
        <div>Bill Date</div>
        <div>Bill Amount (₹)</div>
        <div>Status</div>
        <div>Update</div>
        <div>View Bills</div>
      </div>
      <div className="table-body1">
        {tables
          .slice()
          .reverse()
          .map((table, index) => (
         
            <div key={table._id} className="table-row1">
              <div>{tables.length - index}</div>
              <div>{table.customerName}</div>
              <div>{table.tableNumber}</div>
              <div>{formatDate(table.createdAt)}</div>
              <div>{table.totalPrice}</div>
              <div>
  {/* Check if the status is "Available" */}
  {table.status === "available" ? (
    // Display "Done" icon and disable dropdown
    
    <div className="status-done">
     <FaCheckCircle className="done-icon" /> Done
    </div>
    
  ) : (
    // Show the dropdown if status is not "Available"
    <select
      value={table.status} // Binds the current status to the dropdown
      onChange={(e) =>
        handleStatusChange(table._id, table.tableNumber, e.target.value)
      } // Calls the handler on change
      className="status-dropdown" // Adds a class for styling
    >
      <option value="occupied">Occupied</option>
      <option value="reserved">Reserved</option>
      <option value="available">Available</option>
    </select>
  )}
</div>

              <div>
               <button
  className="btn edit-btn"
  onClick={() => table.status !== "available" && handleUpdateClick(table)} // Only trigger if status is not 'available'
  disabled={table.status === "available"} // Disable the button if status is 'available'
>
  Update
</button>

              </div>
              <div>
              <button className="btn view-btn" onClick={() => handleViewBills(table)}>
                View Bills
              </button>
              </div>
            </div>
          ))}
      </div>
 
      {/* Render the UpdatePopup when showPopup is true */}
      {showPopup && (
        <UpdatePopup
          table={selectedTable}
          onClose={handlePopupClose}
          onUpdate={handleUpdate} // Pass the update handler to the popup
        />
        
      )}
      
       {showBillPopup && (
        <BillPopup table={selectedTable} onClose={handleBillPopupClose} />
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default AddTableContent;
