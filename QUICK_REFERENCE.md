# Quick Reference Card - NWA Jumpers

## 🎯 Elevator Pitch (30 seconds)
"I built a full-stack booking system for a bounce house rental business. React frontend, Node.js backend. Customers browse inflatables, check availability, create multi-item bookings with automatic pricing. Admin dashboard for managing bookings and generating PDFs. Focused on UX: real-time validation, cart management, data persistence."

---

## 📊 Project Stats
- **Type:** Full-stack web application
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite3
- **Key Files:** App.tsx, BookingForm.tsx, QuotePage.tsx, bookingService.ts

---

## 🔑 Key Features to Mention
1. ✅ Real-time form validation
2. ✅ Cart management (remove items, running total)
3. ✅ Loading states (prevent double-submission)
4. ✅ Form data persistence (localStorage)
5. ✅ Automatic pricing (discounts + fees)
6. ✅ Multi-item bookings
7. ✅ Admin dashboard
8. ✅ PDF generation

---

## 💻 Tech Stack Quick Facts
- **React:** Component-based UI, hooks (useState, useEffect)
- **TypeScript:** Full type safety, interfaces, type inference
- **Node.js/Express:** RESTful API, middleware, error handling
- **SQLite:** File-based, easy setup, normalized schema
- **CSS:** Custom styling, responsive design, validation states

---

## 🔄 User Flow (Simple)
1. Browse categories → 2. Select inflatables → 3. Fill form → 4. Review quote → 5. Submit

---

## 🎨 UX Improvements (What to Highlight)
- **Real-time validation:** Errors show as you type, checkmarks for valid fields
- **Cart management:** Remove items, see total in header
- **Loading states:** Button disabled during submission
- **Data persistence:** Form saves automatically
- **Auto-pricing:** Discounts and fees calculated automatically

---

## 🗂️ Code Structure
```
frontend/src/
├── App.tsx              # Router + global state
├── components/          # UI components
│   ├── BookingForm.tsx # Order form
│   └── QuotePage.tsx   # Quote review
├── services/           # API calls
│   └── bookingService.ts
└── types/              # TypeScript types

node-api/src/
├── index.ts           # Server setup
├── routes/
│   └── bookings.ts    # API endpoints
└── models/
    └── bookingSchema.ts # Database schema
```

---

## 💡 Key Technical Decisions
1. **State Management:** useState + prop drilling (simple, no deps)
2. **Validation:** Real-time on input change (better UX)
3. **API Pattern:** Service layer (separation of concerns)
4. **Database:** Normalized schema (bookings + booking_items)
5. **TypeScript:** Full type safety throughout

---

## ❓ Common Questions & Quick Answers

**Q: Why React?**  
A: Industry standard, component-based, great ecosystem

**Q: Why TypeScript?**  
A: Type safety, catch errors early, better IDE support

**Q: Why SQLite?**  
A: Easy setup for MVP, schema ready for PostgreSQL migration

**Q: Biggest challenge?**  
A: Automatic pricing calculations - solved with centralized function

**Q: How to improve?**  
A: Email notifications, payment processing, customer accounts, testing

---

## 🎬 Demo Checklist
- [ ] Show categories page
- [ ] Fill form (show validation)
- [ ] Add multiple items
- [ ] Show quote with pricing
- [ ] Remove item from cart
- [ ] Show code (App.tsx, BookingForm.tsx)
- [ ] Show admin dashboard

---

## 📝 Key Code Locations
- **State Management:** `App.tsx` lines 14-21
- **Form Validation:** `BookingForm.tsx` lines 102-131
- **Pricing Logic:** `QuotePage.tsx` lines 36-70
- **API Calls:** `bookingService.ts` lines 20-100
- **Database Schema:** `bookingSchema.ts`

---

## 🎯 What Makes This Stand Out
1. ✅ Complete full-stack application
2. ✅ Production-ready UX features
3. ✅ Clean, maintainable code
4. ✅ TypeScript throughout
5. ✅ Real business application

---

## 📚 Documentation Files
- **PROJECT_EXPLANATION.md** - How to explain the project
- **TECHNICAL_WALKTHROUGH.md** - Deep dive into code
- **INTERVIEW_PREP.md** - Interview questions & answers
- **README.md** - Setup and technical details
- **QUICK_START.md** - Deployment guide

---

**Remember:** Be confident, show enthusiasm, connect features to business value!

