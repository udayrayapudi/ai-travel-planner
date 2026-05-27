# AI Travel Planner

This is an AI-powered travel planning application built with Next.js, Tailwind CSS, and OpenAI.

## Features

- **Input Collection:** Intelligently gathers trip details.
- **Feasibility Verdict:** Analyzes if the trip is realistic.
- **Real-World Intelligence:** Provides weather, crowd, and safety data.
- **Cost Reality Check:** Estimates costs and checks against budget.
- **Smart Alternatives:** Suggests better options if available.
- **Detailed Itinerary:** Generates a day-by-day plan.
- **Experience Optimization:** Recommends hidden gems and warns about tourist traps.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI Integration:** OpenAI API
- **Validation:** Zod (ready for integration)
- **Icons:** Lucide React

## Getting Started

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    - Rename `.env.example` to `.env.local`
    - Add your OpenAI API Key: `OPENAI_API_KEY=your_key_here`
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  **Open [http://localhost:3000](http://localhost:3000) with your browser.**

## Project Structure

- `src/app/api/plan-trip`: Backend API route handling AI logic.
- `src/components`: React components (TripForm, TripResult).
- `src/lib`: Types and utility functions.
