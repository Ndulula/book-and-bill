import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalServices: 0,
    totalRevenue: 0,
    pendingBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, servicesRes, invoicesRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/services'),
        api.get('/invoices')
      ]);

      const bookings = bookingsRes.data || [];
      const services = servicesRes.data || [];
      const invoices = invoicesRes.data || [];

      // Calculate total revenue - ensure it's a number
      const totalRevenue = invoices.reduce((sum, inv) => {
        const total = parseFloat(inv.total) || 0;
        return sum + total;
      }, 0);

      setStats({
        totalBookings: bookings.length,
        totalServices: services.length,
        totalRevenue: totalRevenue,
        pendingBookings: bookings.filter(b => b.status === 'pending').length
      });

      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Welcome back, {user?.business_name}! 👋
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
            <span className="text-3xl">📅</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
            </div>
            <span className="text-3xl">💇</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
            </div>
            <span className="text-3xl">⏳</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                R{typeof stats.totalRevenue === 'number' ? stats.totalRevenue.toFixed(2) : '0.00'}
              </p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
          <button 
            onClick={() => window.location.href = '/bookings'}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            View all →
          </button>
        </div>
        
        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No bookings yet. Share your booking link with customers!</p>
            <p className="text-sm text-gray-400 mt-2">
              Your booking link: {window.location.origin}/book/{user?.id}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div>
                  <p className="font-medium text-gray-900">{booking.customer_name}</p>
                  <p className="text-sm text-gray-600">{booking.service_name} • {new Date(booking.booking_date).toLocaleDateString('en-ZA')} at {booking.booking_time}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    R{typeof booking.price === 'number' ? booking.price.toFixed(2) : booking.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}