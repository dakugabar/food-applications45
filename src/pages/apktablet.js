import React, { useState, useRef } from "react";

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
  const fetchTables = async (captainID) => {
    try {
      const response = await fetch(`/api/get-captain-tables?captain=${captain}`);

      if (!response.ok) {
        throw new Error("Could not fetch vectory data");
      }

      const data = await response.json();
      setTables(data.tables); // ✅ Store tables in state
    } catch (error) {
      console.error("Error fetching tables:", error);
      setError("Failed to fetch table data");
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
      // ✅ Verify PIN
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

      // ✅ Store Captain Info
      const captain = verifyData.captain._id;
      setCaptainInfo({ name: verifyData.captain.name, id: captain });
      setShowResult(true);

      // ✅ Fetch tables using captain ID
      fetchTables(captain);
    } catch (err) {
      setError(err.message || "Failed to connect to server");
      console.error("Error:", err);
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
            <h2>Welcome, {captainInfo.name}</h2>
            <p className="login-success">Successfully logged in</p>
          </div>
          <div className="tables-list">
            <h3>Tables Assigned:</h3>
            {tables.length > 0 ? (
              <ul>
                {tables.map((table, index) => (
                  <li key={index}>{table}</li>
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
