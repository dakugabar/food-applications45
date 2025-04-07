import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiUser } from 'react-icons/fi';
import './captain.css';

const Captain = () => {
  // State management
  const [selectedCaptainId, setSelectedCaptainId] = useState('');
  const [captains, setCaptains] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [editId, setEditId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [captainsRes, tablesRes, assignmentsRes] = await Promise.all([
        axios.get('/api/captain2'),
        axios.get('/api/tablesview'),
        axios.get('/api/vectory')
      ]);

      // Process captains data
      const captainsData = captainsRes.data?.data?.data || [];
      setCaptains(captainsData.map(c => ({
        _id: c._id,
        name: c.name
      })));

      // Process tables data
      setTables(
        Array.isArray(tablesRes.data?.tables) 
          ? tablesRes.data.tables.map(t => ({ name: t.tableName })) 
          : []
      );

      // Process assignments
      setAssignments(
        Array.isArray(assignmentsRes.data?.data)
          ? assignmentsRes.data.data.map(assignment => ({
              ...assignment,
              captainName: captainsData.find(c => c._id === assignment.captain)?.name || 'Unknown Captain'
            }))
          : []
      );

    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get currently assigned tables (excluding the one being edited)
  const getAssignedTables = () => {
    const assignedTables = new Set();
    assignments.forEach(assignment => {
      if (assignment._id !== editId && assignment.tables) {
        assignment.tables.forEach(table => assignedTables.add(table));
      }
    });
    return assignedTables;
  };

  // Check if captain is assigned
  const isCaptainAssigned = (captainId) => {
    return assignments.some(a => a.captain === captainId && a._id !== editId);
  };

  // Handle table selection
  const handleTableSelect = (tableName) => {
    setSelectedTables(prev =>
      prev.includes(tableName)
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  // Save assignment
  const handleSaveAssignment = async () => {
    if (!selectedCaptainId) {
      setError('Please select a captain');
      return;
    }

    if (selectedTables.length === 0) {
      setError('Please select at least one table');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const assignmentData = {
        captain: selectedCaptainId,
        tables: selectedTables
      };

      let response;
      if (editId) {
        response = await axios.put(`/api/vectory?id=${editId}`, assignmentData);
      } else {
        response = await axios.post('/api/vectory', assignmentData);
      }

      if (response.data?.success) {
        setSuccess(editId ? 'Assignment updated' : 'Assignment created');
        await fetchData();
        resetForm();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data?.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  // Edit assignment
  const handleEdit = (assignment) => {
    setSelectedCaptainId(assignment.captain);
    setSelectedTables(assignment.tables || []);
    setEditId(assignment._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete assignment
  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(`/api/vectory?id=${assignmentId}`);
      
      if (response.data?.success) {
        setSuccess('Assignment deleted');
        await fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data?.message || 'Deletion failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedCaptainId('');
    setSelectedTables([]);
    setEditId(null);
    setError('');
  };

  const assignedTables = getAssignedTables();

  return (
    <div className="captain-page">
      <div className="container">
        {/* Assignment Form */}
        <motion.div 
          className="form-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="form-header">
            <h2>{editId ? 'Edit Assignment' : 'Create New Assignment'}</h2>
            {editId && (
              <button 
                onClick={resetForm} 
                className="icon-btn"
                aria-label="Cancel edit"
              >
                <FiX size={20} />
              </button>
            )}
          </div>

          {/* Status messages */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div
                className={`alert ${error ? 'error' : 'success'}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="alert-content">
                  {error || success}
                  <button
                    onClick={() => (error ? setError('') : setSuccess(''))}
                    className="alert-close"
                    aria-label="Close message"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Captain selection */}
          <div className="form-group">
            <label>Select Captain</label>
            <div className="select-wrapper">
              <select
                value={selectedCaptainId}
                onChange={(e) => setSelectedCaptainId(e.target.value)}
                disabled={loading}
                className="styled-select"
              >
                <option value="">Select a captain</option>
                {captains.map((captain) => {
                  const isAssigned = isCaptainAssigned(captain._id);
                  return (
                    <option
                      key={captain._id}
                      value={captain._id}
                      disabled={isAssigned}
                      className={isAssigned ? 'assigned-option' : ''}
                    >
                      {captain.name}
                      {isAssigned && ' (Assigned)'}
                    </option>
                  );
                })}
              </select>
              <div className="select-arrow"></div>
            </div>
            {captains.length > 0 && assignments.length === captains.length && (
              <div className="info-message">
                All captains are currently assigned. Edit an existing assignment to make changes.
              </div>
            )}
          </div>

          {/* Table selection */}
          <div className="form-group">
            <label>Assign Tables</label>
            {tables.length === 0 ? (
              <motion.div
                className="no-tables-msg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No tables available
              </motion.div>
            ) : (
              <motion.div 
                className="tables-grid"
                layout
              >
                {tables.map((table) => {
                  const isSelected = selectedTables.includes(table.name);
                  const isAssigned = assignedTables.has(table.name);

                  return (
                    <motion.div
                      key={table.name}
                      className={`table-card ${isSelected ? 'selected' : ''} ${
                        isAssigned ? 'disabled' : ''
                      }`}
                      onClick={() => !isAssigned && handleTableSelect(table.name)}
                      whileHover={!isAssigned ? { scale: 1.05, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' } : {}}
                      whileTap={!isAssigned ? { scale: 0.98 } : {}}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {table.name}
                      {isSelected && (
                        <motion.span 
                          className="checkmark"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <FiCheck />
                        </motion.span>
                      )}
                      {isAssigned && (
                        <motion.span 
                          className="assigned-badge"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          Assigned
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Submit button */}
          <motion.button
            onClick={handleSaveAssignment}
            disabled={loading || !selectedCaptainId || selectedTables.length === 0}
            className="submit-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Processing...
              </span>
            ) : editId ? (
              <>
                <FiEdit2 size={18} /> Update Assignment
              </>
            ) : (
              <>
                <FiPlus size={18} /> Create Assignment
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Assignments List */}
        <motion.div 
          className="list-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="list-header">
            <h3>Current Assignments</h3>
            <div className="total-badge">
              {assignments.length} {assignments.length === 1 ? 'Assignment' : 'Assignments'}
            </div>
          </div>

          {assignments.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="empty-icon">
                <FiUser size={48} />
              </div>
              <p>No assignments found</p>
              <small>Create a new assignment to get started</small>
            </motion.div>
          ) : (
            <motion.ul 
              className="assignment-list"
              layout
            >
              <AnimatePresence>
                {assignments.map((assignment) => (
                  <motion.li
                    key={assignment._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="assignment-info">
                      <div className="avatar">
                        {assignment.captainName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="details">
                        <h4>{assignment.captainName}</h4>
                        <div className="tables">
                          {assignment.tables?.length > 0 ? (
                            assignment.tables.map((table) => (
                              <motion.span 
                                key={table} 
                                className="table-badge"
                                layout
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                {table}
                              </motion.span>
                            ))
                          ) : (
                            <span className="no-tables-badge">
                              No tables assigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="actions">
                      <motion.button
                        onClick={() => handleEdit(assignment)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="edit-btn"
                        disabled={loading}
                        aria-label="Edit assignment"
                      >
                        <FiEdit2 />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(assignment._id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="delete-btn"
                        disabled={loading}
                        aria-label="Delete assignment"
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
    </div>
  );
};

export default Captain;