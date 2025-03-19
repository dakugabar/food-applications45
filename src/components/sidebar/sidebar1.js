import React from 'react';
import './sidebar2.css';



const Sidebar = ({ setSelectedComponent, selectedComponent }) => {
  
  return (
    <div className='sidebar'>
      <div className='sidebar-options'>
        <div
          className={`sidebar-option ${selectedComponent === 'AddItems' ? 'active' : ''}`}
          onClick={() => setSelectedComponent('AddItems')}
        >
          <img src='/add_icon.png' alt="Add Items" />
          <p>Add Items</p>
        </div>
        <div
          className={`sidebar-option ${selectedComponent === 'AddCategory' ? 'active' : ''}`}
          onClick={() => setSelectedComponent('AddCategory')}
        >
          <img src='/add_icon.png' alt="Add New Category" />
          <p>Add New Category</p>
        </div>
        
        <div
          className={`sidebar-option ${selectedComponent === 'ListItems' ? 'active' : ''}`}
          onClick={() => setSelectedComponent('ListItems')}
        >
          <img src='/order_icon.png' alt="List Items" />
          <p>Item List</p>
        </div>
        
        <div
          className={`sidebar-option ${selectedComponent === 'Orders' ? 'active' : ''}`}
          onClick={() => setSelectedComponent('Orders')}
        >
          <img src='/order_icon.png' alt="Orders Items" />
          <p>Item Orders</p>
        </div>

        <div
          className={`sidebar-option ${selectedComponent === 'Payment' ? 'active' : ''}`}
          onClick={() => setSelectedComponent('Payment')}
        >
          <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-credit-card"
        >
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
          <line x1="16" y1="14" x2="16" y2="14" />
        </svg>
          <p>Payment</p>
        </div>
        <div
          className={`sidebar-option ${selectedComponent === 'Admin' ? 'active' : ''}`}
          onClick={() => setSelectedComponent('Admin')}
        >
          <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-map-pin"
        >
          <path d="M21 10c0 5.25-9 13-9 13s-9-7.75-9-13a9 9 0 1 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
          
          {/* <img src='/location.png' alt="Orders Items" /> */}
           {/* <FontAwesomeIcon icon={faMapMarkerAlt} className="icon1"   /> */}
          
          <p>Admin Location</p>
        </div>
        <div
          className={`sidebar-option ${selectedComponent === 'Gst' ? 'active' : ''}`}
          onClick={() => setSelectedComponent('Gst')}
        >
           <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-percent"
        >
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="6" y1="18" x2="18" y2="6" />
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="18" r="3" />
        </svg>
          {/* <img src='/tax.jpg' alt="Orders Items" /> */}
           {/* <FontAwesomeIcon icon={faFileInvoiceDollar} className="icon1"   /> */}
          
          <p>Tax</p>
        </div>
     
        <div
          className={`sidebar-option ${selectedComponent === 'Coupon' ? 'active' : ''}`}
          onClick={() => setSelectedComponent('Coupon')}
        >
         <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="feather feather-tag"
        >
          <path d="M20.59 7.41 16 2.83 2.83 16 1 21l5-1.83L21.17 8.59a2 2 0 0 0 0-2.83z" />
          <path d="M17 6a2 2 0 1 1-2-2 2 2 0 0 1 2 2z" />
        </svg>
          {/* <img src='/Coupon.png' alt="Orders Items" /> */}
         
          
          <p>Coupon</p>
        </div>
       <div
          className={`sidebar-option ${selectedComponent === 'Couponlist' ? 'active' : ''}`}
          onClick={() => setSelectedComponent('Couponlist')}
        >
          <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width="24"
  height="24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="feather feather-list"
>
  <path d="M4 6h16M4 12h16M4 18h16" />
  <path d="M2 6h2v2H2zm0 6h2v2H2zm0 6h2v2H2z" />
</svg>
          {/* <img src='/Coupon.png' alt="Orders Items" /> */}
         
          
          <p>Coupon List</p>
        </div>
        <div
  className={`sidebar-option ${selectedComponent === 'deliveryFee' ? 'active' : ''}`}
  onClick={() => setSelectedComponent('deliveryFee')}
>
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width="24"
  height="24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="feather feather-truck"
>
  <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
  <path d="M16 8h4l3 5v3h-7V8z" />
  <circle cx="5.5" cy="18.5" r="2.5" />
  <circle cx="18.5" cy="18.5" r="2.5" />
</svg>

  <p>Delivery Fee</p>
</div>

<div
  className={`sidebar-option ${selectedComponent === 'printer' ? 'active' : ''}`}
  onClick={() => setSelectedComponent('printer')}
>
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width="24"
  height="24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="feather feather-printer"
>
  <path d="M6 9h12V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v4z" />
  <path d="M6 18h12" />
  <path d="M6 14h12v4H6z" />
  <path d="M5 14h2v4H5z" />
  <path d="M17 14h2v4h-2z" />
  <path d="M7 19h10v2H7z" />
  <circle cx="8.5" cy="19.5" r="1.5" />
  <circle cx="15.5" cy="19.5" r="1.5" />
</svg>

 <p>Print</p>
</div>

<div
  className={`sidebar-option ${selectedComponent === 'headerimage' ? 'active' : ''}`}
  onClick={() => setSelectedComponent('headerimage')}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-image"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M3 3l18 18" />
    <path d="M9 9l-2 2 3 3 5-5 4 4" />
  </svg>
  <p>Header Image</p>
</div>

        <div
  className={`sidebar-option ${selectedComponent === 'addcaptain' ? 'active' : ''}`}
  onClick={() => setSelectedComponent('addcaptain')}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-image"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M3 3l18 18" />
    <path d="M9 9l-2 2 3 3 5-5 4 4" />
  </svg>
  <p>Add Captain</p>
</div>


<div
  className={`sidebar-option ${selectedComponent === 'captain' ? 'active' : ''}`}
  onClick={() => setSelectedComponent('captain')}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-image"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M3 3l18 18" />
    <path d="M9 9l-2 2 3 3 5-5 4 4" />
  </svg>
  <p>Manage Captain</p>
</div>


<div
  className={`sidebar-option ${selectedComponent === 'Settable' ? 'active' : ''}`}
  onClick={() => setSelectedComponent('Settable')}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke={selectedComponent === 'Settable' ? 'black' : '#007BFF'} 
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-layout"
  >
    <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" />
    <path d="M3 9h18M9 3v18M15 3v18" />
  </svg>
  <p>Manage Table</p>
</div>
 
<div className='space-bottom'>

</div>
      </div>

    </div>
  );
};

export default Sidebar;