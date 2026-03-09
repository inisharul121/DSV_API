import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Shipments from './pages/Shipments';
import Dashboard from './pages/Dashboard';
import Quotes from './pages/Quotes';
import Order from './components/wizard/Order';
import OrderList from './pages/OrderList';
import Staff from './pages/Staff';
import Customers from './pages/Customers';
import Labels from './pages/Labels';
import Login from './pages/Login';
import CustomerRegister from './pages/CustomerRegister';
import CustomerOrders from './pages/CustomerOrders';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerProfile from './pages/CustomerProfile';
import CustomerLayout from './components/layout/CustomerLayout';

import Home from './pages/Home';
import About from './pages/About';
import Support from './pages/Support';
import Contact from './pages/Contact';
import Reports from './pages/Reports';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Landing Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/support" element={<Support />} />
        <Route path="/contact" element={<Contact />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/portal/register" element={<CustomerRegister />} />

        {/* Customer Portal */}
        <Route element={<CustomerLayout />}>
          <Route path="/portal/dashboard" element={<CustomerDashboard />} />
          <Route path="/portal/orders" element={<CustomerOrders />} />
          <Route path="/portal/profile" element={<CustomerProfile />} />
          <Route path="/portal/book" element={<Order />} />
          <Route path="/portal/shipments" element={<Shipments />} />
          <Route path="/portal/labels" element={<Labels />} />
        </Route>

        {/* Private Dashboard Area (Admin - Employee Side) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/order" element={<Order />} />
          <Route path="/order-list" element={<OrderList />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/labels" element={<Labels />} />
          <Route path="/payments" element={<div className="card"><h3>Payments</h3><p>Payment transaction history logic goes here.</p></div>} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<div className="card"><h3>User Profile</h3><p>User settings and preferences.</p></div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
