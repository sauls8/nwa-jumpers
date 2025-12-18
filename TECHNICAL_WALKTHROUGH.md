# Technical Walkthrough - NWA Jumpers

## 📁 Project Structure Deep Dive

```
nwa-jumpers/
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main router & global state
│   │   ├── components/         # Reusable UI components
│   │   │   ├── BookingForm.tsx # Order form with validation
│   │   │   ├── QuotePage.tsx   # Quote review & submission
│   │   │   ├── Calendar.tsx    # Date picker with availability
│   │   │   └── ...
│   │   ├── services/           # API communication layer
│   │   │   ├── bookingService.ts
│   │   │   ├── availabilityService.ts
│   │   │   └── adminService.ts
│   │   ├── types/              # TypeScript definitions
│   │   │   └── cart.ts
│   │   └── data/               # Static data
│   │       └── inflatables.ts
│   └── package.json
│
└── node-api/
    ├── src/
    │   ├── index.ts            # Express server setup
    │   ├── database.ts         # SQLite connection
    │   ├── routes/
    │   │   └── bookings.ts     # API endpoints
    │   └── models/
    │       └── bookingSchema.ts # Database schema
    └── package.json
```

---

## 🔄 Data Flow Architecture

### 1. Customer Booking Flow

```
User Action → Component → Service → API → Database
     ↓           ↓          ↓       ↓        ↓
  Click Item  BookingForm  submitQuote  POST /quote  INSERT booking
```

**Detailed Flow:**

1. **User selects inflatable** → `InflatablesPage.tsx`
   - Calls `onInflatableSelect(inflatable)`
   - Navigates to booking form

2. **User fills form** → `BookingForm.tsx`
   - State updates: `customerForm`, `eventData`, `selectedItems`
   - Real-time validation on each input
   - Data saved to localStorage

3. **User submits form** → `handleSubmit()`
   - Validates all fields
   - Calls `onSetCustomerInfo()` → Updates `App.tsx` state
   - Calls `onSetQuoteInfo()` → Updates `App.tsx` state
   - Calls `onAddToCart()` for each selected item → Updates cart

4. **User reviews quote** → `QuotePage.tsx`
   - Receives `cart`, `customerInfo`, `eventInfo`, `quoteInfo` as props
   - Calculates pricing with discounts/fees
   - Displays breakdown

5. **User submits quote** → `handleGenerateQuote()`
   - Calls `submitQuote()` from `bookingService.ts`
   - Transforms cart items to API format
   - POSTs to `/api/bookings/quote`
   - Backend creates booking record

---

## 🧩 Component Breakdown

### App.tsx - The Central Hub

**Responsibilities:**
- Route management (which page to show)
- Global state management (cart, customer info, event info)
- Navigation handling

**Key State:**
```typescript
const [cart, setCart] = useState<CartItem[]>([]);
const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
const [quoteInfo, setQuoteInfo] = useState<QuoteInfo | null>(null);
const [currentPage, setCurrentPage] = useState<AppPage>('categories');
```

**Key Functions:**
- `handleAddToCart()` - Adds item to cart, sets event info if first item
- `handleRemoveFromCart()` - Removes item from cart
- `handleNavClick()` - Changes current page
- `handleProceedToCheckout()` - Navigates to quote page

**Why this design:**
- Single source of truth for global state
- Easy to debug (all state in one place)
- Simple prop passing to child components

---

### BookingForm.tsx - The Order Form

**Responsibilities:**
- Collect customer information
- Collect event details
- Allow inflatable selection
- Validate inputs in real-time
- Persist form data

**Key Features:**

1. **Real-Time Validation**
```typescript
const handleCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setCustomerForm(prev => ({ ...prev, [name]: value }));
  
  // Validate immediately
  const fieldError = validateField(name, value);
  setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
};
```

2. **Data Persistence**
```typescript
// Save to localStorage on every change
useEffect(() => {
  const formData = {
    customerForm,
    eventData,
    selectedItems: Array.from(selectedItems),
    // ...
  };
  localStorage.setItem('nwa-jumpers-form-draft', JSON.stringify(formData));
}, [customerForm, eventData, selectedItems, ...]);
```

3. **Multi-Item Selection**
```typescript
const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

const handleItemToggle = (inflatableId: string) => {
  setSelectedItems(prev => {
    const newSet = new Set(prev);
    if (newSet.has(inflatableId)) {
      newSet.delete(inflatableId);
    } else {
      newSet.add(inflatableId);
    }
    return newSet;
  });
};
```

**Why this design:**
- Controlled components (React best practice)
- Validation happens on change (better UX)
- localStorage prevents data loss
- Set data structure prevents duplicates

---

### QuotePage.tsx - Quote Review

**Responsibilities:**
- Display cart items
- Calculate and display pricing
- Show customer/event information
- Submit quote to backend

**Key Features:**

1. **Automatic Pricing Calculation**
```typescript
// Base subtotal
const baseSubtotal = cart.reduce((sum, item) => sum + (item.inflatable.price || 0), 0);

// Calculate discounts
let discountPercent = 0;
if (cart.length > 1) {
  discountPercent = 10; // 10% off multiple rentals
} else if (baseSubtotal >= 2000) {
  discountPercent = 20; // 20% off $2,000+
} else if (baseSubtotal >= 1200) {
  discountPercent = 15; // 15% off $1,200+
}

const discountAmount = baseSubtotal * (discountPercent / 100);
const subtotalAfterDiscount = baseSubtotal - discountAmount;

// Add fees
let surfaceFee = 0;
if (quoteInfo.event_surface && 
    ['Concrete', 'Asphalt', 'Indoor', 'Parking Lot'].includes(quoteInfo.event_surface)) {
  surfaceFee = 30;
}

const overnightFee = quoteInfo.overnight_pickup ? 75 : 0;
const finalSubtotal = subtotalAfterDiscount + surfaceFee + overnightFee;
const tax = finalSubtotal * 0.10;
const total = finalSubtotal + tax;
```

2. **Cart Item Removal**
```typescript
<button 
  className="remove-item-btn"
  onClick={() => onRemoveFromCart(item.id)}
>
  ×
</button>
```

**Why this design:**
- Pricing logic centralized in one place
- Clear breakdown for transparency
- Easy to modify business rules

---

### bookingService.ts - API Communication

**Responsibilities:**
- Transform frontend data to API format
- Handle API calls
- Error handling
- Response transformation

**Key Pattern:**
```typescript
export const submitQuote = async (
  customerInfo: CustomerInfo,
  cartItems: CartItem[],
  quoteInfo: QuoteInfo,
  // ...
): Promise<QuoteSubmissionResponse> => {
  try {
    // 1. Validate inputs
    if (!customerInfo.customer_name || !customerInfo.customer_email) {
      throw new Error('Missing required customer information');
    }

    // 2. Transform data
    const items = cartItems.map(item => ({
      product_name: item.inflatable.name,
      product_category: item.inflatable.category || null,
      quantity: 1,
      unit_price: item.inflatable.price || 0,
      total_price: item.inflatable.price || 0
    }));

    // 3. Prepare payload
    const payload = {
      customer_name: customerInfo.customer_name.trim(),
      customer_email: customerInfo.customer_email.trim(),
      // ...
      items: items,
      subtotal_amount: subtotal,
      tax_amount: tax,
      total_amount: total
    };

    // 4. Make API call
    const response = await fetch(`${API_BASE_URL}/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // 5. Handle response
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit quote');
    }

    return await response.json();
  } catch (error) {
    // 6. Error handling
    console.error('Error submitting quote:', error);
    throw error;
  }
};
```

**Why this design:**
- Separation of concerns (components don't know about API)
- Reusable functions
- Centralized error handling
- Type-safe with TypeScript

---

## 🗄️ Database Design

### Schema Overview

**bookings table:**
- Stores customer and event information
- Includes pricing breakdown
- Tracks booking status

**booking_items table:**
- Stores individual items in a booking
- Foreign key relationship to bookings
- Allows multiple items per booking

**Why this design:**
- Normalized (no data duplication)
- Flexible (can add items without changing booking structure)
- Easy to query (join tables for full booking details)

### Key Queries

**Create Booking:**
```sql
INSERT INTO bookings (
  customer_name, customer_email, customer_phone,
  event_date, event_start_time, event_end_time,
  subtotal_amount, tax_amount, total_amount
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
```

**Get Bookings by Date:**
```sql
SELECT * FROM bookings 
WHERE event_date = ? 
ORDER BY event_start_time ASC;
```

**Get Booking with Items:**
```sql
SELECT b.*, bi.* 
FROM bookings b
LEFT JOIN booking_items bi ON b.id = bi.booking_id
WHERE b.id = ?;
```

---

## 🔐 Type Safety Patterns

### Interface Definitions

```typescript
// types/cart.ts
export interface CartItem {
  id: string;
  inflatable: Inflatable;
}

export interface CustomerInfo {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  company_name?: string;
  first_name?: string;
  // ... more fields
}

export interface QuoteInfo {
  organization_name?: string;
  event_address?: string;
  event_surface?: string;
  overnight_pickup?: boolean;
  notes?: string;
  discount_percent?: number;
}
```

**Why TypeScript:**
- Catch errors at compile time
- Better IDE autocomplete
- Self-documenting code
- Refactoring safety

---

## 🎨 Styling Architecture

### CSS Organization

- **Global styles:** `App.css`, `index.css`
- **Component styles:** Each component has its own `.css` file
- **Responsive design:** Mobile-first approach
- **Theme:** Light theme with consistent color palette

### Key Patterns

**Grid Layout:**
```css
.form-row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1.5rem;
}
```

**Responsive Design:**
```css
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
```

**Validation States:**
```css
.form-row input.valid {
  border-color: #10b981;
}

.form-row input.error {
  border-color: #ef4444;
  background-color: #fef2f2;
}
```

---

## 🚀 Performance Considerations

### Current Optimizations

1. **Component Memoization:** Could add `React.memo()` for expensive components
2. **Lazy Loading:** Could implement code splitting for routes
3. **API Caching:** Could cache availability checks
4. **Image Optimization:** Could use WebP format, lazy loading

### Future Optimizations

- Implement React Query for API state management
- Add service worker for offline support
- Implement virtual scrolling for long lists
- Add debouncing for search/filter inputs

---

## 🧪 Testing Strategy (Future)

### Unit Tests
- Component rendering
- Form validation logic
- Pricing calculations
- API service functions

### Integration Tests
- Full booking flow
- Cart management
- Form submission

### E2E Tests
- Complete user journey
- Admin workflows

---

## 📊 Error Handling Patterns

### Frontend Error Handling

```typescript
try {
  const result = await submitQuote(...);
  setSubmitStatus({ type: 'success', message: 'Quote submitted!' });
} catch (error) {
  console.error('Error:', error);
  setSubmitStatus({ 
    type: 'error', 
    message: error instanceof Error ? error.message : 'An error occurred' 
  });
}
```

### Backend Error Handling

```typescript
router.post('/quote', async (req, res) => {
  try {
    // Validate
    if (!customer_name || !customer_email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    // Process...
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});
```

---

## 🔄 State Management Flow

```
User Input
    ↓
Component State (useState)
    ↓
Validation
    ↓
Update Parent State (via props)
    ↓
App.tsx Global State
    ↓
Pass to Child Components
    ↓
Display/Submit
```

**Why this pattern:**
- Simple and predictable
- Easy to debug (state flows down, events flow up)
- No external dependencies
- Works well for this application size

---

## 📝 Code Quality Practices

### 1. **Consistent Naming**
- Components: PascalCase (`BookingForm`)
- Functions: camelCase (`handleSubmit`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Types: PascalCase (`CustomerInfo`)

### 2. **Function Organization**
- Helper functions at top
- Event handlers in middle
- useEffect hooks at bottom

### 3. **Comments**
- Complex logic explained
- Business rules documented
- TODO comments for future work

### 4. **Error Messages**
- User-friendly language
- Specific to the error
- Actionable when possible

---

## 🎯 Key Takeaways

1. **Separation of Concerns:** Components, services, and types are clearly separated
2. **Type Safety:** TypeScript throughout prevents runtime errors
3. **User Experience:** Real-time validation, loading states, data persistence
4. **Code Reusability:** Shared functions and components
5. **Maintainability:** Clear structure, consistent patterns
6. **Scalability:** Easy to add features, extend functionality

---

This technical walkthrough should help you explain any part of the codebase in detail during interviews or code reviews.

