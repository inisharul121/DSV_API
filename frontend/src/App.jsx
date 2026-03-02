import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Shipments from './pages/Shipments';
import Dashboard from './pages/Dashboard';
import Quotes from './pages/Quotes';
import Order from './components/wizard/Order';
import Staff from './pages/Staff';
import Customers from './pages/Customers';
import Labels from './pages/Labels';

import Home from './pages/Home';
import About from './pages/About';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Private Dashboard Area */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/order" element={<Order />} />
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/labels" element={<Labels />} />
          <Route path="/payments" element={<div className="card"><h3>Payments</h3><p>Payment transaction history logic goes here.</p></div>} />
          <Route path="/reports" element={<div className="card"><h3>Reports</h3><p>Analytics and reporting dashboards.</p></div>} />
          <Route path="/profile" element={<div className="card"><h3>User Profile</h3><p>User settings and preferences.</p></div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
