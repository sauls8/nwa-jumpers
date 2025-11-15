# UX Testing Checklist - NWA Jumpers

## 🚀 Servers Running
- ✅ Backend: http://localhost:3001
- ✅ Frontend: http://localhost:5173

## 📋 Customer Flow Testing

### 1. Homepage / Categories Page
- [ ] Page loads correctly
- [ ] All 4 categories display (Castle, Superhero, Sports, Toddler)
- [ ] "Coming Soon" categories are visible but not clickable
- [ ] Category cards are clickable
- [ ] Hover effects work
- [ ] Mobile responsive (resize browser)

### 2. Inflatables Page
- [ ] Clicking a category shows inflatables for that category
- [ ] Back button works
- [ ] Inflatable cards display:
  - [ ] Image
  - [ ] Name
  - [ ] Price
  - [ ] Description
  - [ ] Capacity
  - [ ] Dimensions
  - [ ] Features
- [ ] Clicking an inflatable card works
- [ ] Mobile responsive

### 3. Booking Form
- [ ] Selected inflatable name pre-fills
- [ ] All form fields present:
  - [ ] Full Name
  - [ ] Email
  - [ ] Phone
  - [ ] Event Date (calendar picker)
  - [ ] Event Start Time
  - [ ] Event End Time
- [ ] Calendar opens when clicking date field
- [ ] Calendar shows availability (red = booked, green = available)
- [ ] Can select date from calendar
- [ ] Form validation works:
  - [ ] Required fields show error if empty
  - [ ] Email format validation
  - [ ] All fields required before submit
- [ ] Submit button shows loading state
- [ ] Success message displays after booking
- [ ] "Make Another Booking" button works
- [ ] Mobile responsive

### 4. Calendar Functionality
- [ ] Calendar displays current month
- [ ] Can navigate to next/previous month
- [ ] Dates show correct availability colors
- [ ] Can click available dates
- [ ] Past dates are disabled or marked
- [ ] Selected date highlights

## 🔧 Admin Flow Testing

### 5. Admin Dashboard Access
- [ ] "Admin Dashboard" button/link visible
- [ ] Can navigate to admin view
- [ ] Back button works

### 6. Admin Bookings View
- [ ] Date picker displays
- [ ] Can select a date
- [ ] Bookings for selected date load
- [ ] Booking cards show:
  - [ ] Customer name
  - [ ] Event date
  - [ ] Event time
  - [ ] Bounce house type
  - [ ] Contact info
- [ ] "Download PDF" button works
- [ ] PDF downloads successfully
- [ ] Can edit bookings (if implemented)
- [ ] Empty state shows when no bookings

### 7. Admin Booking Editor (if implemented)
- [ ] Can open booking details
- [ ] All fields are editable
- [ ] Save changes works
- [ ] Validation works

## 🐛 Error Handling

### 8. Network Errors
- [ ] What happens if backend is down?
- [ ] Error messages display clearly
- [ ] User can retry

### 9. Form Errors
- [ ] Validation errors are clear
- [ ] Error messages are helpful
- [ ] Can correct errors and resubmit

### 10. Empty States
- [ ] No bookings message shows
- [ ] No inflatables message (if applicable)
- [ ] Messages are user-friendly

## 📱 Mobile Testing

### 11. Mobile Responsiveness
- [ ] Categories page works on mobile
- [ ] Inflatables page works on mobile
- [ ] Booking form is usable on mobile
- [ ] Calendar is usable on mobile
- [ ] Admin dashboard works on mobile
- [ ] Text is readable
- [ ] Buttons are tappable
- [ ] No horizontal scrolling

## ⚡ Performance

### 12. Loading States
- [ ] Loading indicators show during API calls
- [ ] Page doesn't freeze
- [ ] Images load reasonably fast

## 🎨 Visual/Design

### 13. Visual Consistency
- [ ] Colors are consistent
- [ ] Fonts are readable
- [ ] Spacing looks good
- [ ] Dark mode works (if applicable)
- [ ] Icons display correctly

## 🔄 Navigation Flow

### 14. Complete User Journey
- [ ] Start → Categories → Inflatables → Booking → Success
- [ ] Can navigate back at each step
- [ ] Can go from Admin → Customer view
- [ ] URLs update correctly (if using routing)

## 📝 Notes Section
_Use this space to jot down any issues you find:_

```
Issue 1:
Issue 2:
Issue 3:
```

## ✅ Overall Assessment

- [ ] Customer flow is smooth
- [ ] Admin flow is functional
- [ ] No major bugs
- [ ] Mobile experience is good
- [ ] Ready for inventory import
- [ ] Ready for deployment

