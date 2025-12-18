# Fraud Check: Test Your Knowledge

Answer these questions to prove you actually understand your project. Be honest - if you can't answer them, you need to review the codebase!

---

## 🏗️ Architecture Questions

### 1. **What happens when a user first opens your app?**
- Which component renders first?
- What API calls are made on initial load?
- What data is stored in state vs localStorage?

**Answer Key:**
- `App.tsx` renders first with `currentPage='categories'`
- `CategoriesPage` shows immediately
- No API calls on initial load - inflatables are hardcoded in `inflatables.ts`
- State: `currentPage`, `selectedCategory`, `cart`, `customerInfo`, `eventInfo`
- localStorage: Form draft data (if exists) from previous session

---

### 2. **Walk me through the booking flow from start to finish.**
1. User clicks a category → what happens?
2. User selects an inflatable → what state changes?
3. User fills out form → where is data stored?
4. User clicks "Add to Cart" → what happens?
5. User submits quote → what API call is made?

**Answer Key:**
1. `handleCategorySelect()` → sets `selectedCategory` → navigates to `inflatables` page
2. `handleInflatableSelect()` → sets `selectedInflatable` → navigates to `booking` page
3. Form data saved to localStorage in real-time via `useEffect`
4. `handleAddToCart()` → adds `CartItem` to `cart` array → locks `eventInfo` for all items
5. `submitQuote()` in `bookingService.ts` → POST to `/api/bookings/quote` → saves to SQLite

---

### 3. **Why do you have TWO database tables (`bookings` and `booking_items`)?**
- What's the relationship?
- Why not just store items as JSON in the bookings table?

**Answer Key:**
- Normalized database design - one booking can have multiple items
- Foreign key relationship: `booking_items.booking_id` → `bookings.id`
- Allows querying/editing individual items
- Better for reporting, searching, and data integrity
- JSON would work but harder to query/filter items

---

## 🔄 Data Flow Questions

### 4. **How does availability checking work?**
- Where is it checked?
- What API endpoint is called?
- What data structure is returned?

**Answer Key:**
- Calendar component calls `checkDateAvailability()` from `availabilityService.ts`
- GET request to `/api/bookings/availability/:date?inflatable=type`
- Returns: `{ date, isAvailable: boolean, bookingsCount: number, message: string }`
- Frontend marks dates as unavailable based on response

---

### 5. **Explain your cart system.**
- Where is cart data stored?
- How do you prevent duplicate items?
- What happens to event date/time when adding multiple items?

**Answer Key:**
- Cart stored in React state (`cart` array in `App.tsx`)
- Each item has unique `id` generated when added
- Event date/time locked on first item added - all items share same event info
- Stored in `eventInfo` state (separate from cart items)
- Can remove items individually with `handleRemoveFromCart()`

---

### 6. **How does form persistence work?**
- When is data saved?
- When is data loaded?
- What happens if localStorage is full/blocked?

**Answer Key:**
- Saved automatically via `useEffect` hook whenever form fields change
- Loaded on component mount if `!isEventLocked && !customerInfo`
- Error caught in try/catch - form just doesn't persist (graceful degradation)
- Only saves if event isn't locked (i.e., not already in cart)

---

## 🛠️ Implementation Details

### 7. **How does PDF generation work?**
- What library do you use?
- Where does it run (frontend or backend)?
- Why can't you generate PDFs in the browser?

**Answer Key:**
- Uses `pdfkit` library (Node.js package)
- Runs on **backend only** (`/api/bookings/:id/pdf` endpoint)
- Browsers can't securely access file system or use Node.js packages
- Server generates PDF, streams it as binary response
- Frontend downloads it as file

---

### 8. **What's the difference between `/api/bookings` and `/api/bookings/quote` endpoints?**
- When would you use each?
- What data do they accept?

**Answer Key:**
- `/api/bookings` - Simple booking (single item, basic fields)
- `/api/bookings/quote` - Full quote with multiple items, pricing, discounts
- Quote endpoint accepts `items` array, calculates totals, handles complex pricing
- Regular booking is simpler/legacy endpoint

---

### 9. **How does TypeScript help in this project?**
- Give 3 examples of type safety catching bugs
- What types did you create yourself?

**Answer Key:**
- Catches: undefined values, wrong data types, missing required fields
- Custom types: `CartItem`, `CustomerInfo`, `EventInfo`, `QuoteInfo`, `Booking`, `BookingItem`
- TypeScript ensures API responses match expected structure
- Prevents runtime errors from wrong prop types

---

## 🐛 Troubleshooting Questions

### 10. **A user says they can't add items to cart. What do you check?**
List the debugging steps:

**Answer Key:**
1. Check browser console for JavaScript errors
2. Verify `selectedInflatable` is not null
3. Check if `handleAddToCart` is being called
4. Verify `cart` state is updating (React DevTools)
5. Check if form validation is blocking submission
6. Verify event date/time is filled out
7. Check network tab for API errors
8. Check localStorage quota/availability

---

### 11. **The calendar shows a date as available, but admin says it's booked. What's wrong?**
Possible causes:

**Answer Key:**
- Availability check might be checking specific inflatable type, but booking exists for different type
- Date format mismatch (ISO vs local format)
- Race condition - booking created after calendar loaded
- Cache issue - frontend showing stale availability data
- Database query might not be filtering correctly
- Time zone issues

---

### 12. **How do you handle errors when the Node.js backend is down?**
- What happens when API calls fail?
- How does the frontend respond?

**Answer Key:**
- `bookingService.ts` uses try/catch blocks
- Shows error message to user (doesn't crash)
- Network errors caught in catch block
- Error boundaries could catch React errors (if implemented)
- Frontend continues to work (can browse, fill forms)
- Just can't submit/fetch bookings

---

## 💾 Database Questions

### 13. **What's stored in the `bookings` table vs `booking_items` table?**

**Answer Key:**
- `bookings`: Customer info, event details, pricing totals, payment info
- `booking_items`: Individual products (name, quantity, price per item)
- One booking → many items (one-to-many relationship)
- `bounce_house_type` in bookings is legacy/fallback field

---

### 14. **Why use SQLite instead of PostgreSQL or MySQL?**
- What are the trade-offs?
- When would you migrate?

**Answer Key:**
- SQLite: No server needed, file-based, perfect for MVP/development
- Trade-offs: Single writer, no concurrent access, limited scalability
- Would migrate to PostgreSQL for: multiple admins, high traffic, concurrent bookings, better query performance

---

## 🎨 Frontend Questions

### 15. **How does your routing work?**
- Do you use React Router?
- How do you navigate between pages?

**Answer Key:**
- **No React Router!** Uses state-based navigation
- `currentPage` state in `App.tsx` determines which component renders
- Simple conditional rendering: `{currentPage === 'categories' && <CategoriesPage />}`
- URL doesn't change (not using browser history)
- Pro: Simple, no routing library needed
- Con: Can't bookmark specific pages, no back button support

---

### 16. **Explain your pricing calculation logic.**
- Where are discounts calculated?
- What triggers different discount percentages?

**Answer Key:**
- Calculated in `QuotePage.tsx` component
- Discounts: 10% multiple items, 15% $1,200+, 20% $2,000+
- Fees: Surface type fee, overnight pickup fee
- Tax: 10% Arkansas tax on subtotal
- Calculated client-side before sending to backend

---

## 🔒 Security & Best Practices

### 17. **What security measures do you have?**
- How is data validated?
- Where are API keys stored?
- What about authentication?

**Answer Key:**
- Input validation: Email regex, required field checks (frontend + backend)
- SQL injection prevention: Parameterized queries (SQLite bindings)
- CORS: Configured to allow only specific frontend URL
- Environment variables: `.env` files for config (not in git)
- **No authentication** - admin page is public (security gap!)
- No API rate limiting (potential issue)

---

### 18. **How would you add user authentication?**
- Where would you add it?
- What changes would be needed?

**Answer Key:**
- Backend: Add JWT tokens or session management
- Middleware: Protect admin routes with auth check
- Frontend: Login page, store token in localStorage/cookies
- Database: Add `users` table for admin accounts
- API: Add `/api/auth/login` endpoint
- Components: Wrap admin routes with auth guard

---

## 📊 API Questions

### 19. **List all your API endpoints and what they do.**

**Answer Key:**
1. `GET /api/health` - Server health check
2. `GET /api/bookings` - Get all bookings (admin)
3. `POST /api/bookings` - Create simple booking
4. `POST /api/bookings/quote` - Create quote with items
5. `GET /api/bookings/availability/:date` - Check date availability
6. `GET /api/bookings/by-date/:date` - Get bookings for specific date
7. `GET /api/bookings/:id` - Get single booking
8. `PUT /api/bookings/:id` - Update booking
9. `GET /api/bookings/:id/pdf` - Generate PDF

---

### 20. **What HTTP status codes do you return?**
- When do you return 400? 404? 500?

**Answer Key:**
- 200: Success (GET requests)
- 201: Created (POST requests)
- 400: Bad request (validation errors, missing fields)
- 404: Not found (booking ID doesn't exist)
- 500: Server error (database failures, unexpected errors)

---

## 🚀 Deployment Questions

### 21. **How would you deploy this to production?**
- Where would you host each part?
- What environment variables are needed?
- How do you build for production?

**Answer Key:**
- Frontend: Vercel, Netlify, or AWS S3 + CloudFront
- Backend: AWS EC2, Heroku, Railway, or DigitalOcean
- Database: Keep SQLite or migrate to managed PostgreSQL
- Environment variables:
  - Frontend: `VITE_API_BASE_URL` (production API URL)
  - Backend: `PORT`, `NODE_ENV`, `FRONTEND_URL`
- Build: `npm run build` for frontend, `npm run build` + `npm start` for backend

---

### 22. **What happens when you run `npm run dev` in each directory?**

**Answer Key:**
- `frontend/`: Vite dev server starts on port 5173, hot reload enabled
- `node-api/`: ts-node runs TypeScript directly, nodemon watches for changes, Express starts on port 3001

---

## 🎯 Design Decisions

### 23. **Why separate `frontend/` and `node-api/` directories?**
- Could you combine them?
- What are the pros/cons?

**Answer Key:**
- Separation of concerns: Frontend (browser) vs Backend (server)
- Different deployment strategies
- Different dependencies (React vs Express)
- Could combine with monorepo tools (npm workspaces, yarn workspaces)
- Pros of separation: Clear boundaries, independent scaling, team collaboration
- Cons: More files to manage, two `package.json` files

---

### 24. **Why use TypeScript instead of JavaScript?**
- What specific TypeScript features do you use?

**Answer Key:**
- Type safety catches errors before runtime
- Interfaces for API responses (`Booking`, `CartItem`)
- Type inference reduces boilerplate
- Better IDE autocomplete
- Refactoring safety
- Used: Interfaces, types, generics, optional chaining, null checking

---

## ⚡ Performance Questions

### 25. **How do you prevent double-submissions?**
- What happens if user clicks submit twice?

**Answer Key:**
- `isSubmitting` state flag in `BookingForm.tsx`
- Button disabled while `isSubmitting === true`
- Set to `true` at start of submit, `false` on success/error
- Prevents multiple API calls

---

### 26. **Are there any performance bottlenecks?**
- What would you optimize?

**Answer Key:**
- Potential issues:
  - Loading all bookings for admin page (could paginate)
  - No caching of availability checks
  - localStorage writes on every keystroke (could debounce)
  - No image optimization
- Optimizations:
  - Add pagination for bookings list
  - Cache availability checks (client-side)
  - Debounce localStorage writes
  - Lazy load components

---

## 🎓 Final Challenge

### 27. **Explain this code snippet from your project:**
```typescript
const handleAddToCart = (cartItem: CartItem, newEventInfo: EventInfo) => {
  setCart(prev => [...prev, cartItem]);
  if (!eventInfo && newEventInfo && newEventInfo.event_date && newEventInfo.event_start_time && newEventInfo.event_end_time) {
    setEventInfo(newEventInfo);
  }
};
```

**Answer Key:**
- Adds item to cart using functional state update
- Only sets `eventInfo` if it's not already set (locks date/time for all items)
- Validates that all required event fields exist before locking
- Once locked, subsequent items share the same event info
- Prevents users from mixing different event dates in one cart

---

## ✅ Scoring

**How many can you answer confidently?**

- **25-27**: You OWN this project! 🎯
- **20-24**: Solid understanding, review weak areas
- **15-19**: Decent grasp, but need deeper dive
- **10-14**: Surface level - study more!
- **<10**: You didn't build this or forgot everything 😬

---

## 💡 Pro Tip

If you can't answer these, do this:
1. Read through `App.tsx` and trace the flow
2. Follow one booking from start to database
3. Understand where data lives at each step
4. Practice explaining it out loud (rubber duck debugging)

Good luck! 🚀

