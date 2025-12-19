import React from 'react';
import { Star, Quote } from 'lucide-react';
import './Testimonials.css';

const testimonials = [
  {
    id: 1,
    text: "The best Italian food I've had outside of Italy! The pasta is perfectly al dente and the sauces are incredible. My family and I come here every Friday night!",
    author: "Michael Rossi",
    role: "Regular Customer",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 2,
    text: "Aunt Joy's has become our family's favorite restaurant. The atmosphere is warm and the staff feels like family. The lasagna is to die for!",
    author: "Sarah Johnson",
    role: "Food Blogger",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 3,
    text: "As an Italian expat, this restaurant makes me feel at home. Authentic flavors and traditional recipes done right. The tiramisu tastes just like my nonna's!",
    author: "Marco Bianchi",
    role: "Italian Chef",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 4,
    text: "Perfect for business lunches and family dinners alike. The service is impeccable and the wine selection is excellent. Highly recommend!",
    author: "Jennifer Lee",
    role: "Business Owner",
    rating: 5,
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 5,
    text: "The portions are generous and everything tastes fresh. The pizza crust is perfectly crispy and the ingredients are top quality. Will definitely be back!",
    author: "David Chen",
    role: "Food Critic",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507591064344-4c6ce005-128?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 6,
    text: "Wonderful ambiance, delicious food, and friendly staff. We celebrated our anniversary here and they made it extra special. Thank you Aunt Joy's!",
    author: "Amanda Wilson",
    role: "Happy Customer",
    rating: 5,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-primary-100 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Star className="h-4 w-4 mr-2" fill="currentColor" />
            Customer Reviews
          </div>
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">
            Don't just take our word for it - hear from our satisfied guests
          </p>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-content">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-4 w-4 text-yellow-400 mr-1" 
                      fill={i < testimonial.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                
                <Quote className="h-8 w-8 text-primary-200 mb-4" />
                
                <p className="testimonial-text">
                  "{testimonial.text}"
                </p>
                
                <div className="testimonial-author">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.author}
                    className="author-image"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23f3f4f6"><circle cx="50" cy="50" r="50"/></svg>';
                    }}
                  />
                  <div className="author-info">
                    <h4>{testimonial.author}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;