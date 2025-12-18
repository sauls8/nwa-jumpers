import React from 'react';
import './InflatablesPage.css';
import type { Inflatable } from '../services/inventoryService';
import { useInflatablesByCategory } from '../hooks/useInflatables';

interface InflatablesPageProps {
  categoryId: string;
  onInflatableSelect: (inflatable: Inflatable) => void;
  onBackToCategories: () => void;
  onQuickBook?: (inflatable: Inflatable) => void;
}

// Helper function to format dimensions from "15ft x 15ft x 12ft" to "W15' L15' H12'"
const formatDimensions = (dimensions: string): string => {
  if (!dimensions) return 'N/A';
  
  // Try to parse format like "15ft x 15ft x 12ft" or "15ft x 15ft x 12ft"
  const match = dimensions.match(/(\d+)\s*ft\s*x\s*(\d+)\s*ft\s*x\s*(\d+)\s*ft/i);
  if (match) {
    const [, width, length, height] = match;
    return `W${width}' L${length}' H${height}'`;
  }
  
  // Try to parse format like "15' x 15' x 12'"
  const match2 = dimensions.match(/(\d+)\s*'\s*x\s*(\d+)\s*'\s*x\s*(\d+)\s*'/i);
  if (match2) {
    const [, width, length, height] = match2;
    return `W${width}' L${length}' H${height}'`;
  }
  
  // If no match, return original
  return dimensions;
};

const InflatablesPage: React.FC<InflatablesPageProps> = ({ 
  categoryId, 
  onInflatableSelect, 
  onBackToCategories,
  onQuickBook
}) => {
  const { inflatables, loading, error } = useInflatablesByCategory(categoryId);
  
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
      
      {loading && (
        <div className="loading-message">Loading inflatables...</div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => window.location.reload()} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>
            Retry
          </button>
        </div>
      )}
      
      {!loading && !error && inflatables.length === 0 && (
        <div className="empty-message">No inflatables found in this category.</div>
      )}
      
      {!loading && !error && inflatables.length > 0 && (
        <div className="inflatables-grid">
          {inflatables.map((inflatable: Inflatable) => (
            <div
              key={inflatable.id}
              className="inflatable-card"
              onClick={() => onInflatableSelect(inflatable)}
            >
              <div className="inflatable-image">
                {inflatable.image ? (
                  <img src={inflatable.image} alt={inflatable.name} />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    background: '#f3f4f6', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#9ca3af'
                  }}>
                    No Image
                  </div>
                )}
                <div className="price-badge">${inflatable.price}</div>
              </div>
              
              <div className="inflatable-content">
                <h3 className="inflatable-name">{inflatable.name}</h3>
                {inflatable.dimensions && (
                  <div className="inflatable-dimensions">
                    {formatDimensions(inflatable.dimensions)}
                  </div>
                )}
                <div className="inflatable-price-display">
                  ${inflatable.price.toFixed(0)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InflatablesPage;
