import { useState, useMemo } from 'react';
import './App.css';
import CategoriesPage from './components/CategoriesPage';
import InflatablesPage from './components/InflatablesPage';
import BookingForm from './components/BookingForm';
import AdminBookingsPage from './components/AdminBookingsPage';
import QuotePage from './components/QuotePage';
import { inflatablesData, type Inflatable } from './data/inflatables';
import type { CartItem, CustomerInfo, EventInfo } from './types/cart';

type AppPage = 'categories' | 'inflatables' | 'booking' | 'admin' | 'quote';

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedInflatable, setSelectedInflatable] = useState<Inflatable | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null); // Shared event date/time for all items
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage('inflatables');
  };

  const handleInflatableSelect = (inflatable: Inflatable) => {
    setSelectedInflatable(inflatable);
    setCurrentPage('booking');
  };

  const handleQuickBook = (inflatable: Inflatable) => {
    setSelectedInflatable(inflatable);
    setCurrentPage('booking');
    // Scroll to top of form when quick booking
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleAddToCart = (cartItem: CartItem, newEventInfo: EventInfo) => {
    setCart(prev => [...prev, cartItem]);
    // Store event info on first item, or keep existing if already set
    if (!eventInfo && newEventInfo && newEventInfo.event_date && newEventInfo.event_start_time && newEventInfo.event_end_time) {
      setEventInfo(newEventInfo);
    }
    // If eventInfo already exists, it stays locked (don't update it)
  };

  const handleSetCustomerInfo = (info: CustomerInfo) => {
    setCustomerInfo(info);
  };

  const handleClearCart = () => {
    setCart([]);
    setEventInfo(null); // Clear event info when clearing cart
  };

  const handleProceedToCheckout = () => {
    setCurrentPage('quote');
  };



  // Search functionality (Chrome-safe memoization)
  const searchResults = useMemo(() => {
    if (!searchQuery || typeof searchQuery !== 'string' || !searchQuery.trim()) {
      return [];
    }
    try {
      const query = searchQuery.toLowerCase().trim();
      if (query.length === 0) return [];
      
      return inflatablesData.filter(inflatable => {
        if (!inflatable) return false;
        try {
          return (
            (inflatable.name && inflatable.name.toLowerCase().includes(query)) ||
            (inflatable.description && inflatable.description.toLowerCase().includes(query)) ||
            (inflatable.category && inflatable.category.toLowerCase().includes(query)) ||
            (Array.isArray(inflatable.features) && inflatable.features.some(f => 
              f && typeof f === 'string' && f.toLowerCase().includes(query)
            ))
          );
        } catch {
          return false;
        }
      });
    } catch (error) {
      console.error('Error in search:', error);
      return [];
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.length > 0);
  };

  const handleSearchResultClick = (inflatable: Inflatable) => {
    try {
      if (!inflatable || !inflatable.id) {
        console.error('Invalid inflatable selected');
        return;
      }
      setSelectedInflatable(inflatable);
      setCurrentPage('booking');
      setSearchQuery('');
      setShowSearchResults(false);
    } catch (error) {
      console.error('Error handling search result click:', error);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-top">
          <div className="app-title">
            <h1>🎪 NWA Jumpers</h1>
            <p>Bounce House Rentals</p>
          </div>
          {currentPage !== 'admin' && currentPage !== 'quote' && (
            <div className="search-container">
              <input
                type="text"
                placeholder="Search inflatables..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
                onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              />
              <span className="search-icon">🔍</span>
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((inflatable) => {
                    if (!inflatable || !inflatable.id) return null;
                    return (
                      <div
                        key={inflatable.id}
                        className="search-result-item"
                        onClick={() => handleSearchResultClick(inflatable)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSearchResultClick(inflatable);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Select ${inflatable.name}`}
                      >
                        <img 
                          src={inflatable.image || ''} 
                          alt={inflatable.name || 'Inflatable'} 
                          onError={(e) => {
                            // Fallback for broken images
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=Image';
                          }}
                        />
                        <div className="search-result-info">
                          <h4>{inflatable.name || 'Unnamed Inflatable'}</h4>
                          <p>{inflatable.description || 'No description available'}</p>
                          <span className="search-result-price">
                            ${inflatable.price && typeof inflatable.price === 'number' ? inflatable.price.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {showSearchResults && searchQuery.length > 0 && searchResults.length === 0 && (
                <div className="search-results">
                  <div className="search-no-results">No inflatables found</div>
                </div>
              )}
            </div>
          )}
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
            onQuickBook={handleQuickBook}
          />
        )}
                {currentPage === 'booking' && (
                  <BookingForm 
                    selectedCategory={selectedCategory}
                    selectedInflatable={selectedInflatable}
                    customerInfo={customerInfo}
                    eventInfo={eventInfo}
                    onSetCustomerInfo={handleSetCustomerInfo}
                    onAddToCart={handleAddToCart}
                    onProceedToCheckout={handleProceedToCheckout}
                    onBackToCategories={handleBackToCategories}
                  />
                )}
                {currentPage === 'quote' && (
                  <QuotePage 
                    cart={cart}
                    customerInfo={customerInfo}
                    eventInfo={eventInfo}
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