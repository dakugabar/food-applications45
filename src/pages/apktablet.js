import React, { useState, useRef } from "react";
import "./apktablet.css";

const Apktablet = () => {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Allow only single digit numbers

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Move to the next input field
    if (value !== "" && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async () => {
    const pinCode = pin.join("");

    if (pinCode.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    try {
      const response = await fetch("/api/checkPin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error);
        setResult(null);
      } else {
        setResult(data);
        setError(null);
        setShowResult(true);
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const handleBack = () => {
    setShowResult(false);
    setPin(["", "", "", ""]);
    setError(null);
  };

  return (
    <div className="container">
      {showResult ? (
        <>
          <button className="back-button" onClick={handleBack}>⬅ Back</button>
          <div className="result">
            <h3>Name: {result.name}</h3>
            <h4>Assigned Tables:</h4>
            <ul>
              {result.tables.map((table, index) => (
                <li key={index}>
                  <strong>{table.tableName}</strong> - Seats: {table.seatNumber} - Status: {table.status}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>
          <h2>Enter 4-Digit PIN</h2>
          <div className="pinInputs">
            {pin.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
            ))}
          </div>
          <button onClick={handleSubmit} className="button">Submit</button>
          {error && <p className="error">{error}</p>}
        </>
      )}
    </div>
  );
};

export default Apktablet;
