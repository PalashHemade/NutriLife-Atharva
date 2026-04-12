# 🥗 NutriLife — AI-Powered Nutrition & Diet Recommendation Platform

> A full-stack intelligent nutrition platform that combines **Machine Learning** (Random Forest with GridSearchCV) for clinical diet classification with **Generative AI** (Groq/LLaMA 3.3 70B) for personalized meal planning, recipe generation, and adaptive dietary management.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [ML Model Details](#-ml-model-details)
- [Recipe Database](#-recipe-database)
- [API Reference](#-api-reference)
- [Database Models](#-database-models)
- [User Dashboard Sections](#-user-dashboard-sections)
- [Authentication & RBAC](#-authentication--rbac)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Screenshots & Usage](#-screenshots--usage)

---

## 🎯 Overview

NutriLife is not a generic calorie counter — it's a clinically-informed nutrition platform. Unlike typical diet apps that rely on user quizzes, NutriLife processes **real biomarkers** (blood glucose, cholesterol, BMI, blood pressure) through a trained ML classifier to determine the most appropriate diet category, then leverages generative AI to create fully personalized meal plans from a curated recipe database.

### How It Works (End-to-End Flow)

```
User fills Health Profile (13 clinical features)
        ↓
FastAPI ML Service classifies into diet category
  (Balanced / Low_Carb / Low_Sodium)
        ↓
MongoDB Recipe Database queried for matching recipes
        ↓
Groq AI (LLaMA 3.3 70B) generates 4-meal daily plan
  using real recipes as context
        ↓
User logs consumption → AI recalculates remaining meals
        ↓
Activity tracker calculates net calories (eaten − burnt)
```

---

## ✨ Key Features

### 🧠 AI & ML Features

| # | Feature | How It Works | Technology |
|---|---------|-------------|------------|
| 1 | **ML Diet Classification** | Classifies users into one of 3 diet categories (Balanced, Low_Carb, Low_Sodium) based on 13 clinical features using an optimized Random Forest pipeline with GridSearchCV hyperparameter tuning | scikit-learn, FastAPI |
| 2 | **AI Meal Plan Generation** | After ML classification, fetches matching recipes from MongoDB, then Groq AI generates a 4-meal daily plan (breakfast, lunch, dinner, snack) with exact macros per meal | Groq SDK, LLaMA 3.3 70B |
| 3 | **Adaptive Plan Modification** | User logs what percentage of each meal they consumed → AI recalculates the remaining meals to ensure daily caloric and macro targets are still met | Groq SDK |
| 4 | **Recipe from Ingredients** | User enters available ingredients → AI generates a complete recipe with cooking steps, servings, prep time, and full nutritional breakdown | Groq SDK |
| 5 | **Activity Calorie Tracking** | 15 activities with scientifically-established MET values — calculates calories burnt using the formula: `MET × Weight(kg) × Duration(hours)` | MET-based calculation |

### 📖 Recipe Database Features

| # | Feature | Description |
|---|---------|-------------|
| 6 | **Curated Recipe Database** | 25+ Indian and global recipes stored in MongoDB with full nutritional data per 100g serving |
| 7 | **Diet-Matched Browsing** | Recipes auto-filtered by ML-predicted diet type (Low_Carb, Low_Sodium, Balanced) |
| 8 | **Multi-Filter System** | Filter by diet type, Veg/Non-Veg, cuisine (Indian, South Indian, Mediterranean, Asian, Mexican, Global) |
| 9 | **Recipe Detail Modal** | Click any recipe card to see complete nutrition breakdown (6 nutrients), ingredients with quantities, step-by-step cooking instructions, and tags |
| 10 | **Auto-Seeding** | Recipe database auto-populates on first API call — zero manual setup |

### 👥 Platform Features

| # | Feature | Description |
|---|---------|-------------|
| 11 | **User Registration & Login** | Email/password authentication with bcrypt password hashing |
| 12 | **Role-Based Access Control** | 4 roles (User, Consultant, Trainer, Admin) with middleware-enforced dashboard access |
| 13 | **Role-Based Routing** | Login automatically redirects to the correct dashboard based on user role |
| 14 | **Nutritionist Directory** | Browse expert nutritionists with ratings, specializations, badges, bios, and patient counts |
| 15 | **Appointment Booking** | Book consultation sessions with nutritionists — select date, time slot, add notes |
| 16 | **Health Profile Storage** | All health data persisted to user's MongoDB document for future sessions |
| 17 | **BMI Auto-Calculator** | Real-time BMI calculation from height and weight in the health profile form |
| 18 | **Dashboard Overview** | Daily summary showing calories eaten, protein consumed, calories burnt, net calories, and macro progress bars |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (Client)                         │
│              Next.js 16 · React 19 · TypeScript                 │
│                                                                 │
│  ┌────────────┐ ┌──────────┐ ┌──────────────────────────────┐  │
│  │  Landing   │ │ Login /  │ │     User Dashboard            │  │
│  │   Page     │ │Register  │ │ ┌──────────┐ ┌─────────────┐ │  │
│  │            │ │          │ │ │ AI Meal  │ │Recipe Browser│ │  │
│  │ • Hero     │ │ • Email/ │ │ │  Plan    │ │ • Filters   │ │  │
│  │ • Services │ │   Pass   │ │ │ • Health │ │ • Cards     │ │  │
│  │ • Diet Gen │ │ • Role   │ │ │   Form   │ │ • Detail    │ │  │
│  │ • Booking  │ │   Select │ │ │ • Modify │ │   Modal     │ │  │
│  │ • Footer   │ │ • RBAC   │ │ ├──────────┤ ├─────────────┤ │  │
│  │            │ │   Route  │ │ │ Recipe   │ │ Activity    │ │  │
│  │            │ │          │ │ │ Finder   │ │ Tracker     │ │  │
│  │            │ │          │ │ ├──────────┤ ├─────────────┤ │  │
│  │            │ │          │ │ │Nutrition-│ │ Dashboard   │ │  │
│  │            │ │          │ │ │  ists    │ │ Overview    │ │  │
│  └────────────┘ └──────────┘ │ └──────────┘ └─────────────┘ │  │
│                              └──────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP (API Routes)
┌───────────────────────────▼─────────────────────────────────────┐
│                   BACKEND (Next.js API Routes)                   │
│                                                                  │
│  Auth Layer                AI Layer                Data Layer     │
│  ─────────                 ────────                ──────────     │
│  POST /api/auth/register   POST /api/ai/           GET/POST      │
│  GET  /api/auth/session      generate-plan          /api/recipes  │
│  POST /api/auth/signin     POST /api/ai/           GET/POST      │
│                              modify-plan            /api/         │
│                            POST /api/ai/             nutritionists│
│                              recipe-from-           GET/POST      │
│                              ingredients             /api/        │
│                            GET/POST /api/ai/         appointments │
│                              activity-calories                    │
└──────┬───────────────────────────┬────────────────────┬──────────┘
       │                           │                    │
┌──────▼──────────┐  ┌─────────────▼───────┐  ┌────────▼──────────┐
│    MongoDB      │  │    Groq AI API      │  │   FastAPI ML      │
│   (Mongoose)    │  │   (LLaMA 3.3 70B)  │  │    Service        │
│                 │  │                     │  │   (Port 8000)     │
│ Collections:    │  │ • Generate plans    │  │                   │
│ • users         │  │ • Modify plans      │  │ nutrilife_        │
│ • mealplans     │  │ • Create recipes    │  │   pipeline.pkl    │
│ • activitylogs  │  │ • Structured JSON   │  │ target_           │
│ • recipes       │  │   responses         │  │   encoder.pkl     │
│ • nutritionists │  │                     │  │                   │
│ • appointments  │  └─────────────────────┘  │ Random Forest     │
│                 │                           │ + GridSearchCV     │
└─────────────────┘                           └───────────────────┘
```

---

## 🛠 Tech Stack

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.1.6 | React framework with App Router & Turbopack |
| React | 19.2.3 | UI library |
| TypeScript | ^5 | Static type checking |
| Tailwind CSS | ^4 | Utility-first CSS framework |
| Framer Motion | 12.34.5 | Animations and page transitions |
| Lucide React | 0.576.0 | Icon library (landing page) |
| React Hook Form | 7.71.2 | Form handling and validation |
| clsx / tailwind-merge | Latest | Conditional class merging |

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| NextAuth.js | 4.24.13 | Authentication (Credentials provider + JWT sessions) |
| Mongoose | 9.4.1 | MongoDB ODM with schema validation |
| Groq SDK | 1.1.2 | AI/LLM integration (Groq inference API) |
| bcryptjs | 3.0.3 | Password hashing (bcrypt algorithm) |

### ML Service (Python)

| Package | Purpose |
|---------|---------|
| FastAPI | High-performance async Python API framework |
| uvicorn | ASGI server for FastAPI |
| scikit-learn | Random Forest classifier, StandardScaler, OneHotEncoder, GridSearchCV |
| pandas | DataFrame manipulation for model input |
| joblib | Model/encoder serialization (.pkl files) |
| pydantic | Request/response data validation |

---

## 🔬 ML Model Details

### Training Pipeline (`ml-service/train.py`)

The ML model follows the exact specification from the project design document:

#### Step 1: Data Preparation
- **Dataset**: `diet_recommendations_dataset.csv` — 1000 patient records
- **After cleaning**: 456 records (dropped NaN rows)
- **Target variable**: `Diet_Recommendation` → encoded with `LabelEncoder`
- **Diet classes**: `Balanced`, `Low_Carb`, `Low_Sodium`

#### Step 2: Feature Engineering

**6 columns dropped** (not useful for prediction):
```
Patient_ID, Disease_Type, Severity, Physical_Activity_Level,
Adherence_to_Diet_Plan, Dietary_Nutrient_Imbalance_Score
```

**13 features used** (9 numerical + 4 categorical):

| # | Feature | Type | Example Values |
|---|---------|------|---------------|
| 1 | Age | Numerical | 18–80 |
| 2 | Weight_kg | Numerical | 45–120 |
| 3 | Height_cm | Numerical | 150–195 |
| 4 | BMI | Numerical | 16.5–40.0 |
| 5 | Daily_Caloric_Intake | Numerical | 1200–3500 |
| 6 | Cholesterol_mg/dL | Numerical | 100–300 |
| 7 | Blood_Pressure_mmHg | Numerical | 90–180 |
| 8 | Glucose_mg/dL | Numerical | 60–200 |
| 9 | Weekly_Exercise_Hours | Numerical | 0–15 |
| 10 | Gender | Categorical | Male, Female |
| 11 | Dietary_Restrictions | Categorical | None, Vegetarian, Vegan, Gluten-Free |
| 12 | Allergies | Categorical | None, Peanuts, Shellfish, Dairy, Gluten |
| 13 | Preferred_Cuisine | Categorical | Indian, Chinese, Mexican, Mediterranean |

#### Step 3: Preprocessing Pipeline

```python
ColumnTransformer:
  ├── StandardScaler → 9 numerical features (normalization)
  └── OneHotEncoder (handle_unknown="ignore") → 4 categorical features
```

#### Step 4: Model + Hyperparameter Tuning

```python
GridSearchCV (3-fold CV, 12 candidate combinations):
  ├── n_estimators: [100, 200]
  ├── max_depth: [None, 10, 20]
  └── min_samples_split: [2, 5]

Best Parameters: {n_estimators: 200, max_depth: None, min_samples_split: 5}
```

#### Step 5: Output Files

| File | Size | Contents |
|------|------|----------|
| `nutrilife_pipeline.pkl` | 2.7 MB | Full sklearn Pipeline (preprocessor + RandomForestClassifier) |
| `target_encoder.pkl` | 508 B | LabelEncoder for inverse_transform (number → diet name) |

#### Step 6: Inference (FastAPI)

```
POST http://localhost:8000/predict
Body: { Age, Gender, Weight_kg, Height_cm, BMI, ... (13 fields) }
Response: { "diet": "Low_Carb" }
```

The FastAPI service loads both `.pkl` files on startup, constructs a DataFrame from the input, runs prediction through the pipeline, and uses `target_encoder.inverse_transform()` to return the human-readable diet category.

---

## 🍳 Recipe Database

### Schema (Mongoose)

Each recipe document follows a structured nested schema:

```typescript
Recipe {
  name: String (required)            // "Paneer Bhurji"
  type: "Veg" | "Non-Veg" (required) // Dietary classification
  dietType: ["Low_Carb" | "Low_Sodium" | "Balanced"]  // ML-matched categories
  cuisine: String                    // "Indian", "South Indian", "Mediterranean", etc.
  cookingTimeMinutes: Number         // 10–45 minutes
  nutritionPer100g: {
    caloriesKcal: Number             // e.g. 180
    proteinG: Number                 // e.g. 12
    fatG: Number                     // e.g. 14
    carbohydratesG: Number           // e.g. 5
    sugarG: Number                   // e.g. 2
    sodiumMg: Number                 // e.g. 250
  }
  ingredients: [{
    name: String                     // "Paneer"
    quantity: Number                 // 200
    unit: String                     // "g"
  }]
  recipeSteps: [String]             // Step-by-step cooking instructions
  tags: [String]                    // ["low-carb", "protein", "quick"]
  createdAt: Date
}
```

### Seed Data (25+ Recipes)

| Category | Recipes |
|----------|---------|
| **Low_Carb** (7) | Paneer Bhurji, Grilled Chicken Breast, Cauliflower Rice, Egg Omelette, Zucchini Stir Fry, Chicken Lettuce Wrap, Palak Paneer |
| **Low_Sodium** (5) | Sprouts Salad, Grilled Fish, Vegetable Upma, Idli, Vegetable Poha |
| **Balanced** (11) | Vegetable Khichdi, Butter Chicken, Dal Tadka, Chicken Curry, Veg Pulao, Fish Curry, Chapati with Sabzi, Egg Curry, Vegetable Sandwich, Chicken Wrap, Ragi Dosa |
| **Multi-category** (2) | Ragi Dosa (Low_Sodium + Balanced), Tandoori Chicken (Low_Carb + Balanced) |

### Cuisines Covered
Indian, South Indian, Mediterranean, Asian, Mexican, Global

---

## 📡 API Reference

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register a new user (name, email, password, role) |
| POST | `/api/auth/[...nextauth]` | ❌ | NextAuth.js sign-in (Credentials provider) |
| GET | `/api/auth/session` | 🔑 | Get current session & user info |

### AI Feature Endpoints

| Method | Endpoint | Auth | Request Body | Response |
|--------|----------|------|-------------|----------|
| POST | `/api/ai/generate-plan` | 🔑 | `{ age, height, weight, gender, glucoseLevel, cholesterol, bloodPressure, dailyCaloricIntake, dietaryRestrictions, allergies, preferredCuisine, weeklyExerciseHours, goals }` | `{ mealPlan, dietCategory, matchingRecipes }` |
| GET | `/api/ai/generate-plan` | 🔑 | — | `{ mealPlan }` (today's existing plan) |
| POST | `/api/ai/modify-plan` | 🔑 | `{ consumedMeals: [{ mealId, consumedAmount }] }` | `{ mealPlan }` (updated plan) |
| POST | `/api/ai/recipe-from-ingredients` | 🔑 | `{ ingredients: ["chicken", "rice", ...] }` | `{ recipe: { name, ingredients, instructions, nutrition, ... } }` |
| POST | `/api/ai/activity-calories` | 🔑 | `{ activity: "running", duration: 30 }` | `{ log, totalBurntToday }` |
| GET | `/api/ai/activity-calories` | 🔑 | — | `{ activities, todayLogs, totalBurntToday }` |

### Recipe Database Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/recipes` | ❌ | Fetch recipes by `{ dietType }` (as specified in docx) |
| GET | `/api/recipes?dietType=Low_Carb&type=Veg&cuisine=Indian` | ❌ | Browse all recipes with optional filters |

### Nutritionist & Appointment Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/nutritionists` | ❌ | List all nutritionists (auto-seeds 4 experts on first call) |
| POST | `/api/appointments` | 🔑 | Book: `{ nutritionistId, date, time, notes }` |
| GET | `/api/appointments` | 🔑 | List user's appointment history |

### ML Service Endpoints (FastAPI — Port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check — returns model status and loaded diet classes |
| POST | `/predict` | Send 13-field JSON → returns `{ "diet": "Low_Carb" }` |

---

## 🗄 Database Models

### 1. User (`lib/models/User.ts`)
```
name*, email* (unique), password* (bcrypt hashed), role (user/consultant/trainer/admin)
Health Profile: age, height (cm), weight (kg), gender, glucoseLevel (mg/dL),
cholesterol (mg/dL), allergies[], dietaryPreferences[], goals[]
Timestamps: createdAt, updatedAt
```

### 2. MealPlan (`lib/models/MealPlan.ts`)
```
userId (ref: User), date (YYYY-MM-DD), category (ML-predicted diet type),
meals[]: { name, mealType, calories, protein, carbs, fat, description,
           consumed (bool), consumedAmount (0-100%) }
totalCalories, totalProtein, totalCarbs, totalFat, modified (bool)
```

### 3. Recipe (`lib/models/Recipe.ts`)
```
name*, type* (Veg/Non-Veg), dietType[] (Low_Carb/Low_Sodium/Balanced),
cuisine, cookingTimeMinutes, nutritionPer100g (6 nutrients),
ingredients[] (name, quantity, unit), recipeSteps[], tags[], createdAt
```

### 4. ActivityLog (`lib/models/ActivityLog.ts`)
```
userId (ref: User), date, activity, duration (min), caloriesBurnt, met (MET value)
```

### 5. Nutritionist (`lib/models/Nutritionist.ts`)
```
name, specialization, bio, emoji, rating, reviews, patients, experience, badges[]
```

### 6. Appointment (`lib/models/Appointment.ts`)
```
userId (ref: User), nutritionistId, nutritionistName, date, time,
notes, status (pending/confirmed/completed/cancelled)
```

---

## 📱 User Dashboard Sections

The user dashboard (`/dashboard/user`) contains 6 interactive sections:

### 1. 📊 Dashboard Overview
- **4 stat cards**: Calories Eaten, Protein intake, Calories Burnt, Net Calories
- **Today's Plan** summary with meal name, calories, consumption status
- **Macro Progress** — animated progress bars for Protein, Carbs, Fats (current vs target)

### 2. 🤖 AI Meal Plan
- **Health Profile Form** with all 13 ML features:
  - Row 1: Age, Gender, Height, Weight
  - Auto-calculated BMI display
  - Row 2: Glucose, Cholesterol, Blood Pressure, Daily Caloric Intake
  - Row 3: Dietary Restrictions (dropdown), Preferred Cuisine (dropdown), Weekly Exercise Hours
  - Row 4: Allergies (dropdown), Goals (text)
- ML classification → Recipe matching → AI meal plan generation
- **Consumption tracking**: slider per meal (0–100%)
- **Adaptive modification**: "Log Consumption & Adjust Plan" button recalculates remaining meals via AI

### 3. 📖 Recipe Browser
- **Filter bar**: Diet Type, Veg/Non-Veg, Cuisine dropdowns + result count
- **ML recommendation banner**: shows ML-predicted diet with quick filter button
- **Recipe grid**: 3-column cards with name, type badge, diet tags, cuisine label, nutrition summary (kcal, protein, carbs, fat), cooking time, ingredient count
- **Hover effects**: green border highlight on card hover
- **Detail modal** (click any card):
  - Green gradient header with name, type, cuisine, cooking time
  - 6-nutrient grid (Calories, Protein, Carbs, Fat, Sugar, Sodium)
  - "Per 100g serving" label
  - Ingredient pills with quantity and unit
  - Numbered cooking steps
  - Hashtag tags

### 4. 👨‍🍳 Recipe Finder (AI)
- Textarea input for available ingredients
- AI generates full recipe with: name, servings, prep time, cook time
- Nutrition display, ingredient list, numbered instructions, tips

### 5. 🏃 Activity Tracker
- **15 activity cards** with emoji, name, MET value — click to select
- Duration input (minutes)
- Calorie burn calculation: `MET × Weight(kg) × Duration(hours)`
- **Today's activity log** with running total of calories burnt

### 6. 👨‍⚕️ Nutritionists
- Nutritionist cards with avatar, name, specialization, bio, rating, reviews, patient count, experience, specialty badges
- Inline booking form: date picker, time slot dropdown (8 slots), notes textarea
- **My Appointments** section with status badges (pending/confirmed/completed)

---

## 🔐 Authentication & RBAC

### Authentication Flow
1. **Registration** (`/register`) — User provides name, email, password, role
2. Password hashed with `bcryptjs` before storage
3. **Login** (`/login`) — Credentials provider via NextAuth.js
4. JWT token issued with `{ id, role }` payload
5. Session available client-side via `useSession()` hook
6. **Role-based redirect**: after login, user is routed to their role's dashboard

### Role-Based Access Control

| Role | Dashboard Path | Access Level |
|------|---------------|-------------|
| `user` | `/dashboard/user` | Full nutrition features (meal plans, recipes, tracking, appointments) |
| `consultant` | `/dashboard/consultant` | Patient management, diet plan review |
| `trainer` | `/dashboard/trainer` | Client fitness tracking, macro monitoring |
| `admin` | `/dashboard/admin` | Full system access, user management, platform analytics |

### Middleware Enforcement (`middleware.ts`)
```typescript
// NextAuth withAuth middleware — runs on all /dashboard/* routes
// Checks token.role against the requested dashboard path
// Unauthorized users are rewritten to /unauthorized
```

---

## 📁 Project Structure

```
Nutrilife/
│
├── app/                                    # Next.js App Router
│   ├── page.tsx                            # Landing page (Hero, Services, Diet Generator, Booking)
│   ├── layout.tsx                          # Root layout with SessionProvider
│   ├── globals.css                         # Global styles (Tailwind)
│   │
│   ├── login/page.tsx                      # Login with role-based redirect
│   ├── register/page.tsx                   # Registration with role selection
│   ├── book/page.tsx                       # Public booking page
│   │
│   ├── dashboard/
│   │   ├── page.tsx                        # Dashboard overview
│   │   ├── user/page.tsx                   # ★ Main user dashboard (6 sections, 770+ lines)
│   │   ├── admin/page.tsx                  # Admin dashboard
│   │   ├── consultant/page.tsx             # Consultant dashboard
│   │   └── trainer/page.tsx                # Trainer dashboard
│   │
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts      # NextAuth handler
│       │   └── register/route.ts           # User registration
│       │
│       ├── ai/
│       │   ├── generate-plan/route.ts      # ML + Recipe DB + Groq AI meal plan
│       │   ├── modify-plan/route.ts        # Adaptive plan modification
│       │   ├── recipe-from-ingredients/route.ts  # AI recipe generation
│       │   └── activity-calories/route.ts  # MET-based calorie tracking
│       │
│       ├── recipes/route.ts                # Recipe CRUD (GET with filters, POST by dietType)
│       ├── nutritionists/route.ts          # Nutritionist directory (auto-seeds)
│       └── appointments/route.ts           # Appointment booking (CRUD)
│
├── components/                             # Reusable React components
│   ├── Hero.tsx                            # Landing page hero section with animations
│   ├── Navbar.tsx                          # Navigation bar with auth state
│   ├── Footer.tsx                          # Site footer with links
│   ├── Services.tsx                        # Services showcase section
│   ├── DietGenerator.tsx                   # Diet recommendation form
│   ├── Nutritionists.tsx                   # Nutritionist cards display
│   ├── BookingForm.tsx                     # Appointment booking form
│   ├── Providers.tsx                       # NextAuth SessionProvider wrapper
│   ├── DashboardSidebar.tsx                # Consultant dashboard sidebar
│   ├── DashboardStats.tsx                  # Animated stat counter cards
│   ├── AppointmentsTable.tsx               # Appointments data table
│   └── UsersTable.tsx                      # Users data table (admin)
│
├── lib/
│   ├── auth/authOptions.ts                 # NextAuth configuration (JWT, Credentials)
│   ├── db/mongodb.ts                       # MongoDB connection with caching
│   ├── models/
│   │   ├── User.ts                         # User model (auth + health profile)
│   │   ├── MealPlan.ts                     # Daily meal plans with consumption tracking
│   │   ├── Recipe.ts                       # Recipe model (docx schema)
│   │   ├── ActivityLog.ts                  # Activity/exercise logs
│   │   ├── Nutritionist.ts                # Nutritionist profiles
│   │   └── Appointment.ts                 # Consultation bookings
│   └── seed/
│       └── recipes.json                    # 25+ recipes seed data
│
├── ml-service/                             # Python ML microservice
│   ├── train.py                            # Model training (GridSearchCV + Pipeline)
│   ├── main.py                             # FastAPI server (/predict endpoint)
│   ├── diet_recommendations_dataset.csv    # Training dataset (1000 records)
│   ├── nutrilife_pipeline.pkl              # Trained model (Pipeline + RandomForest)
│   ├── target_encoder.pkl                  # LabelEncoder for diet categories
│   ├── model.pkl                           # Legacy model (deprecated)
│   └── requirements.txt                    # Python dependencies
│
├── types/
│   └── next-auth.d.ts                      # NextAuth TypeScript augmentation
│
├── middleware.ts                           # RBAC middleware (protects /dashboard/*)
├── .env.local                              # Environment variables
├── next.config.ts                          # Next.js configuration
├── tsconfig.json                           # TypeScript configuration
├── postcss.config.mjs                      # PostCSS (Tailwind)
├── eslint.config.mjs                       # ESLint configuration
└── package.json                            # Node.js dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18+ | `node --version` |
| Python | 3.8+ | `python3 --version` |
| MongoDB | 6+ | `mongosh --eval "db.runCommand({ping:1})"` |
| pip | Latest | `pip3 --version` |

### Step 1: Clone & Install Node Dependencies

```bash
git clone <repository-url>
cd Nutrilife
npm install
```

### Step 2: Set Up Environment Variables

Create `.env.local` in the project root:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/nutrilife
GROQ_API_KEY=your-groq-api-key-here
ML_SERVICE_URL=http://localhost:8000
```

> **Get a Groq API key** at [console.groq.com](https://console.groq.com) — it's free for development.

### Step 3: Start MongoDB

```bash
# If using Homebrew (macOS):
brew services start mongodb-community

# Or manually:
mongod --dbpath /path/to/data/db
```

### Step 4: Train & Start the ML Service

```bash
cd ml-service

# Install Python dependencies
pip3 install -r requirements.txt

# Train the model (generates .pkl files)
python3 train.py

# Start the FastAPI server
python3 -m uvicorn main:app --reload --port 8000
```

You should see:
```
✅ Model and encoder loaded successfully.
   Diet classes: ['Balanced', 'Low_Carb', 'Low_Sodium']
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 5: Start the Next.js Dev Server

```bash
# In a new terminal, from the project root
npm run dev
```

You should see:
```
▲ Next.js 16.1.6 (Turbopack)
- Local: http://localhost:3000
✓ Ready in 381ms
```

### Step 6: Use the Application

1. Open `http://localhost:3000`
2. Click **"Create one free"** to register (select role: User)
3. Log in → you'll be routed to `/dashboard/user`
4. Go to **AI Meal Plan** → fill health profile → click **Generate**
5. Browse **Recipe Browser** → filter by diet/cuisine/type
6. Try **Recipe Finder** → enter ingredients → get AI recipe
7. Use **Activity Tracker** → select activity & duration → log burn
8. Visit **Nutritionists** → browse experts → book appointment

---

## 🔑 Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXTAUTH_SECRET` | ✅ | JWT encryption secret (any random string) | `mysecretkey123` |
| `NEXTAUTH_URL` | ✅ | Application base URL | `http://localhost:3000` |
| `MONGODB_URI` | ✅ | MongoDB connection string | `mongodb://localhost:27017/nutrilife` |
| `GROQ_API_KEY` | ✅ | Groq API key for LLaMA 3.3 70B access | `gsk_...` |
| `ML_SERVICE_URL` | ✅ | FastAPI ML service URL | `http://localhost:8000` |

---

## 🏃 Activity Tracking (MET Reference Table)

The activity tracker uses scientifically-established MET (Metabolic Equivalent of Task) values:

| Activity | MET | Emoji | Cal/hr (70kg person) |
|----------|-----|-------|---------------------|
| Walking (moderate) | 3.5 | 🚶 | 245 |
| Jogging | 7.0 | 🏃 | 490 |
| Running (fast) | 9.8 | 🏃‍♂️ | 686 |
| Cycling | 7.5 | 🚴 | 525 |
| Swimming | 6.0 | 🏊 | 420 |
| Yoga | 3.0 | 🧘 | 210 |
| Weight Training | 5.0 | 🏋️ | 350 |
| HIIT Workout | 8.0 | ⚡ | 560 |
| Dancing | 5.5 | 💃 | 385 |
| Jump Rope | 12.3 | ⏩ | 861 |
| Stretching | 2.3 | 🤸 | 161 |
| Pilates | 3.8 | 🧘‍♀️ | 266 |
| Hiking | 6.5 | 🥾 | 455 |
| Basketball | 6.5 | 🏀 | 455 |
| Football/Soccer | 8.0 | ⚽ | 560 |

**Formula**: `Calories Burnt = MET × Weight(kg) × Duration(hours)`

---

## 📜 License

This project is developed for educational and academic purposes.

---

<p align="center">
  Built with ❤️ using <b>Next.js 16</b> · <b>React 19</b> · <b>MongoDB</b> · <b>FastAPI</b> · <b>scikit-learn</b> · <b>Groq AI</b>
</p>
