import React, { useState, useEffect } from "react";
import axios from "axios";
import "./captain.css";

const Captain = () => {
  const [selectedCaptain, setSelectedCaptain] = useState("");
  const [captains, setCaptains] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [editId, setEditId] = useState(null);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [vectoryCaptains, setVectoryCaptains] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaptains();
    fetchTables();
    fetchVectory();
  }, []);

  const fetchVectory = async () => {
    try {
      const response = await axios.get("/api/vectory");
      setVectoryCaptains(response.data.data);
    } catch (error) {
      console.error("Error fetching vectory captains:", error);
    }
  };

  const fetchCaptains = async () => {
    try {
      const response = await axios.get("/api/captain2");
      setCaptains(response.data.data);
    } catch (error) {
      console.error("Error fetching captains:", error);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await axios.get("/api/tablesview");
      setTables(response.data.tables.map((table) => ({
        name: table.tableName,
      })));
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAssignedTables = () => {
    let assignedTables = new Set();
    vectoryCaptains.forEach((captain) => {
      if (captain._id !== editId) {
        captain.tables.forEach((table) => assignedTables.add(table));
      }
    });
    return assignedTables;
  };

  const handleTableSelect = (tableName) => {
    setSelectedTables((prev) => {
      if (prev.includes(tableName)) {
        return prev.filter((t) => t !== tableName);
      } else {
        return [...prev, tableName];
      }
    });
  };

  const handleSaveCaptain = async () => {
    if (!selectedCaptain || pin.some((p) => p === "")) return;

    const newCaptain = {
      name: selectedCaptain,
      pin: pin.join(""),
      tables: selectedTables,
    };

    try {
      if (editId) {
        await axios.put("/api/vectory", { id: editId, ...newCaptain });
      } else {
        await axios.post("/api/vectory", newCaptain);
      }
      fetchVectory();
      resetForm();
    } catch (error) {
      console.error("Error saving captain:", error);
    }
  };

  const handleEdit = (id) => {
    const captain = vectoryCaptains.find((c) => c._id === id);
    if (!captain) return;

    setSelectedCaptain(captain.name);
    setPin(captain.pin.split(""));
    setSelectedTables(captain.tables || []);
    setEditId(id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this captain?")) return;
    try {
      await axios.delete("/api/vectory", { data: { id } });
      fetchVectory();
    } catch (error) {
      console.error("Error deleting captain:", error);
    }
  };

  const resetForm = () => {
    setSelectedCaptain("");
    setPin(["", "", "", ""]);
    setSelectedTables([]);
    setEditId(null);
  };

  const assignedTables = getAssignedTables();
  const availableCaptains = captains.map((captain) => ({
    ...captain,
    assigned: vectoryCaptains.some((c) => c.name === captain.name),
  }));

  return (
    <div className="captain-container">
      <h2>Assign Captain</h2>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <>
         <select onChange={(e) => setSelectedCaptain(e.target.value)} value={selectedCaptain}>
            <option value="">Select Captain</option>
            {availableCaptains.map((captain, index) => (
              <option key={index} value={captain.name} disabled={captain.assigned}>
                {captain.name} {captain.assigned ? "(Assigned)" : ""}
              </option>
            ))}
          </select>

          <div className="pin-container">
            <label>Create PIN:</label>
            <div className="pin-inputs">
              {pin.map((value, index) => (
                <input
                  key={index}
                  id={`pin-${index}`}
                  type="text"
                  maxLength="1"
                  value={value}
                  onChange={(e) => {
                    if (/^[0-9]?$/.test(e.target.value)) {
                      const newPin = [...pin];
                      newPin[index] = e.target.value;
                      setPin(newPin);
                      if (e.target.value && index < 3) document.getElementById(`pin-${index + 1}`).focus();
                    }
                  }}
                />
              ))}
            </div>
          </div>

          <div className="table-selection">
            <h3>Select Tables:</h3>
            <div className="tables">
              {tables.map((table, index) => {
                const isSelected = selectedTables.includes(table.name);
                const isAssigned = assignedTables.has(table.name);

                return (
                  <div
                    key={index}
                    className={`table ${isSelected ? "selected" : ""} ${isAssigned ? "disabled" : ""}`}
                    onClick={() => !isAssigned && handleTableSelect(table.name)}
                  >
                    {table.name}
                  </div>
                );
              })}
            </div>
          </div>

          <button className="create-button" onClick={handleSaveCaptain}>
            {editId ? "Update Captain" : "Create Captain"}
          </button>

          <div className="captain-list">
            <h3>Assigned Captains</h3>
            {vectoryCaptains.length === 0 ? (
              <p className="no-data">No captains assigned.</p>
            ) : (
              vectoryCaptains.map((captain) => (
                <div key={captain._id} className="captain-item">
                  <span>
                    {captain.name} (PIN: {captain.pin}) - Tables: {captain.tables.join(", ")}
                  </span>
                  <button onClick={() => handleEdit(captain._id)}>Update</button>
                  <button onClick={() => handleDelete(captain._id)}>Delete</button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Captain;
