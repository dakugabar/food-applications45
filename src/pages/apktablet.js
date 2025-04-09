import React, { useState, useRef, useEffect } from "react";

const Apktablet = () => {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [captainInfo, setCaptainInfo] = useState(null);
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  // Handle PIN input changes
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value !== "" && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace for PIN input
  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Fetch tables after PIN verification
  const fetchTables = async (captainId) => {
    try {
      const response = await fetch(`/api/get-captain-tables?captain=${captainId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tables");
      }
      const data = await response.json();
      console.log("Tables Data:", data);
      
      setTables(data.tables || []);
    } catch (error) {
      setError(error.message || "Failed to fetch table data");
    }
  };

  // Handle PIN verification
  const handleSubmit = async () => {
    const pinCode = pin.join("");

    if (pinCode.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Verify PIN
      const verifyResponse = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinCode }),
      });

      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || "Invalid PIN");
      }

      if (!verifyData?.captain) {
        throw new Error("Captain information is missing in response");
      }

      // Store Captain Info
      const captainId = verifyData.captain._id;
      setCaptainInfo({ name: verifyData.captain.name, id: captainId });
      console.log("Captain Info Set:", verifyData.captain);
      setShowResult(true);

      // Fetch assigned tables
      fetchTables(captainId);
    } catch (err) {
      setError(err.message || "Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    setShowResult(false);
    setPin(["", "", "", ""]);
    setError(null);
    setTables([]);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  return (
    <div className="container">
      {showResult ? (
        <div className="result-container">
          <button className="back-button" onClick={handleBack}>
            ⬅ Back
          </button>
          <div className="welcome-message">
            <h2>Welcome, {captainInfo?.name || "Captain"}</h2>
            <p className="login-success">Successfully logged in</p>
          </div>
          <div className="tables-list">
            <h3>Tables Assigned:</h3>
            {tables.length > 0 ? (
              <ul className="tables-list">
                {tables.map((table, index) => (
                  <li key={index} className="table-item">
                    <strong>{table.tableName}</strong> - {table.seatNumber} Seats ({table.status})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No tables found</p>
            )}
          </div>
        </div>
      ) : (
        <div className="pin-entry">
          <h2>Enter Your 4-Digit PIN</h2>
          <div className="pin-inputs">
            {pin.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="pin-digit"
              />
            ))}
          </div>
          <button onClick={handleSubmit} className="submit-button" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Submit"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default Apktablet;
