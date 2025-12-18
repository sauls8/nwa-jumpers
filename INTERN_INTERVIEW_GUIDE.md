# NWA Jumpers - Intern Level Interview Guide

## For Your Interview Buddy: How to Use This Guide

- Read the question to the candidate
- Let them answer (no hints)
- Compare their answer to the "Expected Answer"
- Use the "Scoring Guide" to evaluate
- Give feedback after each section

**Note:** This guide is tailored for an intern position at a small-mid company. Questions focus on practical skills, not advanced algorithms.

---

## PART 1: PROJECT WALKTHROUGH (Most Important)

### Q1: Tell me about your project. What does it do?
**Expected Answer:**
"I built a booking system for an inflatable rental company. Users can browse inflatables by category, select items, fill out a form with their information, and create a quote. The system generates PDF quotes and has an admin dashboard to manage bookings. It's a full-stack application with a React frontend and Node.js backend."

**Scoring:**
- ✅ Clear explanation of what it does
- ✅ Mentions it's full-stack
- ✅ Shows it solves a real problem
- ❌ Too technical or too vague

---

### Q2: Why did you build this project?
**Expected Answer:**
"I wanted to learn full-stack development by building something real. This project let me work with frontend, backend, and database all together. I also wanted to show that I can build a complete application from start to finish, not just follow tutorials."

**Scoring:**
- ✅ Shows learning mindset
- ✅ Demonstrates initiative
- ✅ Shows ability to complete projects
- ❌ Just says "it was required" or too vague

---

### Q3: Walk me through how a user creates a booking.
**Expected Answer:**
"User starts on the categories page, selects a category like 'Castles', then browses inflatables. They click 'Book Now' on an inflatable, which takes them to a form. They fill out their name, email, phone, and select a date and time using the calendar. When they submit, it adds the item to their cart. They can add more items or proceed to checkout to generate a quote. The system saves everything to a database and generates a PDF quote they can download."

**Scoring:**
- ✅ Clear step-by-step flow
- ✅ Shows understanding of user experience
- ✅ Mentions key features (calendar, cart, PDF)
- ❌ Jumps around or misses key steps

---

### Q4: What was the hardest part of building this?
**Expected Answer:**
"Getting the cart system to work correctly was challenging. I had to figure out how to store customer information once but allow multiple items in the cart. I solved it by separating customer data from cart items in the state, and using a database structure where one booking can have multiple items linked to it. It took some trial and error, but I learned a lot about data modeling."

**Scoring:**
- ✅ Specific challenge mentioned
- ✅ Shows problem-solving process
- ✅ Learned something from it
- ❌ Says "nothing was hard" or too generic

---

### Q5: What technologies did you use and why?
**Expected Answer:**
"I used React for the frontend because it's popular and has good documentation for learning. TypeScript helped catch errors before they became bugs. Node.js and Express for the backend because they use JavaScript, so I could work in one language. SQLite for the database because it's simple to set up and perfect for learning. I chose technologies that would help me learn while building something real."

**Scoring:**
- ✅ Lists technologies
- ✅ Basic reasoning (even if simple)
- ✅ Shows learning-focused choices
- ❌ Can't explain why or doesn't know what they used

---

## PART 2: BASIC PROGRAMMING CONCEPTS

### Q6: What is Object-Oriented Programming (OOP)?
**Expected Answer:**
"OOP is a way of organizing code using objects that contain both data and functions. The main concepts are:
- **Classes/Objects:** Templates for creating things (like a 'Booking' class)
- **Encapsulation:** Keeping data and methods together
- **Inheritance:** One class can inherit from another
- **Polymorphism:** Different objects can respond to the same method differently

In my project, I use objects like 'CartItem' and 'CustomerInfo' to organize related data together."

**Scoring:**
- ✅ Explains main concepts (even if basic)
- ✅ Can give an example
- ✅ Shows understanding, not just memorization
- ❌ Can't explain or gives wrong definition

---

### Q7: What's the difference between a class and an object?
**Expected Answer:**
"A class is like a blueprint or template. An object is an actual instance created from that class. For example, if 'Car' is a class, then 'myHonda' would be an object created from the Car class. In JavaScript/TypeScript, I use interfaces and types more than classes, but the concept is similar - I define the structure, then create instances of it."

**Scoring:**
- ✅ Understands blueprint vs instance concept
- ✅ Can give an example
- ✅ Shows practical knowledge
- ❌ Confuses them or can't explain

---

### Q8: What's the difference between let, const, and var in JavaScript?
**Expected Answer:**
"`const` is for values that won't change - once you set it, you can't reassign it. `let` is for values that might change. `var` is the old way and has function scope, while `let` and `const` have block scope. I mostly use `const` for everything unless I know the value needs to change, then I use `let`. I avoid `var` because it can cause unexpected behavior."

**Scoring:**
- ✅ Knows const vs let
- ✅ Mentions scope difference
- ✅ Shows practical usage
- ❌ Can't explain or gives wrong info

---

### Q9: What is an API and how does your project use it?
**Expected Answer:**
"An API is how different parts of software communicate. In my project, the React frontend makes HTTP requests to the Node.js backend API. For example, when a user submits a booking, the frontend sends a POST request to `/api/bookings/quote` with the booking data. The backend processes it, saves to the database, and sends back a response. It's like the frontend asking the backend to do something and get results back."

**Scoring:**
- ✅ Basic understanding of API concept
- ✅ Can explain how their project uses it
- ✅ Mentions HTTP requests
- ❌ Too vague or doesn't understand

---

### Q10: What is a database and why do you need one?
**Expected Answer:**
"A database stores data permanently. In my project, I use SQLite to store bookings, customer information, and items. Without a database, when the server restarts, all the booking data would be lost. The database keeps everything saved so users can come back later and see their bookings, and admins can manage them."

**Scoring:**
- ✅ Understands persistence concept
- ✅ Knows why it's needed
- ✅ Can relate to their project
- ❌ Doesn't understand purpose

---

## PART 3: PROBLEM-SOLVING (No LeetCode - Real Scenarios)

### Q11: A user says they can't submit the booking form. How would you debug this?
**Expected Answer:**
"First, I'd check the browser console for JavaScript errors. Then I'd check if the form validation is working - maybe a required field isn't filled. I'd also check the Network tab to see if the API request is being sent and what response we're getting. If the request fails, I'd check the backend logs. I'd also test the form myself to reproduce the issue. The key is to check frontend errors first, then API communication, then backend."

**Scoring:**
- ✅ Systematic approach
- ✅ Mentions browser tools (console, network tab)
- ✅ Logical debugging steps
- ✅ Shows problem-solving process
- ❌ No clear approach or gives up easily

---

### Q12: How would you add a new feature - like sending email confirmations?
**Expected Answer:**
"I'd start by researching email libraries for Node.js, like Nodemailer. Then I'd add it to the backend, probably as a function that gets called after a booking is created. I'd need to set up email credentials (probably in environment variables for security). I'd test it locally first, then integrate it into the booking flow. I'd also add error handling in case the email fails to send."

**Scoring:**
- ✅ Shows research/learning approach
- ✅ Thinks about security (env variables)
- ✅ Mentions testing
- ✅ Considers error handling
- ❌ No clear plan or doesn't think about security

---

### Q13: A user reports that dates are showing incorrectly. What could cause this?
**Expected Answer:**
"This could be a timezone issue. JavaScript Date objects can be tricky with timezones. I'd check how dates are being stored in the database and how they're being displayed. The issue might be that dates are being converted to UTC when saved, then displayed in local time incorrectly. I'd also check the date formatting code to make sure it's handling timezones correctly."

**Scoring:**
- ✅ Identifies likely cause (timezone)
- ✅ Shows understanding of common issue
- ✅ Has debugging approach
- ❌ No idea or wrong diagnosis

---

### Q14: How would you make the app work on mobile phones?
**Expected Answer:**
"I'd use responsive CSS - media queries to adjust layouts for smaller screens. I'd make sure buttons and inputs are large enough to tap easily. I'd test on actual mobile devices or use browser dev tools to simulate mobile. I'd also make sure the calendar and forms are usable on small screens. The good news is React makes this easier since components can adapt their styling."

**Scoring:**
- ✅ Mentions responsive design
- ✅ Thinks about usability
- ✅ Mentions testing
- ✅ Shows practical approach
- ❌ No clear plan

---

## PART 4: LEARNING & GROWTH (Important for Interns)

### Q15: How do you learn new technologies?
**Expected Answer:**
"I start with official documentation to understand the basics. Then I look for tutorials or video courses to see it in action. I build small practice projects to get hands-on experience. If I get stuck, I search Stack Overflow or ask in developer communities. For this project, I learned React by building small components first, then putting them together."

**Scoring:**
- ✅ Shows multiple learning methods
- ✅ Self-directed learning
- ✅ Uses resources effectively
- ✅ Gives example from experience
- ❌ Only mentions one method or passive learning

---

### Q16: Tell me about a time you got stuck and how you solved it.
**Expected Answer:**
"When I was building the calendar, dates were showing one day off. I spent time debugging and realized it was a timezone issue with how JavaScript handles dates. I searched online, found it's a common problem, and learned about using local date formatting instead of UTC. I fixed it by creating a helper function to format dates correctly. I learned to always consider timezones when working with dates."

**Scoring:**
- ✅ Specific example
- ✅ Shows problem-solving process
- ✅ Learned something
- ✅ Can explain the solution
- ❌ Can't think of an example or gives up easily

---

### Q17: What would you do if you don't know how to do something at work?
**Expected Answer:**
"First, I'd try to figure it out myself by searching documentation or similar examples. If I'm still stuck after reasonable effort, I'd ask a colleague or supervisor for help. I'd make sure to explain what I've already tried so they know I put in effort. I'd also take notes so I can solve it myself next time. I believe in being resourceful but also knowing when to ask for help."

**Scoring:**
- ✅ Shows initiative (tries first)
- ✅ Knows when to ask for help
- ✅ Shows learning mindset
- ✅ Professional approach
- ❌ Either gives up too easily or never asks for help

---

### Q18: Why do you want this internship?
**Expected Answer:**
"I want to apply what I've learned in a real work environment. I'm excited to work on actual business problems, learn from experienced developers, and contribute to a team. I'm particularly interested in [mention something specific about the company if possible]. I see this as a chance to grow my skills while helping the company."

**Scoring:**
- ✅ Shows genuine interest
- ✅ Mentions learning/growth
- ✅ Professional tone
- ✅ Can adapt to mention company specifics
- ❌ Too generic or doesn't show interest

---

## PART 5: SOFT SKILLS (Very Important for Interns)

### Q19: How do you handle feedback on your code?
**Expected Answer:**
"I see code reviews and feedback as learning opportunities. I try not to take it personally - it's about making the code better. I ask questions if I don't understand the feedback, and I apply what I learn to future code. I've found that getting feedback early helps me improve faster than trying to figure everything out alone."

**Scoring:**
- ✅ Positive attitude toward feedback
- ✅ Shows growth mindset
- ✅ Professional response
- ✅ Can give example
- ❌ Defensive or doesn't value feedback

---

### Q20: Describe a time you worked with others on a project.
**Expected Answer:**
[They should have an example - could be school project, group work, or even this project if they got help]

"I worked on [project] where we divided tasks based on strengths. I handled the frontend while my partner worked on backend. We communicated regularly to make sure our parts worked together. When we had conflicts, we discussed them and found compromises. I learned that clear communication is key to team success."

**Scoring:**
- ✅ Specific example
- ✅ Shows collaboration
- ✅ Mentions communication
- ✅ Learned something
- ❌ No example or poor collaboration skills

---

## SCORING RUBRIC FOR INTERVIEWER

### Excellent (Strong Hire)
- Clear communication
- Shows genuine interest and learning mindset
- Can explain their project well
- Understands basic programming concepts
- Good problem-solving approach
- Professional attitude

### Good (Likely Hire)
- Answers most questions well
- Some gaps in knowledge but willing to learn
- Can explain project with some prompting
- Shows potential

### Fair (Maybe)
- Struggles to explain project
- Basic understanding but needs significant guidance
- Communication could be better
- Shows some interest

### Poor (No Hire)
- Can't explain own project
- Doesn't understand basic concepts
- Poor communication
- Doesn't show learning mindset
- Not interested in the role

---

## KEY THINGS TO LOOK FOR (For Interviewer)

### Green Flags ✅
- Can walk through their project confidently
- Admits when they don't know something
- Shows curiosity and asks questions
- Explains their thinking process
- Shows they learned from challenges
- Professional and respectful

### Red Flags ❌
- Can't explain their own code
- Makes up answers instead of admitting uncertainty
- Doesn't show interest in learning
- Poor communication
- Defensive about feedback
- Doesn't understand basic concepts they claim to know

---

## FEEDBACK TEMPLATE

"Great job on [specific question]. You really showed [strength].

On [question], you could strengthen your answer by [specific improvement].

Overall impression: [general feedback]

You're ready for: [assessment - Strong Hire / Likely Hire / Maybe / Needs More Practice]"

---

## NOTES FOR CANDIDATE

### What They're Really Looking For:
1. **Can you code?** - Your project proves this
2. **Can you learn?** - Show growth mindset
3. **Can you communicate?** - Explain your work clearly
4. **Will you fit in?** - Professional, respectful, eager to learn
5. **Are you reliable?** - You completed a project

### What They're NOT Looking For:
- ❌ Perfect code
- ❌ Knowing everything
- ❌ LeetCode skills
- ❌ Years of experience
- ❌ Advanced algorithms

### What to Emphasize:
- ✅ You built something real
- ✅ You learned new technologies
- ✅ You solved problems
- ✅ You're eager to learn more
- ✅ You can work with others

### Red Flags to Avoid:
- Don't make up answers - say "I'm not sure, but I would research..."
- Don't be defensive about your code
- Don't claim to know things you don't
- Don't badmouth technologies or approaches
- Don't say you know everything

---

## PRACTICE TIPS

1. **Practice explaining your project out loud** - Different from reading code
2. **Time yourself** - Keep answers to 1-2 minutes
3. **Use simple language** - Don't overcomplicate
4. **Be honest** - It's okay to not know everything
5. **Show enthusiasm** - Interns should be excited to learn
6. **Ask questions** - Shows engagement

---

## COMMON FOLLOW-UP QUESTIONS

After any answer, they might ask:
- "Can you tell me more about that?"
- "How did you figure that out?"
- "What would you do differently?"
- "Why did you choose that approach?"

**Tip:** Always have a "why" for your decisions, even if it's simple like "it was easier to learn" or "the documentation was good."

