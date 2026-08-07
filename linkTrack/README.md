# LinkTrack - Solo Link Tracking App

A self-hosted, personal link tracking dashboard built with React, Express, and Supabase.

## Project Structure
- `root`: Backend (Express) + Project Config
- `frontend/`: Frontend (React + Vite)
- `sql/`: Database Schema

## Setup Instructions

### 1. Database Setup (Supabase)
1. Create a new Supabase project.
2. Go to the **SQL Editor** in Supabase.
3. Copy the contents of `sql/schema.sql` and run it to create the tables.
4. Get your **Project URL** and **Service Role Key** (under Project Settings > API).

### 2. Backend Setup (Root Directory)
1. Open `.env` file in the root directory.
2. Fill in your Supabase credentials.
3. Install dependencies: `npm install`
4. Start the server: `npm run dev`

### 3. Frontend Setup
1. Open a new terminal.
2. Navigate to frontend: `cd frontend`
3. Install dependencies: `npm install`
4. Start the dev server: `npm run dev`
5. Open the URL shown (usually [http://localhost:5173](http://localhost:5173)).
