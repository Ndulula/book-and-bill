import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/invoices/${id}/status`, { status });
      fetchInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Failed to update invoice status');
    }
  };

  const handleSendInvoice = (invoice) => {
    const message = `🧾 *Invoice*\n\n` +
      `Customer: ${invoice.customer_name}\n` +
      `Service: ${invoice.service_name}\n` +
      `Date: ${invoice.booking_date}\n` +
      `Amount: R${typeof invoice.total === 'number' ? invoice.total.toFixed(2) : invoice.total}\n` +
      `Status: ${invoice.status}\n\n` +
      `Thank you for your business! 🙏`;

    navigator.clipboard.writeText(message);
    alert('📋 Invoice copied to clipboard!\nPaste it in WhatsApp, email, or any messaging app.');
  };

  const filteredInvoices = filter === 'all' 
    ? invoices 
    : invoices.filter(inv => inv.status === filter);

  // Ensure totalRevenue is a number
  const totalRevenue = invoices.reduce((sum, inv) => {
    const total = parseFloat(inv.total) || 0;
    return sum + total;
  }, 0);

  const paidRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => {
      const total = parseFloat(inv.total) || 0;
      return sum + total;
    }, 0);

  const unpaidRevenue = totalRevenue - paidRevenue;

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading invoices...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Invoices 💰</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">
            R{typeof totalRevenue === 'number' ? totalRevenue.toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-2xl font-bold text-green-600">
            R{typeof paidRevenue === 'number' ? paidRevenue.toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Unpaid</p>
          <p className="text-2xl font-bold text-red-600">
            R{typeof unpaidRevenue === 'number' ? unpaidRevenue.toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'paid', 'unpaid'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              filter === status 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-gray-500 text-lg">No invoices found</p>
            <p className="text-gray-400 text-sm mt-2">Invoices are automatically created when bookings are made</p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{invoice.invoice_number}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-600">👤 {invoice.customer_name}</p>
                    <p className="text-gray-600">💇 {invoice.service_name}</p>
                    <p className="text-gray-600">📅 {invoice.booking_date}</p>
                    <p className="text-gray-600 font-medium">
                      💰 R{typeof invoice.total === 'number' ? invoice.total.toFixed(2) : invoice.total}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSendInvoice(invoice)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                  >
                    📤 Send Invoice
                  </button>
                  <select
                    value={invoice.status}
                    onChange={(e) => handleStatusUpdate(invoice.id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}