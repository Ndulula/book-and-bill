import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

export default function PublicBookingPage() {
  const { businessId } = useParams();
  const [services, setServices] = useState([]);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service_id: '',
    customer_name: '',
    customer_phone: '',
    booking_date: '',
    booking_time: ''
  });
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const fetchBusinessData = useCallback(async () => {
    try {
      const response = await api.get(`/services/public/${businessId}`);
      setServices(response.data || []);
      setBusiness({ id: businessId, name: 'Business' });
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchBusinessData();
  }, [fetchBusinessData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const bookingData = {
        ...formData,
        user_id: businessId
      };
      
      const response = await api.post('/bookings/public', bookingData);
      setBookingDetails(response.data);
      setBookingComplete(true);
      setStep(3);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getAvailableTimes = () => {
    const times = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        times.push(
          `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        );
      }
    }
    return times;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl mb-4">📚</div>
          <p className="text-gray-600">Loading booking page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📚</div>
          <h1 className="text-4xl font-bold text-gray-900">
            Book & Bill
          </h1>
          <p className="text-gray-600 mt-2">
            {business?.name || 'Business'} - Book your appointment
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className={`flex-1 text-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className="text-sm">Step 1</div>
              <div className="font-medium">Select Service</div>
            </div>
            <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`flex-1 text-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className="text-sm">Step 2</div>
              <div className="font-medium">Your Details</div>
            </div>
            <div className={`w-8 h-0.5 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
            <div className={`flex-1 text-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className="text-sm">Step 3</div>
              <div className="font-medium">Confirmation</div>
            </div>
          </div>
        </div>

        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Choose a Service 💇
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setFormData({ ...formData, service_id: service.id });
                    setStep(2);
                  }}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-lg transition text-left"
                >
                  <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                  <p className="text-2xl font-bold text-indigo-600 mt-2">
                    R{typeof service.price === 'number' ? service.price.toFixed(2) : service.price}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">⏱️ {service.duration} minutes</p>
                </button>
              ))}
            </div>
            {services.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No services available at the moment</p>
                <p className="text-sm text-gray-400 mt-2">Please check back later</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Your Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Your Details 📝
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date *
                  </label>
                  <select
                    required
                    value={formData.booking_date}
                    onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a date</option>
                    {getAvailableDates().map((date) => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-ZA', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time *
                  </label>
                  <select
                    required
                    value={formData.booking_time}
                    onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a time</option>
                    {getAvailableTimes().map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Book Now 📅
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && bookingComplete && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-gray-600 mb-6">
              Your appointment has been booked successfully.
            </p>

            {bookingDetails && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
                <h3 className="font-bold text-gray-900 mb-3">Booking Details</h3>
                <p className="text-sm text-gray-600">Customer: {bookingDetails.booking.customer_name}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(bookingDetails.booking.booking_date).toLocaleDateString('en-ZA', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-600">Time: {bookingDetails.booking.booking_time}</p>
                {bookingDetails.invoice && (
                  <>
                    <p className="text-sm text-gray-600 mt-2">
                      💰 Total: R{typeof bookingDetails.invoice.total === 'number' ? bookingDetails.invoice.total.toFixed(2) : bookingDetails.invoice.total}
                    </p>
                    <p className="text-sm text-gray-600">🧾 Invoice: {bookingDetails.invoice.invoice_number}</p>
                  </>
                )}
              </div>
            )}

            <p className="text-sm text-gray-500 mb-6">
              An invoice has been generated and sent to the business.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Book Another Appointment
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by Book & Bill 📚</p>
        </div>
      </div>
    </div>
  );
}