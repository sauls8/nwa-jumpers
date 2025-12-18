import { useState, useMemo } from 'react';
import './App.css';
import CategoriesPage from './components/CategoriesPage';
import InflatablesPage from './components/InflatablesPage';
import BookingForm from './components/BookingForm';
import AdminBookingsPage from './components/AdminBookingsPage';
import AdminInventoryPage from './components/AdminInventoryPage';
import QuotePage from './components/QuotePage';
import FAQPage from './components/FAQPage';
import type { Inflatable } from './services/inventoryService';
import type { CartItem, CustomerInfo, EventInfo, QuoteInfo } from './types/cart';
import { useInflatables } from './hooks/useInflatables';

type AppPage = 'categories' | 'inflatables' | 'booking' | 'admin' | 'inventory' | 'quote' | 'faq';

function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedInflatable, setSelectedInflatable] = useState<Inflatable | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null); // Shared event date/time for all items
  const [quoteInfo, setQuoteInfo] = useState<QuoteInfo | null>(null); // Order form data (surface, notes, overnight, etc.)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch inflatables for search functionality
  const { inflatables: allInflatables } = useInflatables();

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

  const handleNavigateToInventory = () => {
    setCurrentPage('inventory');
  };

  const handleBackFromInventory = () => {
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

  const handleSetQuoteInfo = (info: QuoteInfo) => {
    setQuoteInfo(info);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    // If cart becomes empty, clear event info
    if (cart.length === 1) {
      setEventInfo(null);
      setQuoteInfo(null);
    }
  };

  const handleClearCart = () => {
    setCart([]);
    setEventInfo(null); // Clear event info when clearing cart
    setQuoteInfo(null); // Clear quote info when clearing cart
  };

  // Calculate cart total for header display
  const cartTotal = cart.reduce((sum, item) => sum + (item.inflatable.price || 0), 0);

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
      
      return allInflatables.filter(inflatable => {
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
  }, [searchQuery, allInflatables]);

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

  const handleNavClick = (page: AppPage) => {
    if (page === 'categories') {
      handleBackToCategories();
    } else if (page === 'inflatables') {
      // If we have a selected category, show that category's inflatables
      // Otherwise, go to categories first
      if (selectedCategory) {
        setCurrentPage('inflatables');
      } else {
        setCurrentPage('categories');
      }
    } else if (page === 'booking') {
      // "BOOK IT" - if we have items in cart, go to quote, otherwise go to booking
      if (cart.length > 0) {
        setCurrentPage('quote');
      } else if (selectedInflatable) {
        setCurrentPage('booking');
      } else {
        // No item selected, go to categories to select one
        setCurrentPage('categories');
      }
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <nav className="main-navigation">
          <button 
            className={`nav-link ${currentPage === 'categories' ? 'active' : ''}`}
            onClick={() => handleNavClick('categories')}
          >
            HOME
          </button>
          <button 
            className={`nav-link ${currentPage === 'inflatables' ? 'active' : ''}`}
            onClick={() => handleNavClick('inflatables')}
          >
            INFLATABLES
          </button>
          <button 
            className={`nav-link ${currentPage === 'faq' ? 'active' : ''}`}
            onClick={() => setCurrentPage('faq')}
          >
            FAQ
          </button>
          <button 
            className={`nav-link ${currentPage === 'quote' || currentPage === 'booking' ? 'active' : ''}`}
            onClick={() => handleNavClick('booking')}
          >
            BOOK IT
          </button>
          <button 
            className={`nav-link ${currentPage === 'admin' || currentPage === 'inventory' ? 'active' : ''}`}
            onClick={() => handleNavigateToAdmin()}
          >
            ADMIN
          </button>
          {currentPage === 'admin' && (
            <button 
              className="back-button admin-only"
              onClick={handleBackFromAdmin}
            >
              ← Back to Customer View
            </button>
          )}
          {/* Cart indicator with total */}
          {cart.length > 0 && currentPage !== 'admin' && currentPage !== 'quote' && (
            <div className="cart-indicator" onClick={handleProceedToCheckout}>
              <span className="cart-count">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
              <span className="cart-total">${cartTotal.toFixed(2)}</span>
            </div>
          )}
        </nav>
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
                    onSetQuoteInfo={handleSetQuoteInfo}
                    onProceedToCheckout={handleProceedToCheckout}
                    onBackToCategories={handleBackToCategories}
                  />
                )}
                {currentPage === 'quote' && (
                  <QuotePage 
                    cart={cart}
                    customerInfo={customerInfo}
                    eventInfo={eventInfo}
                    quoteInfo={quoteInfo}
                    onRemoveFromCart={handleRemoveFromCart}
                    onBackToCategories={handleBackToCategories}
                    onClearCart={handleClearCart}
                  />
                )}
        {currentPage === 'admin' && (
          <AdminBookingsPage 
            onBack={handleBackFromAdmin}
            onNavigateToInventory={handleNavigateToInventory}
          />
        )}
        {currentPage === 'inventory' && (
          <AdminInventoryPage onBack={handleBackFromInventory} />
        )}
        {currentPage === 'faq' && (
          <FAQPage />
        )}
      </main>
    </div>
  );
}

export default App;