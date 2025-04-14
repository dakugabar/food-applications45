// components/TableSelector.js
import { useState } from "react";

export default function TableSelector() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);

  const handleTableClick = async (tableNumber) => {
    setSelectedTable(tableNumber);

    try {
      const res = await fetch(`/api/manage?tableNumber=${tableNumber}`);
      const data = await res.json();

      if (res.ok) {
        setTableData(data);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  return (
    <div>
      <h2>Select a Table:</h2>
      <button onClick={() => handleTableClick("T1")}>T1</button>
      <button onClick={() => handleTableClick("T2")}>T2</button>
      <button onClick={() => handleTableClick("T3")}>T3</button>

      {tableData && (
        <div style={{ marginTop: "20px" }}>
          <h3>Table Data for {selectedTable}</h3>
          <pre>{JSON.stringify(tableData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
