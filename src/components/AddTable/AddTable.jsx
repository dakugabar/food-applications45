import React, { useState } from "react";
import "./AddTable.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddTableContent = () => {
  const [tableName, setTableName] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tableName || !seatNumber) {
      toast.error("Both fields are required.", { position: "top-right" });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableName, seatNumber }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Table "${data.table.tableName}" added successfully!`, {
          position: "top-right",
        });
        setTableName("");
        setSeatNumber("");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to add the table.", {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error adding table:", error);
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-table-container">
      <ToastContainer /> {/* Toast container for displaying notifications */}
      <h3 className="form-title">Add Restaurant Table</h3>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="tableName" className="label">Table Name</label>
          <input
            type="text"
            id="tableName"
            className="input"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Enter Table Name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="seatNumber" className="label">Total Seat</label>
          <input
            type="number"
            id="seatNumber"
            className="input"
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
            placeholder="Enter Seat Number"
            required
          />
        </div>
        <div className="form-group1">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Adding..." : "Add Table"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTableContent;
