import React, { useState } from 'react';

import Sidebar from '../components/sidebar/sidebar1';
import AddItems from '../components/additems/additems1';
import ListItems from '../components/listitems/listitems1';
import Orders from '../components/orders/orders1';
import './adminpanel2.css';
import { ToastContainer } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';
import AddCategory from '../components/addcategory/addcategory1';
import Payment from '../components/payment/payment1';
import Admin from '../components/adminaddress/admin';
import Gst from '../components/gst/gst1';
import Coupon from '../components/coupon/coupon1';
import Couponlist from '../components/couponlist/couponlist1';
import AdminNavbar from '../components/adminnavbar/adminnavbar1';
import Headerimage from '../components/headerback/headerimage';
import Settable from '../components/admintable/settable';
import DeliveryFee from '../components/deliveryFee/deliveryFee';
import Printer from '../components/printer/printer';
import Addcaptain from '../components/captain/addcaptain';
import Captain from '../components/managecaptain/captain';

const AdminPanel = () => {
  const [selectedComponent, setSelectedComponent] = useState('Orders'); // State to track the selected component

  const renderComponent = () => {
    <ToastContainer/>
    switch (selectedComponent) {
      case 'AddItems':
        return <AddItems />;
      case 'ListItems':
        return <ListItems />;
        
      case 'Orders':
        return <Orders />;
        case 'AddCategory':
        return <AddCategory />;
        case 'Payment':
        return <Payment/>;
        case 'Admin':
          return <Admin />;
          case 'Gst':
          return <Gst />;
          case 'Coupon':
            return <Coupon />;
            case 'Couponlist':
              return <Couponlist />;
              case 'headerimage':
                return <Headerimage />;
                case 'Settable':
                  return <Settable />;
                  case 'deliveryFee':
                    return <DeliveryFee />;
                    case 'printer':
                      return <Printer/>;
                      case 'addcaptain':
                      return <Addcaptain />;
                      case 'captain':
                        return <Captain />;
      default:
        return ;
    }
  };

  return (
    <div className='admin-panel'>
      <AdminNavbar />
      
      <div className='admin-panel-content'>
        <Sidebar setSelectedComponent={setSelectedComponent} />
        <div className='admin-panel-right'>
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
