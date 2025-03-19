import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faPhone,faFilePdf } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './orders2.css';
import '../../app/globals.css';
import { faLocationDot,faCalendar } from '@fortawesome/free-solid-svg-icons';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
  

    

    try {
      const response = await fetch('/api/ordersList', {
        method: 'GET',
        headers: {
          
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      
        setOrders(data.orders);
       
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Error fetching orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
   

    try {
      const response = await fetch('/api/changeOrderStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
         
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        console.error('Failed to update order status:', data.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchOrders();
  };

  const generatePDF = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(16);

    // Top Row: Logo and Restaurant Details
    doc.addImage('/parcel_icon.png', 'PNG', 10, 10, 20, 20); // Logo Image
    doc.setFont("helvetica", "bold");
    doc.text('Restaurant Name', 120, 15);
    
    const addressText = "Address: 78, tonk road, G250, RIICO Industrial Area,Mansarovar, Jaipur, Rajasthan 302020, India";
    const wrappedAddress = doc.splitTextToSize(addressText,120);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(wrappedAddress, 120, 21); // Wrapped Restaurant Address
 doc.text(`GST No: 1234567890`, 120, 36);

    // New Row: Two Columns
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('Invoice', 10, 50);

    // Left Column: User Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const userAddressText = `${order.selectedAddress.flatNo}, ${order.selectedAddress.landmark}, ${order.selectedAddress.location}`;
    const wrappedUserAddress = doc.splitTextToSize(userAddressText, 67); // Wrap address text to fit within 67 units
    
    // Dynamically adjust the height based on the number of lines in the wrapped address
    let currentYPosition = 56;
    wrappedUserAddress.forEach((line) => {
        doc.text(line, 10, currentYPosition); // Draw each line of the address
        currentYPosition += 6; // Move down for the next line (adjust spacing as needed)
    });// Add mobile number below the address, dynamically positioned
    const minimumGap = 12;
    currentYPosition += Math.max(minimumGap - (wrappedUserAddress.length * 6), 0);
    
    // Render the mobile number
    doc.text(`${order.user.mobileNumber}`, 10, currentYPosition);
    const currentDateTime = new Date().toLocaleString(); // Get current date and time
    doc.text(`Invoice Date: ${currentDateTime}`, 120, 62);
    doc.text(`Order Date: ${new Date(order.date).toLocaleString()}`, 120, 56);
    doc.text(`Payment Status: ${order.paymentStatus}`, 120, 68);

    // Table Section: Product List
    let yPosition = 100;

    // Set font and background color for the header row
    doc.setFont("helvetica", "bold");
    doc.setFillColor(200, 200, 200);
    
    // Draw the background rectangle for the header
    doc.rect(10, yPosition - 5, 190, 10, 'F'); // Header row rectangle (with fill color)
    
    // Add header text
    doc.text('S.No', 15, yPosition);          // Serial Number
    doc.text('Item Name', 43, yPosition);     // Item Name
    doc.text('Quantity', 85, yPosition);      // Quantity
    doc.text('Price', 138, yPosition);        // Price
    doc.text('Total', 174, yPosition);        // Total Price
    
    // Draw vertical lines for column borders
    doc.line(30, yPosition - 5, 30, yPosition + 5);  // Between Serial Number and Item Name
    doc.line(80, yPosition - 5, 80, yPosition + 5);  // Between Item Name and Quantity
    doc.line(120, yPosition - 5, 120, yPosition + 5); // Between Quantity and Price
    doc.line(160, yPosition - 5, 160, yPosition + 5); // Between Price and Total
    
    // Add explicit top and bottom horizontal borders for clarity
    doc.line(10, yPosition - 5, 200, yPosition - 5); // Top border of the header row
    doc.line(10, yPosition + 5, 200, yPosition + 5); // Bottom border of the header row
    
    // Add left and right vertical borders
    doc.line(10, yPosition - 5, 10, yPosition + 5);  // Left border
    doc.line(200, yPosition - 5, 200, yPosition + 5); // Right border
    
    // Table Content
    doc.setFont("helvetica", "normal");
    // doc.setFillBorder(200, 200, 200);
    yPosition += 10;
    
    order.items.forEach((item, index) => {
      // Draw a border rectangle for the row
      doc.rect(10, yPosition - 5, 190, 10); // x=10, y=yPosition-5, width=190, height=10
    
      // Add row content inside the rectangle
      doc.text(`${index + 1}`, 17, yPosition); // Serial number
      doc.text(item.foodId ? item.foodId.name : 'Unknown', 43, yPosition); // Item name
      doc.text(`${item.quantity}`, 90, yPosition); // Quantity
      doc.text(`${item.price}`, 136, yPosition); // Price
    
      // Calculate total price (quantity * price)
      const totalPrice = item.price * item.quantity;
      doc.text(`${totalPrice.toFixed(2)}`, 170, yPosition); // Total price
    
      // Draw vertical lines for right-side column borders
      doc.line(30, yPosition - 5, 30, yPosition + 5);  // Between Serial Number and Item Name
      doc.line(80, yPosition - 5, 80, yPosition + 5);  // Between Item Name and Quantity
      doc.line(120, yPosition - 5, 120, yPosition + 5); // Between Quantity and Price
      doc.line(160, yPosition - 5, 160, yPosition + 5); // Between Price and Total Price
    
      // Move to the next row
      yPosition += 10;
  });
  
    
    doc.text('SUBTOTAL:', 122, yPosition);
    doc.text(`${order.subtotal.toFixed(2)}`, 170, yPosition);
    
    // Draw borders
    // Bottom border
    doc.line(120, yPosition + 2, 200, yPosition + 2); // x1=150, x2=190 for the line width
    // Left border
    doc.line(120, yPosition - 5, 120, yPosition + 2); // x=150 for left side vertical line
    // Right border
    doc.line(200, yPosition - 5, 200, yPosition + 2); 
    yPosition += 7;

    if (order.itemDiscount > 0) {
    doc.text('ITEM DISCOUNT:', 122, yPosition);
doc.text(`- ${order.itemDiscount.toFixed(2)}`, 168, yPosition);

// Draw borders
// Bottom border
doc.line(120, yPosition + 2, 200, yPosition + 2); // x1=150, x2=190 for the line width
// Left border
doc.line(120, yPosition - 5, 120, yPosition + 2); // x=150 for left side vertical line
// Right border
doc.line(200, yPosition - 5, 200, yPosition + 2); 
  
yPosition += 7;
    }
if (order.couponDiscount > 0) {
  // Display coupon discount text and value
  doc.text('COUPON DISCOUNT:', 122, yPosition);
  doc.text(`- ${order.couponDiscount.toFixed(2)}`, 168, yPosition);

  // Draw borders
  // Bottom border
  doc.line(120, yPosition + 2, 200, yPosition + 2); // x1=125, x2=200 for the line width
  // Left border
  doc.line(120, yPosition - 5, 120, yPosition + 2); // x=125 for left side vertical line
  // Right border
  doc.line(200, yPosition - 5, 200, yPosition + 2); // x=200 for right side vertical line

  // Move to the next line
  yPosition += 7;
}

  

doc.text('TOTAL GST:', 122, yPosition);
doc.text(`+ ${order.totalGst.toFixed(2)}`, 168, yPosition);

// Draw borders
// Bottom border
doc.line(120, yPosition + 2, 200, yPosition + 2); // x1=150, x2=190 for the line width
// Left border
doc.line(120, yPosition - 5, 120, yPosition + 2); // x=150 for left side vertical line
// Right border
doc.line(200, yPosition - 5, 200, yPosition + 2); 
  
yPosition += 7;
if (order.deliveryFee > 0) {
  // Display delivery fee text and value
  doc.text('DELIVERY FEE:', 122, yPosition);
  doc.text(`+ ${order.deliveryFee.toFixed(2)}`, 168, yPosition);

  // Draw borders
  // Bottom border
  doc.line(120, yPosition + 2, 200, yPosition + 2); // Bottom border line
  // Left border
  doc.line(120, yPosition - 5, 120, yPosition + 2); // Left side vertical line
  // Right border
  doc.line(200, yPosition - 5, 200, yPosition + 2); // Right side vertical line

  // Move to the next line
  yPosition += 7;
}

  

    // Footer
   // Draw the text
   doc.setFont("helvetica", "bold");
doc.text('TOTAL PRICE :', 122, yPosition);
doc.text(`${order.totalAmount.toFixed(2)}`, 170, yPosition);

// Draw borders
// Bottom border
doc.line(120, yPosition + 2, 200, yPosition + 2); // x1=150, x2=190 for the line width
// Left border
doc.line(120, yPosition - 5, 120, yPosition + 2); // x=150 for left side vertical line
// Right border
doc.line(200, yPosition - 5, 200, yPosition + 2); // x=190 for right side vertical line

  
    yPosition += 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text('----------------------------------------------------------------------------------------------', 50, yPosition);
    yPosition += 10;
    doc.text('Thank you for your order!', 105, yPosition, { align: 'center' });
    yPosition += 10;
    doc.text('For any issues, contact support at [email].', 105, yPosition, { align: 'center' });
    yPosition += 10;
    doc.text('Invoice generated automatically. Please keep this invoice for reference.', 105, yPosition, { align: 'center' });

    // Open PDF in a new tab
    doc.output('dataurlnewwindow');
};


  

  return (
    <div className='order-admin'>
      <div className='order-header'>
        <h1>Order Page</h1>
        <p className='refresh'>
          <FontAwesomeIcon
            icon={faSyncAlt}
            className='refresh-icon'
            onClick={handleRefresh}
            style={{ cursor: 'pointer' }}
          />
        </p>
      </div>

      {loading ? (
        <p className='loading'>Loading...</p>
      ) : error ? (
        <p className='error'>{error}</p>
      ) : (
        <div className='order-list-admin'>
          
            {orders && Array.isArray(orders) && orders.slice().reverse().map((order) => (
            <div key={order._id} className='order-item'>
              <div className='order-item-header'>
                <img src='/parcel_icon.png' alt='parcel icon' className='order-item-icon' />
               
              </div>
              <div className='order-item-details'>
                <p className='order-item-food'>
                  {order.items
                    .map(item => item.foodId ? `${item.foodId.name} x ${item.quantity}` : `Unknown Food x ${item.quantity}`)
                    .join(', ')}
                </p>
                <div className='order-item-address'>
                  <p>
                  <FontAwesomeIcon icon={faLocationDot} className="mobile-icon" />
                  {order.selectedAddress.flatNo}, {order.selectedAddress.landmark}</p>
                  <p>{order.selectedAddress.location}</p>
                </div>
                <p className='mobile-number'>
                  <FontAwesomeIcon icon={faPhone} className="mobile-icon" />
                  {order.user.mobileNumber}
                </p>
                <p className='order-item-date'>
                <FontAwesomeIcon icon={faCalendar} className="mobile-icon" />

                  {new Date(order.date).toLocaleString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>
              </div>
              
              <p className='order-item-total-items'>
                Items: {order.items.length}
              </p>
              <p className='order-item-total-amount'>
                <span className='mobile-icon1'>₹</span>{order.totalAmount}
              </p>
              <p>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                >
                  <option value='Order Processing'>Order Processing</option>
                  <option value='Accepted'>Accepted</option>
                  <option value='Food Preparing'>Food Preparing</option>
                  <option value='Out for delivery'>Out for delivery</option>
                  <option value='Delivered'>Delivered</option>
                  <option value='Cancelled'>Cancelled</option>
                </select>
                <div className='order-item-name'>
                  <p className='order-item-date'>
                    Status: {order.status}
                  </p>
                  <p className='order-item-date'>
                    Payment Status: {order.paymentStatus}
                  </p>
                  {order.paymentStatus !== 'Cash on Delivery' && (
                    <p className='order-item-total-items'>
                      UTR: {order.UTR}
                    </p>
                  )}
                </div>
                <p>
                <div className="invoice-container">
                <button className='pdf-button' onClick={() => generatePDF(order)}>
                <FontAwesomeIcon icon={faFilePdf} />PDF Invoice
                </button>
                </div>
                </p>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
