import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ViewBillPopup.css";

const ViewBillPopup = ({ table, onClose }) => {
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(table.totalPrice);

  useEffect(() => {
    calculateFinalPrice();
  }, [extraDiscount]);

  const calculateFinalPrice = () => {
    const totalDiscount = table.orderItems.reduce((total, item) => {
      const itemPrice = item.price * item.quantity;
      return total + (itemPrice * item.discount) / 100;
    }, 0);

    const discountedTotal = table.totalPrice - totalDiscount;

    const extraDiscountAmount = (discountedTotal * extraDiscount) / 100;

    const gstAmount = table.orderItems.reduce((gstTotal, item) => {
      const itemPrice = item.price * item.quantity;
      const itemDiscountedPrice = itemPrice - (itemPrice * item.discount) / 100;
      const itemExtraDiscountedPrice = itemDiscountedPrice - (itemDiscountedPrice * extraDiscount) / 100;
      return gstTotal + (itemExtraDiscountedPrice * item.gstRate) / 100;
    }, 0);

    const calculatedFinalPrice = discountedTotal - extraDiscountAmount + gstAmount;
    setFinalPrice(calculatedFinalPrice);
  };

  const totalDiscount = table.orderItems.reduce((total, item) => {
    return total + (item.price * item.quantity * item.discount) / 100;
  }, 0);

  const gstOnDiscountedPrice = table.orderItems.reduce((gstTotal, item) => {
    const itemPrice = item.price * item.quantity;
    const discountedPrice = itemPrice - (itemPrice * item.discount) / 100;
    return gstTotal + (discountedPrice * item.gstRate) / 100;
  }, 0);

  const handleTableStatusUpdate = async () => {
    try {
      // Update table status to "available"
      const response = await axios.put('/api/updateTableStatus', {
        tableName: table.tableNumber,
        status: "available"
      });

      if (response.status === 200) {
        // Print bill after successfully updating the table status
        printBill();
      } else {
        console.error('Failed to update table status');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const printBill = () => {
    // Logic to prepare the bill
    const billContent = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; padding: 0; line-height: 1.4; max-width: 300px; margin: 0 auto; margin-left:-6px; margin-right:10px">
      <h2 style="text-align: center; margin-bottom: 2px;">Tomato Restaurant</h2>
     <div style="text-align: center; margin-bottom: 2px;">
  <div>32/1C, New Sanganer Rd, Sanganer</div>
  <div>Sector 3, Pratap Nagar, Jaipur</div>
  
</div>

<div style="text-align: center; margin-bottom: 4px;">
  MOB. 9001409003
</div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px;">
         <div>Customer: ${table.customerName.length > 6 ? table.customerName.slice(0, 6) + '...' : table.customerName}</div>
        <div>Table: ${table.tableNumber}</div>
        <div>Date: ${new Date(table.createdAt).toLocaleDateString()}</div>
      </div>
       <div style="border-bottom: 1px dotted #000; margin-top: 10px; margin-bottom: 10px;"></div>
      <div style="margin-bottom: 10px; font-weight: bold; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; text-align: center;">
          <span style="flex: 1; text-align: left;">Item Name</span>
          <span style="flex: 1;">Qty</span>
          <span style="flex: 1;">Price</span>
          <span style="flex: 1;text-align: right;">Total</span>
        </div>
      </div>
      <div style="border-bottom: 1px dotted #000; margin-bottom: 10px;"></div>
      ${table.orderItems
        .map(
          (item) => ` 
        <div style="display: flex; justify-content: space-between; text-align: center; font-size: 12px;">
          <span style="flex: 1; text-align: left;">${item.name}</span>
          <span style="flex: 1;">${item.quantity}</span>
          <span style="flex: 1;">₹${item.price.toFixed(2)}</span>
          <span style="flex: 1;text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</span>
        </div>`
        )
        .join('')}
      <div style="border-bottom: 1px dotted #000; margin-top: 10px; margin-bottom: 10px;"></div>
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
       <span>Total Price:</span>
      <span>₹
      ${table.totalPrice}
      </span>
      </div>
       <div style="border-bottom: 1px dotted #000; margin-top: 10px; margin-bottom: 10px;"></div>
      <div style="display: flex; justify-content: space-between; font-size: 12px;">
        <span>Item Discount:</span>
        <span>-₹${table.orderItems
          .reduce(
            (total, item) =>
              total + (item.price * item.quantity * item.discount) / 100,
            0
          )
          .toFixed(2)}</span>
      </div>
      
      ${extraDiscount > 0 ? `
      <div style="display: flex; justify-content: space-between; font-size: 12px;">
        <span>Extra Discount:</span>
        <span>-₹${(
          ((table.totalPrice - totalDiscount) * extraDiscount) / 100
        ).toFixed(2)}</span>
      </div>` : ''}

      <div style="display: flex; justify-content: space-between; font-size: 12px;">
        <span>Total GST:</span>
          <span>+₹${(
          table.orderItems.reduce((gstTotal, item) => {
            const itemPrice = item.price * item.quantity;
            const discountedPrice = itemPrice - (itemPrice * item.discount) / 100;
            return gstTotal +  (discountedPrice * item.gstRate) / 100; 
          }, 0)
        ).toFixed(2)}</span>
      </div>
     
      <div style="border-bottom: 1px dotted #000; margin-top: 10px; margin-bottom: 10px;"></div>
     
     
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
        <span>Final Price:</span>
<span>₹${(
  table.totalPrice - 
  table.orderItems.reduce(
    (total, item) => (item.price * item.quantity * item.discount) / 100,
    0
  ) + 
  table.orderItems.reduce((gstTotal, item) => {
    const itemPrice = item.price * item.quantity;
    const discountedPrice = itemPrice - (itemPrice * item.discount) / 100;
    return gstTotal + (discountedPrice * item.gstRate) / 100;
  }, 0) - 
  (extraDiscount > 0 ? ((table.totalPrice - totalDiscount) * extraDiscount) / 100 : 0)
).toFixed(2)}</span>
      </div>
      
      <div style="display: flex; align-items: center; font-weight: bold; font-size: 14px; margin-top: 10px; margin-bottom: 20px;">
        <div style="flex: 1; border-top: 1px dotted #000;"></div>
        <div style="padding: 0 10px; text-align: center;">
        HAVE A NICE DAY
        </div>
        <div style="flex: 1; border-top: 1px dotted #000;"></div>
      </div>
    </div>
    `;

    // Open a new window for printing
    const printWindow = window.open( 'width=350,height=600');
    printWindow.document.write(`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bill</title>
    </head>
    <body>
      ${billContent}
    </body>
    </html>`);
    printWindow.document.close();
    printWindow.print();
  };

  
 
  
  
  

  return (
    <div className="popup-overlay1">
      <div className="popup-content1">
        <div className="popup-header1">
          <h2>Restaurant Table Order</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Customer and Table Details */}
        <div className="details-row">
          <div className="details-item">
            <strong className="customer-name1">Customer Name:</strong>
            <span className="customer-name"> {table.customerName}</span>
          </div>
          <div className="details-item">
            <strong className="customer-name1">Table Number:</strong>
            <span className="customer-name"> {table.tableNumber}</span>
          </div>
        </div>
        <div className="details-row">
          <div className="details-item">
            <strong className="customer-name1">Bill Amount:</strong>
            <span className="customer-name"> ₹{finalPrice.toFixed(2)}</span>
          </div>
          <div className="details-item">
            <strong className="customer-name1">Bill Date:</strong>
            <span className="customer-name">
              {new Date(table.createdAt).toLocaleDateString()}{" "}
              {new Date(table.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="food-items">
          <h3 className="center-title">Ordered Food</h3>
          <table className="food-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {table.orderItems.map((item, index) => (
                <tr key={item.itemId}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Discounts and GST Section */}
        <div className="extra-section">
          <div className="extra-item">
            <strong className="customer-name1">Total Price:</strong>
            <span className="customer-name"> ₹{table.totalPrice.toFixed(2)}</span>
          </div>
          <div className="extra-item">
            <strong className="customer-name1">Discount:</strong>
            <span className="customer-name"> -₹{totalDiscount.toFixed(2)}</span>
          </div>
          <div className="extra-item extra-discount">
            <input
              type="number"
              className="discount-input"
              placeholder="Enter Extra Discount (%)"
              value={extraDiscount || ""}
              onChange={(e) => setExtraDiscount(Number(e.target.value) || 0)}
              style={{ width: "150px" }}
            />
          </div>
          <div className="extra-item">
            <strong className="customer-name1">Extra Discount:</strong>
            <span className="customer-name">
              -₹{(
                ((table.totalPrice - totalDiscount) * extraDiscount) / 100
              ).toFixed(2)}
            </span>
          </div>
          
          <div className="extra-item">
            <strong className="customer-name1">GST:</strong>
            <span className="customer-name"> +₹{gstOnDiscountedPrice.toFixed(2)}</span>
          </div>
         
        </div>

        {/* Footer Section */}
        <div className="popup-footer">
          <button className="print-btn" onClick={handleTableStatusUpdate}>
            Print Bill
          </button>
          <div className="final-total">
            <strong>Final Total:</strong> ₹{finalPrice.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBillPopup;
