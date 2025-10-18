import React from 'react';
import './InflatablesPage.css';
import { getInflatablesByCategory, Inflatable } from '../data/inflatables';

interface InflatablesPageProps {
  categoryId: string;
  onInflatableSelect: (inflatable: Inflatable) => void;
  onBackToCategories: () => void;
}

const InflatablesPage: React.FC<InflatablesPageProps> = ({ 
  categoryId, 
  onInflatableSelect, 
  onBackToCategories 
}) => {
  const inflatables = getInflatablesByCategory(categoryId);
  
  const getCategoryTitle = (categoryId: string): string => {
    const titles: { [key: string]: string } = {
      'castle': '🏰 Castle Adventures',
      'superhero': '🦸 Superhero Training',
      'sports': '🏈 Sports Arena',
      'toddler': '👶 Toddler Fun'
    };
    return titles[categoryId] || 'Inflatables';
  };

  const getCategoryDescription = (categoryId: string): string => {
    const descriptions: { [key: string]: string } = {
      'castle': 'Choose your royal adventure from our magical castle collection!',
      'superhero': 'Train like a superhero with our action-packed inflatables!',
      'sports': 'Get active with our sports-themed bounce houses!',
      'toddler': 'Safe and fun inflatables designed especially for little ones!'
    };
    return descriptions[categoryId] || 'Select your perfect inflatable!';
  };

  return (
    <div className="inflatables-page">
      <div className="inflatables-header">
        <button className="back-to-categories" onClick={onBackToCategories}>
          ← Back to Categories
        </button>
        <h1>{getCategoryTitle(categoryId)}</h1>
        <p>{getCategoryDescription(categoryId)}</p>
      </div>
      
      <div className="inflatables-grid">
        {inflatables.map((inflatable) => (
          <div
            key={inflatable.id}
            className="inflatable-card"
            onClick={() => onInflatableSelect(inflatable)}
          >
            <div className="inflatable-image">
              <img src={inflatable.image} alt={inflatable.name} />
              <div className="price-badge">${inflatable.price}</div>
            </div>
            
            <div className="inflatable-content">
              <h3 className="inflatable-name">{inflatable.name}</h3>
              <p className="inflatable-description">{inflatable.description}</p>
              
              <div className="inflatable-details">
                <div className="detail-item">
                  <span className="detail-label">Capacity:</span>
                  <span className="detail-value">{inflatable.capacity}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">{inflatable.dimensions}</span>
                </div>
              </div>
              
              <div className="features-list">
                {inflatable.features.map((feature, index) => (
                  <span key={index} className="feature-tag">
                    {feature}
                  </span>
                ))}
              </div>
              
              <div className="select-button">
                Select This Inflatable →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InflatablesPage;
