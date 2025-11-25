import React from 'react';
import './FAQPage.css';

const FAQPage: React.FC = () => {
  const faqs = [
    {
      question: 'How far in advance should I book?',
      answer: 'We recommend booking at least 2-3 weeks in advance, especially during peak season (spring and summer). However, we can often accommodate last-minute bookings if availability allows.'
    },
    {
      question: 'What is included with the rental?',
      answer: 'All rentals include delivery, setup, and pickup. We also provide sandbags for anchoring when needed. You just need to provide a flat, clear area for setup.'
    },
    {
      question: 'What surfaces can inflatables be set up on?',
      answer: 'Inflatables can be set up on grass, concrete, asphalt, or indoor surfaces. Additional fees may apply for non-grass surfaces due to the need for sandbags and extra anchoring.'
    },
    {
      question: 'Do you require a deposit?',
      answer: 'Yes, we typically require a deposit to secure your booking. The remaining balance is due on the day of the event. Contact us for specific deposit amounts.'
    },
    {
      question: 'What happens if it rains?',
      answer: 'Safety is our top priority. If there is severe weather (rain, high winds, lightning), we may need to reschedule or cancel. We will work with you to find an alternative date.'
    },
    {
      question: 'How long is the rental period?',
      answer: 'Standard rentals are for the day of your event. We typically deliver in the morning and pick up in the evening. Overnight rentals are available for an additional fee.'
    },
    {
      question: 'Is there a weight limit?',
      answer: 'Yes, each inflatable has a recommended capacity and weight limit. This information is provided with each rental. Please ensure all users are within the specified limits for safety.'
    },
    {
      question: 'Do you provide insurance?',
      answer: 'Yes, we are fully insured and state inspected. We carry comprehensive liability insurance for your peace of mind.'
    },
    {
      question: 'Can I cancel or reschedule?',
      answer: 'Yes, cancellations and rescheduling are allowed with at least 48 hours notice. Please contact us as soon as possible if you need to make changes.'
    },
    {
      question: 'What areas do you serve?',
      answer: 'We serve Northwest Arkansas and surrounding areas. Delivery fees may apply based on distance. Contact us to confirm if we service your location.'
    }
  ];

  return (
    <div className="faq-page">
      <div className="faq-header">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about our inflatable rentals</p>
      </div>

      <div className="faq-content">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <h3 className="faq-question">{faq.question}</h3>
            <p className="faq-answer">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="faq-contact">
        <h2>Still have questions?</h2>
        <p>Contact us at <strong>(479) 696-4040</strong> or reach out through our booking form!</p>
      </div>
    </div>
  );
};

export default FAQPage;

