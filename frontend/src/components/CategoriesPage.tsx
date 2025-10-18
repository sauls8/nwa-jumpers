import React from 'react';
import './CategoriesPage.css';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

const categories: Category[] = [
  {
    id: 'castle',
    name: 'Castle',
    icon: '🏰',
    description: 'Magical castle adventures for your little prince or princess',
    color: '#8B5CF6'
  },
  {
    id: 'superhero',
    name: 'Superhero',
    icon: '🦸',
    description: 'Superhero training grounds for your little heroes',
    color: '#3B82F6'
  },
  {
    id: 'sports',
    name: 'Sports',
    icon: '🏈',
    description: 'Sports-themed fun for active kids and families',
    color: '#10B981'
  },
  {
    id: 'toddler',
    name: 'Toddler',
    icon: '👶',
    description: 'Safe and fun inflatables designed for little ones',
    color: '#F59E0B'
  },
  {
    id: 'coming-soon-1',
    name: 'Coming Soon',
    icon: '🎪',
    description: 'More amazing inflatables coming soon!',
    color: '#6B7280'
  },
  {
    id: 'coming-soon-2',
    name: 'Coming Soon',
    icon: '🎨',
    description: 'More amazing inflatables coming soon!',
    color: '#6B7280'
  },
  {
    id: 'coming-soon-3',
    name: 'Coming Soon',
    icon: '🌟',
    description: 'More amazing inflatables coming soon!',
    color: '#6B7280'
  },
  {
    id: 'coming-soon-4',
    name: 'Coming Soon',
    icon: '🎭',
    description: 'More amazing inflatables coming soon!',
    color: '#6B7280'
  }
];

interface CategoriesPageProps {
  onCategorySelect: (categoryId: string) => void;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ onCategorySelect }) => {
  const handleCategoryClick = (categoryId: string) => {
    // Only allow clicking on real categories, not coming soon ones
    if (!categoryId.startsWith('coming-soon')) {
      onCategorySelect(categoryId);
    }
  };

  return (
    <div className="categories-page">
      <div className="categories-header">
        <h1>Choose Your Adventure!</h1>
        <p>Select a category to see our amazing inflatables</p>
      </div>
      
      <div className="categories-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-card"
            style={{ '--category-color': category.color } as React.CSSProperties}
            data-coming-soon={category.id.startsWith('coming-soon')}
            onClick={() => handleCategoryClick(category.id)}
          >
            <div className="category-icon">{category.icon}</div>
            <h3 className="category-name">{category.name}</h3>
            <p className="category-description">{category.description}</p>
            <div className="category-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
