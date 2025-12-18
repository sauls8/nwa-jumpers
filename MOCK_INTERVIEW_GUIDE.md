# NWA Jumpers - Mock Interview Guide

## For Your Interview Buddy: How to Use This Guide

- Read the question to the candidate
- Let them answer (no hints)
- Compare their answer to the "Expected Answer"
- Use the "Scoring Guide" to evaluate
- Give feedback after each section

---

## PART 1: RECRUITER QUESTIONS (Non-Technical)

### Q1: Tell me about yourself and this project.
**Expected Answer:**
"I built NWA Jumpers as a full-stack booking system for an inflatable rental company. It's a React/TypeScript frontend with a Node.js/Express backend and SQLite database. Users can browse inflatables, check availability, create quotes with multiple items, and admins can manage bookings through a dashboard. I built this to demonstrate my full-stack capabilities and to solve a real business problem."

**Scoring:**
- ✅ Mentions tech stack (React, Node.js, TypeScript)
- ✅ Explains the problem it solves
- ✅ Shows personal motivation/learning
- ❌ Too vague or doesn't mention technologies

---

### Q2: Why did you choose to build this project?
**Expected Answer:**
"I wanted to build something that demonstrates full-stack development skills - frontend UI/UX, backend API design, database design, and the integration between them. I also wanted to work on a real business problem rather than just a tutorial project. This gave me experience with the entire software development lifecycle from planning to deployment."

**Scoring:**
- ✅ Shows learning mindset
- ✅ Mentions full-stack experience
- ✅ Connects to real-world application
- ❌ Just says "it seemed interesting"

---

### Q3: What was your biggest challenge and how did you overcome it?
**Expected Answer:**
"Implementing the single quote system with multiple items was challenging. Initially, each booking was separate, meaning users had to re-enter information multiple times. I refactored the database schema to use a one-to-many relationship - a bookings table linked to a booking_items table. I also restructured the frontend state management to separate customer info from cart items, ensuring data consistency through database transactions."

**Scoring:**
- ✅ Specific technical challenge
- ✅ Clear solution explained
- ✅ Shows problem-solving process
- ❌ Generic answer like "debugging was hard"

---

### Q4: What would you do differently if you started over?
**Expected Answer:**
"I'd implement authentication from the start - currently the admin dashboard i
s open. I'd also use PostgreSQL instead of SQLite for better scalability, and I'd add automated testing with Jest/Vitest. I'd also set up CI/CD pipelines earlier to automate deployment. The current structure is solid for an MVP, but these would be essential for production."

**Scoring:**
- ✅ Shows understanding of production needs
- ✅ Identifies specific improvements
- ✅ Shows growth mindset
- ❌ Too critical of own work

---

### Q5: How long did this take you?
**Expected Answer:**
"I worked on this iteratively over several weeks, focusing on core features first - the booking flow, calendar, and quote generation. Then I added admin features and UX improvements. Total development time was probably around 40-50 hours of focused coding, plus time for planning and testing. I prioritized getting a working MVP first, then iteratively improved the user experience."

**Scoring:**
- ✅ Realistic time estimate
- ✅ Shows iterative approach
- ✅ Mentions MVP mindset
- ❌ Unrealistic (too short or too long)

---

## PART 2: TECHNICAL MANAGER QUESTIONS (Technical Depth)

### Q6: Walk me through your tech stack. Why React and Node.js?
**Expected Answer:**
"I chose React because it's component-based, which made it easy to build reusable UI elements like the calendar, booking form, and inflatable cards. The virtual DOM provides good performance for dynamic UIs. TypeScript adds type safety, catching errors during development.

Node.js was natural because it shares JavaScript with the frontend, allowing me to work in one language across the stack. Express is minimal and perfect for REST APIs. I used SQLite for the MVP since it's file-based and requires no setup, but I'd migrate to PostgreSQL for production for better concurrent access and features."

**Scoring:**
- ✅ Explains React component architecture
- ✅ Mentions TypeScript benefits
- ✅ Justifies Node.js choice
- ✅ Shows awareness of production needs
- ❌ Just lists technologies without reasoning

---

### Q7: How does your API handle a booking request from start to finish?
**Expected Answer:**
"When a user submits a booking, the React frontend makes a POST request to `/api/bookings/quote` with customer data, event details, and an array of items. The Express server receives this, validates the data server-side - checking required fields and email format.

The backend then performs a database transaction: first inserts into the `bookings` table, then for each item, inserts into `booking_items` table with a foreign key linking to the booking. This ensures atomicity - either all items are saved with the booking, or nothing is saved if there's an error.

After successful insert, the server returns the booking ID. The frontend then calls `/api/bookings/:id/pdf` to generate a PDF quote using PDFKit, which streams the PDF back to the client."

**Scoring:**
- ✅ Mentions specific endpoint
- ✅ Explains validation
- ✅ Discusses transactions and atomicity
- ✅ Describes PDF generation
- ❌ Skips important steps or technical details

---

### Q8: Explain your database schema and why you structured it this way.
**Expected Answer:**
"I have two main tables: `bookings` and `booking_items` with a one-to-many relationship. The `bookings` table stores customer information, event details, pricing totals, and admin fields. The `booking_items` table stores individual inflatables within a booking, linked via `booking_id` foreign key with CASCADE delete.

This normalization prevents data duplication - customer info isn't repeated for each item. It also allows flexible queries - I can easily get all items for a booking, or calculate totals. The foreign key ensures referential integrity, and CASCADE delete means deleting a booking automatically removes its items.

For an MVP, this structure is perfect. For production, I'd add indexes on frequently queried fields like `event_date` and `customer_email` for better performance."

**Scoring:**
- ✅ Explains normalization
- ✅ Mentions foreign keys and relationships
- ✅ Discusses CASCADE delete
- ✅ Shows awareness of indexing
- ❌ Doesn't explain design decisions

---

### Q9: How does your calendar availability checking work?
**Expected Answer:**
"The calendar component makes async API calls to `/api/bookings/availability/:date` for each date in the visible month. It passes an optional `inflatable` query parameter if a specific inflatable is selected.

The backend queries the database checking if bookings exist for that date and inflatable type. It returns `isAvailable: true/false` and `bookingsCount`. The frontend then visually updates - available dates show green/blue, booked dates show red.

I implemented this asynchronously so the calendar renders immediately, then availability indicators appear as API calls complete. I also added error handling to default to available if the API call fails, so users aren't blocked from booking."

**Scoring:**
- ✅ Mentions specific endpoint
- ✅ Explains async nature
- ✅ Discusses error handling
- ✅ Describes user experience considerations
- ❌ Doesn't mention async or error handling

---

### Q10: How would you handle concurrent bookings? (Two users booking same item at same time)
**Expected Answer:**
"Currently, the app doesn't have race condition protection, which is a limitation. In production, I'd implement database-level locking or optimistic concurrency control.

For optimistic locking, I'd add a `version` column to the bookings table. When checking availability, I'd store the version number. During booking, I'd verify the version hasn't changed, ensuring no other booking happened between check and insert.

Alternatively, I'd use database transactions with row-level locking - when checking availability, lock those rows until the booking transaction completes. This prevents double-booking but could impact performance under high load.

A queue system or using Redis for distributed locking would be ideal for true concurrent access across multiple servers."

**Scoring:**
- ✅ Acknowledges current limitation
- ✅ Proposes realistic solutions
- ✅ Mentions optimistic vs pessimistic locking
- ✅ Shows understanding of scaling challenges
- ❌ Says "it's not a problem" or gives no solution

---

### Q11: How would you scale this to handle 10,000 bookings per day?
**Expected Answer:**
"Several changes would be needed:

**Database:** Migrate from SQLite to PostgreSQL or MySQL for better concurrent access. Add indexes on `event_date`, `customer_email`, and `booking_id`. Implement database connection pooling.

**Backend:** Move from a single Node.js server to horizontal scaling - multiple server instances behind a load balancer. Use Redis for session management and caching frequently accessed data like availability checks.

**Frontend:** Serve static assets via CDN. Implement client-side caching for inflatable data and availability checks to reduce API calls.

**Infrastructure:** Use containerization (Docker) for consistent deployments. Set up monitoring and logging (Datadog, CloudWatch). Consider serverless functions for PDF generation to offload CPU-intensive work.

**Data:** Archive old bookings to a separate table or data warehouse to keep the main table performant."

**Scoring:**
- ✅ Covers multiple areas (DB, backend, frontend, infrastructure)
- ✅ Specific technologies mentioned
- ✅ Shows understanding of bottlenecks
- ✅ Mentions monitoring and maintenance
- ❌ Only mentions one area or vague answers

---

### Q12: What testing strategies would you implement?
**Expected Answer:**
"I'd implement testing at multiple levels:

**Unit Tests:** Use Jest or Vitest to test individual functions and components in isolation. Test business logic like tax calculations, date validation, and data transformations.

**Integration Tests:** Test API endpoints with a test database. Verify that booking creation correctly inserts into both tables, that foreign key relationships work, and that transactions roll back on errors.

**E2E Tests:** Use Playwright or Cypress to test user flows - completing a booking, checking availability, downloading PDFs. This ensures the full stack works together.

**For an MVP, I'd prioritize integration tests for critical paths like booking creation, since that's the core functionality and most likely to have bugs with database interactions.**"

**Scoring:**
- ✅ Mentions multiple testing levels
- ✅ Specific tools (Jest, Playwright, etc.)
- ✅ Explains what to test at each level
- ✅ Prioritizes based on importance
- ❌ Only mentions one type of test

---

### Q13: Walk me through your state management in React.
**Expected Answer:**
"I use React's built-in `useState` and `useEffect` hooks for state management. The main `App` component manages global state like the cart, customer info, and current page. I pass state down to child components via props and pass callback functions to update state from children.

For the cart system, I store cart items and customer info in the App component's state. When a booking form submits, it calls a callback to add items to the cart. The quote page reads from the same state.

I considered Context API or Redux, but for this project's scope, prop drilling was manageable and keeps the code simpler. If the app grew to have deeply nested components or more complex state interactions, I'd refactor to Context API for better maintainability."

**Scoring:**
- ✅ Explains current approach (useState)
- ✅ Mentions prop drilling vs Context/Redux
- ✅ Justifies current choice
- ✅ Shows awareness of when to refactor
- ❌ Doesn't explain why they chose current approach

---

### Q14: What security concerns should be addressed?
**Expected Answer:**
"Several security improvements are needed for production:

**Authentication:** The admin dashboard is currently open - I'd add JWT-based authentication with secure password hashing (bcrypt).

**Input Validation:** While I validate inputs, I'd add rate limiting to prevent brute force attacks and DDoS. Sanitize all user inputs to prevent SQL injection (though parameterized queries help with this).

**API Security:** Add HTTPS everywhere. Implement CORS properly with specific allowed origins, not wildcards. Add request size limits to prevent DoS attacks.

**Data Protection:** Hash sensitive customer data at rest. Implement proper error handling that doesn't leak database structure or API internals to clients.

**XSS Protection:** Ensure all user-generated content is properly escaped. React helps with this, but I'd add Content Security Policy headers."

**Scoring:**
- ✅ Covers multiple security areas
- ✅ Specific vulnerabilities mentioned
- ✅ Proposes concrete solutions
- ✅ Shows understanding of web security
- ❌ Only mentions one concern

---

### Q15: What's the difference between your GET and POST endpoints? Why use each?
**Expected Answer:**
"GET endpoints are for retrieving data - they're idempotent and don't modify server state. Examples: `/api/bookings` to get all bookings, `/api/bookings/:id` to get one booking, `/api/bookings/availability/:date` to check availability. GET requests can be cached and should only read data.

POST endpoints create or modify data. My `/api/bookings/quote` creates a new booking record in the database. POST requests change server state, so they're not idempotent - calling the same POST twice creates two bookings.

I follow RESTful conventions: GET for reading, POST for creating. For updates, I'd use PUT or PATCH. This makes the API predictable and follows HTTP standards that developers expect."

**Scoring:**
- ✅ Explains idempotency
- ✅ Gives examples of each
- ✅ Mentions RESTful conventions
- ✅ Shows understanding of HTTP verbs
- ❌ Confuses GET and POST or doesn't explain differences

---

## PART 3: CODE WALKTHROUGH QUESTIONS

### Q16: Show me a piece of code you're proud of. What does it do?
**Expected Answer (depends on what they show, but should include):**
[They should be able to explain any part of their codebase]

**If they show the quote endpoint:**
"This endpoint handles creating a booking with multiple items. It validates input, calculates totals, performs a database transaction to insert the booking and all items, and ensures atomicity - either everything succeeds or nothing is saved. The error handling ensures we don't leave partial data in the database."

**Scoring:**
- ✅ Can explain what the code does
- ✅ Understands the flow
- ✅ Mentions error handling or edge cases
- ✅ Shows pride in solution
- ❌ Can't explain own code

---

### Q17: What would you refactor in your codebase?
**Expected Answer:**
"Several refactoring opportunities:

**Service Layer:** I'd extract database logic from routes into a service layer. Currently, routes directly interact with the database - a service layer would separate business logic from HTTP concerns, making code more testable.

**Error Handling:** Create consistent error handling middleware instead of try-catch blocks in every route. This would standardize error responses.

**Validation:** Use a validation library like Joi or Zod instead of manual validation. This would reduce code duplication and catch more edge cases.

**Constants:** Extract magic numbers (like tax rate of 0.10) and API endpoint strings into constants file for easier maintenance.

**Type Safety:** Create shared TypeScript interfaces between frontend and backend to ensure type consistency across the stack."

**Scoring:**
- ✅ Identifies specific improvements
- ✅ Shows understanding of code organization
- ✅ Mentions maintainability concerns
- ✅ Proposes concrete refactorings
- ❌ Too vague or says "everything is perfect"

---

### Q18: How do you handle errors in your application?
**Expected Answer:**
"On the frontend, I use try-catch blocks around API calls and display user-friendly error messages. I also have an ErrorBoundary component that catches React errors and shows a fallback UI instead of crashing the app.

On the backend, each route has try-catch blocks that catch errors, log them to the console, and return appropriate HTTP status codes (400 for bad requests, 500 for server errors) with error messages. The API always returns JSON, even for errors, so the frontend can handle them consistently.

For database errors, I catch SQLite-specific errors and return generic messages to avoid exposing database structure. In production, I'd implement proper logging with Winston or similar, and send errors to a monitoring service like Sentry."

**Scoring:**
- ✅ Covers both frontend and backend
- ✅ Mentions ErrorBoundary
- ✅ Discusses HTTP status codes
- ✅ Shows awareness of security (not exposing internals)
- ❌ Doesn't mention error handling at all

---

## SCORING RUBRIC FOR INTERVIEWER

### Excellent (Hire)
- Answers are clear and structured
- Shows deep technical understanding
- Acknowledges limitations honestly
- Proposes realistic solutions
- Can explain code decisions
- Shows growth mindset

### Good (Likely Hire)
- Answers most questions correctly
- Understands concepts but may lack depth
- Some uncertainty but attempts solutions
- Can explain code with prompting

### Fair (Maybe)
- Basic understanding of concepts
- Struggles with technical details
- Vague answers
- Can't explain own code well

### Poor (No Hire)
- Doesn't understand own project
- Can't answer basic technical questions
- Makes up answers instead of admitting uncertainty
- Can't explain code at all

---

## FEEDBACK TEMPLATE FOR AFTER INTERVIEW

"Great job on [specific question]. You really showed understanding of [concept].

On [question], you could strengthen your answer by mentioning [specific point].

Overall impression: [general feedback]

Areas to study more: [topics]

You're ready for: [assessment]"

---

## NOTES FOR CANDIDATE

- **It's okay to say "I'm not sure, but I would..."** - Shows problem-solving skills
- **Be honest about limitations** - Shows maturity
- **Ask clarifying questions** - Shows communication skills
- **Use specific examples from your code** - More credible
- **Practice explaining code out loud** - Different from reading it

