import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ServiceList from './components/services/ServiceList';
import BookingList from './components/bookings/BookingList';
import InvoiceList from './components/invoices/InvoiceList';
import PublicBookingPage from './components/booking/PublicBookingPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/book/:businessId" element={<PublicBookingPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<PrivateRoute><><Navbar /><Dashboard /></></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><><Navbar /><Dashboard /></></PrivateRoute>} />
            <Route path="/services" element={<PrivateRoute><><Navbar /><ServiceList /></></PrivateRoute>} />
            <Route path="/bookings" element={<PrivateRoute><><Navbar /><BookingList /></></PrivateRoute>} />
            <Route path="/invoices" element={<PrivateRoute><><Navbar /><InvoiceList /></></PrivateRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;