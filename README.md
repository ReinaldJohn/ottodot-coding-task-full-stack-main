1. **GitHub Repository URL**: https://github.com/ReinaldJohn/ottodot-coding-task-full-stack-main
2. **Live Demo URL**: https://ottodot-coding-task-full-stack-main.vercel.app/
3. **Supabase Credentials**: Add these to your README for testing:
   ```
   SUPABASE_URL: https://mdqlbszlwbdrtfzpjkzm.supabase.co
   SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWxic3psd2JkcnRmenBqa3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MjUxODQsImV4cCI6MjA3NTIwMTE4NH0.pnzqNSPNUc1PrGkPwxnhPveRe4WG60vo5Vq4NN2Hq4U
   ```

## Implementation Notes
### My Implementation:
During the development of this project, I implemented several core functionalities and optimizations to ensure a smooth, efficient, and well-structured application. Below are the key implementation details and design decisions I made throughout the process:

- **Configured Base URL and Alias Paths**
I updated the tsconfig.json file to include base URL and alias paths for cleaner, more maintainable imports across the project. This improves readability and reduces potential path-related errors in larger codebases.

- **Database Schema Setup**
I copied the database.ts schema into my own Supabase account to establish the correct database structure. This ensures that all tables, types, and relationships align with the application’s data model.

- **Environment Configuration**
I created and configured a .env.local file to securely store sensitive credentials such as my Supabase URL, Supabase API key, and Google Gemini API key. This follows best practices for environment management and security.

- **Gemini Model Integration**
I developed a dedicated gemini.ts file and integrated the Gemini 2.5 Flash AI model to handle natural language generation tasks efficiently. This provides reliable, high-quality question and answer generation capabilities.

- **API Routing Setup**
I organized and implemented API routes under the /api/math-problems directory, creating distinct route handlers for problem generation and answer submission. This modular structure simplifies maintenance and scalability.

- **Problem Generation Endpoint (math-problems/route.ts)**
I defined TypeScript types for problem_text and correct_answer, ensuring strong type safety. I also created a custom function for generating JSON responses and implemented a well-structured AI prompt for math problem generation (aligned with the P5 requirements). The POST method includes robust try/catch error handling to improve reliability and debugging.

- **Answer Submission Endpoint (math-problems/submit/route.ts)**
This endpoint mirrors the architecture of the generation route but uses a separate AI prompt tailored for evaluating user answers and providing insightful feedback. It also includes a Supabase insert operation to log responses and returns a well-formatted JSON response.

- **Front-End Implementation (page.tsx)**
I significantly enhanced the user interface and user experience by improving the responsive layout, integrating loading spinners for asynchronous actions, and adding smart UI logic—such as disabling the input field and “Generate New Problem” button during operations. Additionally, I designed clear box containers to display both AI-generated problems and feedback messages, creating a more intuitive interaction flow.

## Additional Features
In addition to the base implementation, I integrated and refined several advanced features to improve user experience and maintainability:

- **Gemini Model Abstraction**
Created a modular getGemini() utility to simplify AI model reuse and allow future upgrades (e.g., switching to Gemini 3 or fine-tuned models).

- **Error Handling and Validation**
Implemented consistent error responses with meaningful messages to enhance debugging and user feedback during API calls.

- **Improved UX and Accessibility**
Enhanced keyboard, paste, and wheel event handling in the answer input field for better user control and accessibility during submission.

- **Session Tracking and State Management**
Used unique sessionId identifiers to tie each problem and submission together, ensuring accurate logging and evaluation in Supabase.

**Potential Future Enhancements**

If additional time were available, I would expand this project with the following features:

**Difficulty Levels** - Add adjustable difficulty (Easy, Medium, Hard) to challenge students progressively.

**Problem History View** - Allow users to view previous problems, answers, and feedback.

**Score Tracking System** - Introduce a scoring mechanism to measure progress over multiple sessions.

**Multiple Problem Types** - Diversify question types (addition, subtraction, multiplication, division).

**Hints and Step-by-Step Explanations** - Provide incremental hints and optional solution breakdowns.

**Adaptive Learning Mode** - Adjust problem difficulty dynamically based on the user’s performance.
