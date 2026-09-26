# Typeform Clone 📝

A fully functional clone of Typeform built with Next.js, FastAPI, and SQLite. This project beautifully replicates Typeform's signature "one-question-at-a-time" conversational flow, alongside a robust drag-and-drop form builder, live preview, and data visualization.

---

## 🛠 Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion (for animations), dnd-kit (for drag and drop)
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic
- **Database:** SQLite (local persistent database)

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.9+

### Backend Setup
1. Open a terminal and navigate to the `backend` directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # On Windows
   # source venv/bin/activate    # On Mac/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the database seed script to populate sample forms and responses:
   ```bash
   python seed_db.py
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` in your browser.

---

## 🏗 Architecture Overview

The application follows a standard decoupled Client-Server architecture:

1. **Frontend (Next.js):** 
   - Uses Server-Side Rendering (SSR) for static elements and Client-Side rendering for dynamic components (like the Form Builder).
   - `framer-motion` handles the complex view-state transitions required for the public respondent flow (`/f/[slug]`).
   - `dnd-kit` manages the drag-and-drop sorting in the Form Builder (`/dashboard/forms/[id]/edit`).

2. **Backend (FastAPI):**
   - Provides a RESTful API with distinct namespaces for `forms`, `questions`, and `responses`.
   - Adopts a Repository pattern (`crud/` directory) to abstract SQLAlchemy database operations away from the route controllers (`routers/`).
   - Uses Pydantic schemas to validate incoming payloads and strictly enforce data integrity (e.g. validating email strings or numeric limits).

---

## 🗄 Database Schema

The SQLite schema consists of 4 primary tables connected via foreign keys:

1. **`creators`**: Stores platform users.
   - `id`, `name`, `email`
2. **`forms`**: Stores the metadata for created forms.
   - `id`, `creator_id` (FK), `title`, `status` (draft/published), `slug` (unique URL path), `created_at`
3. **`questions`**: Stores dynamically ordered questions per form.
   - `id`, `form_id` (FK), `type` (Enum: short_text, multiple_choice, rating, etc.), `title`, `required`, `order_index`, `options` (JSON for choices), `config` (JSON for specific settings)
4. **`responses`**: Stores a single form submission.
   - `id`, `form_id` (FK), `submitted_at`, `is_complete`
5. **`answers`**: Stores individual answers linked to a response and a specific question.
   - `id`, `response_id` (FK), `question_id` (FK), `value` (Text)

---

## 📌 Assumptions Made

1. **Authentication:** Per the assignment's instructions to simplify real authentication, a "default logged-in creator" (ID: 1) is assumed for all dashboard operations.
2. **Settings Placeholders:** Workflows, Connect/Integrations, and Theme configurations are present in the UI as aesthetic placeholders to replicate the Typeform experience, but are non-functional mockups.
3. **Draft vs Published:** When a form is unpublished, the backend sets the status to `draft` but retains the previously generated unique `slug`. This ensures that if the creator re-publishes the form later, the link does not break for respondents who already have it.
