import React, { useState } from "react";
import AddTableContent from "../components/AddTable/AddTable";
import ViewTableOrderContent from "../components/ViewTableOrder/ViewTableOrder";
import AddTableOrder from "../components/AddTableOrder/AddTableOrder";
import ViewTableContent from "../components/ViewTable/ViewTable";
import "./tableorder.css";

const MainPage = () => {
  const [activeComponent, setActiveComponent] = useState("ViewTable");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [totalSeats, setTotalSeats] = useState(0);

  const handleTableSelect = (tableId, seats) => {
    setSelectedTable(tableId);
    setTotalSeats(seats); // Store the selected table's total seats
  };

  const handleClick = (component) => {
    if (component === "AddTableOrder") {
      if (!selectedTable) {
        alert("Please select a table first");
        setShowPopup(true); // Show popup to ask user to select a table
        return;
      }
      setShowPopup(true); // Show popup for "Add Table Order"
    } else {
      setShowPopup(false); // Ensure popup is not shown for other components
    }
    setActiveComponent(component);
  };

  const handleClosePopup = () => {
    setShowPopup(false); // Close popup
    setSelectedTable(null); // Deselect the table
    setActiveComponent("ViewTable"); // Reset to ViewTable
  };

  return (
    <div className="table-container">
      <div className={`table-row ${showPopup ? "blurred" : ""}`}>
        <div
          className={`table-item ${activeComponent === "AddTable" ? "active" : ""}`}
          onClick={() => handleClick("AddTable")}
        >
          <div className="table-column">
            <div className="column-box">
              <img src="table8.webp" alt="Add Table" className="column-img" />
              <p className="column-name">Add Table</p>
            </div>
          </div>
        </div>
        <div
          className={`table-item ${activeComponent === "ViewTable" ? "active" : ""}`}
          onClick={() => handleClick("ViewTable")}
        >
          <div className="table-column">
            <div className="column-box">
              <img src="table1.png" alt="View Table" className="column-img" />
              <p className="column-name">View Table</p>
            </div>
          </div>
        </div>
        <div
          className={`table-item ${activeComponent === "AddTableOrder" ? "active" : ""}`}
          onClick={() => handleClick("AddTableOrder")}
        >
          <div className="table-column">
            <div className="column-box">
              <img src="table3.png" alt="Add Table Order" className="column-img" />
              <p className="column-name">Add Table Order</p>
            </div>
          </div>
        </div>
        <div
          className={`table-item ${activeComponent === "ViewTableOrder" ? "active" : ""}`}
          onClick={() => handleClick("ViewTableOrder")}
        >
          <div className="table-column">
            <div className="column-box">
              <img src="table2.png" alt="View Table Order" className="column-img" />
              <p className="column-name">View Table Orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="line-bottom"></div>

      {activeComponent === "ViewTable" && (
        <ViewTableContent onTableSelect={handleTableSelect} />
      )}
      {activeComponent === "AddTable" && <AddTableContent />}
      {showPopup && activeComponent === "AddTableOrder" && (
        <AddTableOrder
          selectedTable={selectedTable}
          totalSeats={totalSeats} // Pass totalSeats to AddTableOrder
          onClose={handleClosePopup}
        />
      )}
      {activeComponent === "ViewTableOrder" && <ViewTableOrderContent />}
    </div>
  );
};

export default MainPage;
