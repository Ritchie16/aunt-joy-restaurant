import React, { useState } from 'react';
import Button from '../common/Button';
import  Modal  from '../common/Modal';
import { useApi } from '../../hooks/useApi';
import { Calendar, Clock, Users, Phone, Mail, User } from 'lucide-react';
import './ReservationForm.css';

const ReservationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    notes: ''
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { post } = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await post('/api/v1/reservations', formData);
      setModalOpen(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        guests: '2',
        notes: ''
      });
    } catch (error) {
      console.error('Reservation error:', error);
      alert('Failed to make reservation. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 3); // Allow booking up to 3 months in advance

  const todayStr = today.toISOString().split('T')[0];
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <section id="reservation" className="reservation-section">
      <div className="container">
        <div className="reservation-content">
          <div className="reservation-text">
            <h2 className="section-title">Book Your Table</h2>
            <p className="section-subtitle">
              Reserve your spot for an unforgettable Malawian dining experience
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="reservation-form">
            <div className="form-grid">
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name">
                  <User className="inline h-4 w-4 mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Phone Field */}
              <div className="form-group">
                <label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+265 (0) XXX XXX XXX"
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Date Field */}
              <div className="form-group">
                <label htmlFor="date">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={todayStr}
                  max={maxDateStr}
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Time Field */}
              <div className="form-group">
                <label htmlFor="time">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Time *
                </label>
                <select
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select preferred time</option>
                  <option value="08:00">8:00 AM - Breakfast</option>
                  <option value="10:00">10:00 AM - Mid-morning</option>
                  <option value="12:00">12:00 PM - Lunch</option>
                  <option value="14:00">2:00 PM - Afternoon</option>
                  <option value="16:00">4:00 PM - Early Dinner</option>
                  <option value="18:00">6:00 PM - Dinner</option>
                  <option value="20:00">8:00 PM - Late Dinner</option>
                </select>
              </div>
              
              {/* Guests Field */}
              <div className="form-group">
                <label htmlFor="guests">
                  <Users className="inline h-4 w-4 mr-2" />
                  Number of Guests *
                </label>
                <select
                  id="guests"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Special Requests */}
            <div className="form-group">
              <label htmlFor="notes">Special Requests</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Any dietary restrictions, allergies, special occasions, or seating preferences..."
                disabled={isSubmitting}
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
            </button>
            
            <p className="form-note">
              You'll receive a confirmation email within 24 hours. For same-day reservations, please call us directly.
            </p>
          </form>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="reservation-success">
          <div className="success-icon">✓</div>
          <h3>Reservation Confirmed!</h3>
          <p>
            Thank you, <strong>{formData.name}</strong>! Your table for {formData.guests} 
            {formData.guests === '1' ? ' person' : ' people'} on {formData.date} at {formData.time} has been reserved.
          </p>
          <p>A confirmation email has been sent to {formData.email}.</p>
          <div className="success-buttons">
            <Button onClick={() => setModalOpen(false)}>Close</Button>
            <Button 
              variant="outline" 
              onClick={() => window.print()}
            >
              Print Details
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default ReservationForm;