import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './settable.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from '@fortawesome/free-solid-svg-icons';


const TableList = () => {
  const [tables, setTables] = useState([]);
  const [editTable, setEditTable] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get('/api/settable');
        setTables(response.data);
      } catch (error) {
        console.error('Failed to fetch tables:', error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchTables();
  }, []);

  const handleActivateDeactivate = async (tableId, status) => {
    try {
      await axios.patch(`/api/settable?id=${tableId}`, { tablestatus: status });
      setTables(tables.map(table => (table._id === tableId ? { ...table, tablestatus: status } : table)));
      toast.success(`Table is now ${status}`);
    } catch (error) {
      toast.error('Failed to update table status');
      console.error('Failed to update table status:', error);
    }
  };

  const handleEdit = (tableId) => {
    const table = tables.find(table => table._id === tableId);
    setEditTable(table);
  };

  const handleDelete = async (tableId) => {
    try {
      await axios.delete(`/api/settable?id=${tableId}`);
      setTables(tables.filter(table => table._id !== tableId));
      toast.success('Table deleted');
    } catch (error) {
      toast.error('Failed to delete table');
      console.error('Failed to delete table:', error);
    }
  };

  const handleUpdate = async (updatedTable) => {
    setLoading(true); // Set loading to true when update process starts
    try {
      const response = await axios.put(`/api/settable?id=${updatedTable._id}`, updatedTable);
      setTables(tables.map(table => (table._id === updatedTable._id ? response.data : table)));
      setEditTable(null);
      toast.success('Table updated');
    } catch (error) {
      toast.error('Failed to update table');
      console.error('Failed to update table:', error);
    } finally {
      setLoading(false); // Set loading to false once update process ends
    }
  };

  return (
    <div className="settable-container">
      <h2 className='top-second-title'>Manage Tables</h2>
      {loading ? (
        <div className="loading-container">
          <div className="loading"></div>
          <p className='loading'> Loading tables...</p>
        </div>
      ) : (
        <>
          <div className="settable-header">
            <span>Table Name</span>
            <span>Total Seats</span>
            <span>Status</span>
            <span>Table Status</span>
            <span>Action</span>
            <span>Update</span>
            <span>Delete</span>
          </div>
          <div className="settable-list">
            {tables.map((table, index) => (
              <div key={table._id} className={`settable-row ${index % 2 === 0 ? 'even' : 'odd'}`}>
                <span>{table.tableName}</span>
                <span>{table.seatNumber} Seats</span>
                <span>{table.status.charAt(0).toUpperCase() + table.status.slice(1).toLowerCase()}</span>
                <span>{table.tablestatus.charAt(0).toUpperCase() + table.tablestatus.slice(1).toLowerCase()}</span>
                <span>
                  <Switch
                    checked={table.tablestatus === 'active'}
                    onChange={() =>
                      handleActivateDeactivate(table._id, table.tablestatus === 'active' ? 'inactive' : 'active')
                    }
                  />
                </span>
                <span className="settable-actions">
                  <button onClick={() => handleEdit(table._id)} className="btn-edit">Edit</button>
                </span>
                <span className="settable-actions">
                <img 
  src="/bin.png" 
  alt="Delete" 
  className="delete-image" 
  onClick={() => handleDelete(table._id)}
/>

                  
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {editTable && (
        <div className="settable-popup">
          <div className="settable-popup-content">
            <div className='title-top'>
              <h3>Edit Table</h3>
              <button onClick={() => setEditTable(null)} className="btn-cancel">
                <FontAwesomeIcon icon={faTimes} /> {/* Assuming faTimes is your cross icon from FontAwesome */}
              </button>
            </div>
            <div className="form-group1">
              <label htmlFor="tableName" className="label">Table Name</label>
              <input
                type="text"
                value={editTable.tableName}
                onChange={(e) => setEditTable({ ...editTable, tableName: e.target.value })}
                placeholder="Table Name"
              />
            </div>
            <div className="form-group1">
              <label htmlFor="seatNumber" className="label">Total Seat</label>
              <input
                type="number"
                value={editTable.seatNumber}
                onChange={(e) => setEditTable({ ...editTable, seatNumber: e.target.value })}
                placeholder="Total Seats"
              />
            </div>
            <div className="popup-actions">
              <button onClick={() => handleUpdate(editTable)} className="btn-update" disabled={loading}>
                {loading ? "Update..." : "Update Table"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

const Switch = ({ checked, onChange }) => (
  <label className="settable-switch">
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="settable-slider"></span>
  </label>
);

export default TableList;
