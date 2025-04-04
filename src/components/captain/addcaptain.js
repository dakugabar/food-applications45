"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck } from "react-icons/fi";
import "./addcaptain.css";

const AddCaptain = () => {
  const [captainName, setCaptainName] = useState("");
  const [captains, setCaptains] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Fetch all captains
  const fetchCaptains = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get("/api/captains");
      setCaptains(response.data);
    } catch (error) {
      console.error("Error fetching captains:", error);
      setError("Failed to load captains");
    }
    setIsFetching(false);
  };

  useEffect(() => { fetchCaptains(); }, []);

  // Reset form
  const resetForm = () => {
    setCaptainName("");
    setPin(["", "", "", ""]);
    setEditId(null);
    setError("");
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!captainName.trim()) {
      setError("Please enter a captain name");
      return;
    }
    
    if (pin.some(digit => digit === "" || isNaN(digit))) {
      setError("Please enter a valid 4-digit PIN");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const captainData = { name: captainName, pin: pin.join("") };
      
      if (editId) {
        await axios.put("/api/captains", { id: editId, ...captainData });
        setSuccess("Captain updated successfully");
      } else {
        await axios.post("/api/captains", captainData);
        setSuccess("Captain added successfully");
      }

      resetForm();
      fetchCaptains();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save captain");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit captain
  const handleEdit = (captain) => {
    setCaptainName(captain.name);
    setPin(captain.pin.split(""));
    setEditId(captain._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete captain
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this captain?")) return;
    
    setIsLoading(true);
    try {
      await axios.delete(`/api/captains?id=${id}`);
      setSuccess("Captain deleted successfully");
      fetchCaptains();
      if (editId === id) resetForm();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to delete captain");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="captain-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        {/* Form Section */}
        <motion.div 
          className="form-card"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="form-header">
            <h2>{editId ? "Update Captain" : "Add New Captain"}</h2>
            {editId && (
              <button onClick={resetForm} className="icon-btn">
                <FiX size={20} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                className="alert error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                className="alert success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="form-group">
            <label>Captain Name</label>
            <input
              type="text"
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              placeholder="Enter captain name"
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label>4-Digit PIN</label>
            <div className="pin-container">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d$/.test(val)) {
                      const newPin = [...pin];
                      newPin[index] = val;
                      setPin(newPin);
                      if (val && index < 3) document.getElementById(`pin-${index+1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digit && index > 0) {
                      document.getElementById(`pin-${index-1}`)?.focus();
                    }
                  }}
                  id={`pin-${index}`}
                  className="pin-input"
                />
              ))}
            </div>
          </div>

          <motion.button 
            onClick={handleSubmit} 
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`submit-btn ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : editId ? (
              <>
                <FiCheck size={18} /> Update Captain
              </>
            ) : (
              <>
                <FiPlus size={18} /> Add Captain
              </>
            )}
          </motion.button>
        </motion.div>

        {/* List Section */}
        <motion.div 
          className="list-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="list-header">
            <h3>Captain List</h3>
            <div className="total-badge">{captains.length} Captains</div>
          </div>

          {isFetching ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading captains...</p>
            </div>
          ) : captains.length === 0 ? (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <img src="/empty-state.svg" alt="No captains" />
              <p>No captains found. Add one to get started!</p>
            </motion.div>
          ) : (
            <motion.ul 
              className="captain-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {captains.map((captain) => (
                  <motion.li 
                    key={captain._id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    layout
                  >
                    <div className="captain-info">
                      <div className="avatar">
                        {captain.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="details">
                        <h4>{captain.name}</h4>
                        <p>PIN: {captain.pin}</p>
                      </div>
                    </div>
                    <div className="actions">
                      <motion.button 
                        onClick={() => handleEdit(captain)}
                        disabled={isLoading}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="edit-btn"
                      >
                        <FiEdit2 />
                      </motion.button>
                      <motion.button 
                        onClick={() => handleDelete(captain._id)}
                        disabled={isLoading}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="delete-btn"
                      >
                        <FiTrash2 />
                      </motion.button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AddCaptain;