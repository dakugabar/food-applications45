import React, { useState, useRef } from "react";
import "./apktablet.css";

const Apktablet = () => {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [captainInfo, setCaptainInfo] = useState(null);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value !== "" && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const fetchCaptainDetails = async (captainId) => {
    if (!captainId) {
      throw new Error("Captain ID is missing!");
    }

    try {
      const response = await fetch(`/api/get-captain-details?captainId=${captainId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch captain details");
      }
  
      return await response.json();
      
    } catch (err) {
      console.error("API Error:", err);
      throw new Error(err.message || "Network request failed");
    }
  };

  const handleSubmit = async () => {
    const pinCode = pin.join("");

    if (pinCode.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Verify PIN and get captain ID
      const verifyResponse = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinCode }),
      });

      const verifyData = await verifyResponse.json();
      console.log("Verify API Response:", verifyData);

      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || "Invalid PIN");
      }

      console.log("Captain ID:", verifyData?.captain?._id);

      if (!verifyData?.captain?._id) {
        throw new Error("Captain ID is missing in response");
      }

      // Get captain details and tables
      const { tables } = await fetchCaptainDetails(verifyData.captain._id);
      
      setCaptainInfo({
        name: verifyData.captain.name,
        tables: tables || []
      });
      
      setShowResult(true);
    } catch (err) {
      setError(err.message || "Failed to connect to server");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowResult(false);
    setPin(["", "", "", ""]);
    setError(null);
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
            <h2>Welcome, {captainInfo.name}</h2>
            <p className="login-success">Successfully logged in</p>
          </div>
          
          <div className="tables-section">
            <h3>Your Assigned Tables</h3>
            {captainInfo.tables.length > 0 ? (
              <div className="tables-grid">
                {captainInfo.tables.map((table, index) => (
                  <div key={index} className="table-card">
                    <div className="table-header">
                      <span className="table-name">{table.tableName}</span>
                      <span className={`status-badge ${table.status}`}>
                        {table.status}
                      </span>
                    </div>
                    <div className="table-details">
                      <span>Seats: {table.seatNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-tables">No tables currently assigned</p>
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
