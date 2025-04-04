import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck } from 'react-icons/fi';
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

  // Animation configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: 'beforeChildren'
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  // Data fetching with enhanced error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // First fetch captains data
        const captainsRes = await axios.get('/api/captain2');
        
        // Process captains data from API response
        const captainsData = captainsRes.data.data.data || []; // Adjusted for your API structure
        setCaptains(captainsData.map(captain => ({
          _id: captain._id,
          id: captain._id,
          name: captain.name
        })));

        // Then fetch other data
        const [tablesRes, assignmentsRes] = await Promise.all([
          axios.get('/api/tablesview'),
          axios.get('/api/vectory')
        ]);

        // Process tables data
        setTables(
          Array.isArray(tablesRes?.data?.tables) 
            ? tablesRes.data.tables.map(t => ({ name: t.tableName })) 
            : []
        );

        // Process assignments with captain names
        const processedAssignments = Array.isArray(assignmentsRes?.data?.data)
          ? assignmentsRes.data.data.map(assignment => {
              const captain = captainsData.find(c => c._id === assignment.captain);
              return {
                ...assignment,
                captainName: captain?.name || 'Unknown Captain',
                captainId: assignment.captain
              };
            })
          : [];
        setAssignments(processedAssignments);

      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load data. Please try again.');
        setCaptains([]);
        setTables([]);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get currently assigned tables
  const getAssignedTables = () => {
    const assignedTables = new Set();
    if (Array.isArray(assignments)) {
      assignments.forEach(assignment => {
        if (assignment._id !== editId && Array.isArray(assignment.tables)) {
          assignment.tables.forEach(table => assignedTables.add(table));
        }
      });
    }
    return assignedTables;
  };

  // Handle table selection
  const handleTableSelect = tableName => {
    if (!tableName) return;
    
    setSelectedTables(prev =>
      Array.isArray(prev)
        ? prev.includes(tableName)
          ? prev.filter(t => t !== tableName)
          : [...prev, tableName]
        : [tableName]
    );
  };

  // Save assignment to backend
  const handleSaveAssignment = async () => {
    if (!selectedCaptainId) {
      setError('Please select a captain');
      return;
    }

    if (!Array.isArray(selectedTables) || selectedTables.length === 0) {
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

      const response = editId
        ? await axios.put(`/api/vectory/${editId}`, assignmentData)
        : await axios.post('/api/vectory', assignmentData);

      if (response.data?.success) {
        setSuccess(
          editId
            ? 'Assignment updated successfully'
            : 'New assignment created successfully'
        );
        fetchData();
        resetForm();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data?.message || 'Operation failed');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to save assignment. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit existing assignment
  const handleEdit = assignment => {
    if (!assignment) return;

    setSelectedCaptainId(assignment.captainId || '');
    setSelectedTables(Array.isArray(assignment.tables) ? assignment.tables : []);
    setEditId(assignment._id || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete assignment
  const handleDelete = async assignmentId => {
    if (!assignmentId || !window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(`/api/vectory/${assignmentId}`);
      
      if (response.data?.success) {
        setSuccess('Assignment deleted successfully');
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data?.message || 'Deletion failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setSelectedCaptainId('');
    setSelectedTables([]);
    setEditId(null);
    setError('');
  };

  // Get available captains (not currently assigned)
  const availableCaptains = Array.isArray(captains) && Array.isArray(assignments)
    ? captains.filter(captain =>
        !assignments.some(a => a.captainId === captain._id && a._id !== editId)
      )
    : [];

  // Get currently assigned tables
  const assignedTables = getAssignedTables();

  return (
    <motion.div
      className="captain-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        {/* Assignment Form */}
        <motion.div
          className="form-card"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="form-header">
            <h2>{editId ? 'Edit Assignment' : 'Create New Assignment'}</h2>
            {editId && (
              <button onClick={resetForm} className="icon-btn">
                <FiX size={20} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {(error || success) && (
              <motion.div
                className={`alert ${error ? 'error' : 'success'}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="alert-content">
                  {error || success}
                  <button
                    onClick={() => (error ? setError('') : setSuccess(''))}
                    className="alert-close"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="form-group">
            <label>Select Captain</label>
            <select
              value={selectedCaptainId}
              onChange={e => setSelectedCaptainId(e.target.value)}
              className="select-field"
              disabled={loading}
            >
              <option value="">Select a captain</option>
              {loading ? (
                <option disabled>Loading captains...</option>
              ) : availableCaptains.length === 0 ? (
                <option disabled>No available captains</option>
              ) : (
                availableCaptains.map(captain => (
                  <option key={captain._id} value={captain._id}>
                    {captain.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Assign Tables</label>
            {loading ? (
              <div className="tables-loading">
                <div className="spinner small"></div>
                <p>Loading tables...</p>
              </div>
            ) : (
              <div className="tables-grid">
                {Array.isArray(tables) && tables.length > 0 ? (
                  tables.map(table => {
                    const isSelected = Array.isArray(selectedTables) 
                      ? selectedTables.includes(table.name)
                      : false;
                    const isAssigned = assignedTables.has(table.name);

                    return (
                      <motion.div
                        key={table.name}
                        className={`table-card ${isSelected ? 'selected' : ''} ${
                          isAssigned ? 'disabled' : ''
                        }`}
                        onClick={() => !isAssigned && handleTableSelect(table.name)}
                        whileHover={!isAssigned && { scale: 1.03 }}
                        whileTap={!isAssigned && { scale: 0.97 }}
                      >
                        {table.name}
                        {isSelected && <FiCheck className="checkmark" />}
                        {isAssigned && (
                          <span className="assigned-badge">Assigned</span>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="no-tables">No tables available</div>
                )}
              </div>
            )}
          </div>

          <motion.button
            onClick={handleSaveAssignment}
            disabled={
              loading ||
              !selectedCaptainId ||
              !Array.isArray(selectedTables) ||
              selectedTables.length === 0
            }
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="submit-btn"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="spinner tiny"></div>
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
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="list-header">
            <h3>Current Assignments</h3>
            <div className="total-badge">
              {loading ? '...' : assignments.length} Assignments
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading assignments...</p>
            </div>
          ) : !Array.isArray(assignments) || assignments.length === 0 ? (
            <motion.div
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <img
                src="/empty-state.svg"
                alt="No assignments"
                className="empty-img"
              />
              <p>No assignments found</p>
              <button onClick={fetchData} className="refresh-btn">
                Refresh Data
              </button>
            </motion.div>
          ) : (
            <motion.ul
              className="assignment-list"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {assignments.map(assignment => (
                  <motion.li
                    key={assignment._id}
                    variants={itemVariants}
                    layout
                  >
                    <div className="assignment-info">
                      <div className="avatar">
                        {assignment.captainName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="details">
                        <h4>{assignment.captainName}</h4>
                        <div className="tables">
                          {Array.isArray(assignment.tables) && assignment.tables.length > 0 ? (
                            assignment.tables.map(table => (
                              <span key={table} className="table-badge">
                                {table}
                              </span>
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
                      >
                        <FiEdit2 />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(assignment._id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="delete-btn"
                        disabled={loading}
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

export default Captain;