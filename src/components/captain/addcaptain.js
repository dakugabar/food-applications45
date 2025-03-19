"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import "./addcaptain.css";

const AddCaptain = () => {
  const [captainName, setCaptainName] = useState("");
  const [captains, setCaptains] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true); // New state for fetching loading

  // Fetch Captains
  const fetchCaptains = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get("/api/captains");
      setCaptains(response.data);
    } catch (error) {
      console.error("Error fetching captains:", error);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    fetchCaptains();
  }, []);

  // Add or Update Captain
  const handleAddCaptain = async () => {
    if (!captainName.trim()) return;
    setIsLoading(true);

    try {
      if (editId) {
        await axios.put(`/api/captains/${editId}`, { name: captainName });
      } else {
        await axios.post("/api/captains", { name: captainName });
      }

      setCaptainName("");
      setEditId(null);
      fetchCaptains(); // Refresh list
    } catch (error) {
      console.error("Error adding/updating captain:", error);
    }
    
    setIsLoading(false);
  };

  // Edit Captain
  const handleEdit = (id, name) => {
    setCaptainName(name);
    setEditId(id);
  };

  // Delete Captain
  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/captains/${id}`);
      fetchCaptains(); // Refresh list
    } catch (error) {
      console.error("Error deleting captain:", error);
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="captain-container">
        <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="title">
          Add Captain
        </motion.h2>

        <label className="input-label">Captain Name:</label>
        <motion.input
          type="text"
          value={captainName}
          onChange={(e) => setCaptainName(e.target.value)}
          className="input-box"
          placeholder="Enter Captain Name"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        />

        <motion.button
          onClick={handleAddCaptain}
          className={`add-button ${isLoading ? "loading" : ""}`}
          disabled={isLoading}
          whileHover={!isLoading ? { scale: 1.05 } : {}}
          whileTap={!isLoading ? { scale: 0.95 } : {}}
        >
          {isLoading ? "Loading..." : editId ? "Update Captain" : "Add Captain"}
        </motion.button>
      </div>

      {isFetching ? (
        <p className="loading-indicator">Fetching Captains...</p>
      ) : (
        captains.length > 0 && (
          <div className="table-container">
            <ul className="captain-list">
              {captains.map((captain, index) => (
                <motion.li key={captain._id} className="captain-item" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                  <span>{captain.name}</span>
                  <div className="button-group2">
                    <button className="edit-btn2" onClick={() => handleEdit(captain._id, captain.name)}>Update</button>
                    <button className="delete-btn2" onClick={() => handleDelete(captain._id)}>Delete</button>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        )
      )}
    </>
  );
};

export default AddCaptain;
