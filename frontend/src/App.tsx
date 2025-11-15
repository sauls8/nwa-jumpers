import { useState } from 'react';
import './App.css';
import CategoriesPage from './components/CategoriesPage';
import InflatablesPage from './components/InflatablesPage';
import BookingForm from './components/BookingForm';
import AdminBookingsPage from './components/AdminBookingsPage';
import QuotePage from './components/QuotePage';
import type { Inflatable } from './data/inflatables';
import type { CartItem } from './types/cart';

type AppPage = 'categories' | 'inflatables' | 'booking' | 'admin' | 'quote';

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedInflatable, setSelectedInflatable] = useState<Inflatable | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

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

  const handleNavigateToAdmin = () => {
    setCurrentPage('admin');
  };

  const handleBackFromAdmin = () => {
    handleBackToCategories();
  };

  const handleAddToCart = (cartItem: CartItem) => {
    setCart(prev => [...prev, cartItem]);
  };

  const handleProceedToCheckout = () => {
    setCurrentPage('quote');
  };

  const handleMakeAnotherBooking = () => {
    setCurrentPage('categories');
    setSelectedCategory('');
    setSelectedInflatable(null);
  };

  const handleClearCart = () => {
    setCart([]);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-top">
          <div className="app-title">
            <h1>🎪 NWA Jumpers</h1>
            <p>Bounce House Rentals</p>
          </div>
          <div className="header-actions">
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
            {currentPage === 'admin' ? (
              <button 
                className="back-button"
                onClick={handleBackFromAdmin}
              >
                ← Back to Customer View
              </button>
            ) : (
              <>
                {cart.length > 0 && (
                  <button 
                    className="cart-badge"
                    onClick={handleProceedToCheckout}
                    title="View cart"
                  >
                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                  </button>
                )}
                <button 
                  className="admin-button"
                  onClick={handleNavigateToAdmin}
                >
                  Admin Dashboard
                </button>
              </>
            )}
          </div>
        </div>
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
            onAddToCart={handleAddToCart}
            onProceedToCheckout={handleProceedToCheckout}
            onMakeAnotherBooking={handleMakeAnotherBooking}
          />
        )}
        {currentPage === 'quote' && (
          <QuotePage 
            cart={cart}
            onBackToCategories={handleBackToCategories}
            onClearCart={handleClearCart}
          />
        )}
        {currentPage === 'admin' && (
          <AdminBookingsPage onBack={handleBackFromAdmin} />
        )}
      </main>
    </div>
  );
}

export default App;