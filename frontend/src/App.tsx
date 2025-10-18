import { useState } from 'react';
import './App.css';
import CategoriesPage from './components/CategoriesPage';
import InflatablesPage from './components/InflatablesPage';
import BookingForm from './components/BookingForm';
import type { Inflatable } from './data/inflatables';

type AppPage = 'categories' | 'inflatables' | 'booking';

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedInflatable, setSelectedInflatable] = useState<Inflatable | null>(null);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage('inflatables');
  };

  const handleInflatableSelect = (inflatable: Inflatable) => {
    setSelectedInflatable(inflatable);
    setCurrentPage('booking');
  };

  const handleBackToCategories = () => {
    setCurrentPage('categories');
    setSelectedCategory('');
    setSelectedInflatable(null);
  };

  const handleBackToInflatables = () => {
    setCurrentPage('inflatables');
    setSelectedInflatable(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎪 NWA Jumpers</h1>
        <p>Bounce House Rentals</p>
        {currentPage === 'inflatables' && (
          <button 
            className="back-button"
            onClick={handleBackToCategories}
          >
            ← Back to Categories
          </button>
        )}
        {currentPage === 'booking' && (
          <button 
            className="back-button"
            onClick={handleBackToInflatables}
          >
            ← Back to Inflatables
          </button>
        )}
      </header>
      
      <main className="app-main">
        {currentPage === 'categories' && (
          <CategoriesPage onCategorySelect={handleCategorySelect} />
        )}
        {currentPage === 'inflatables' && (
          <InflatablesPage 
            categoryId={selectedCategory}
            onInflatableSelect={handleInflatableSelect}
            onBackToCategories={handleBackToCategories}
          />
        )}
        {currentPage === 'booking' && (
          <BookingForm 
            selectedCategory={selectedCategory}
            selectedInflatable={selectedInflatable}
          />
        )}
      </main>
    </div>
  );
}

export default App;