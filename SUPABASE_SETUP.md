# Supabase Setup Guide

## Current Status
The system is currently using a **mock authentication system** for development. To use real Supabase, follow these steps:

## 🔧 **Option 1: Keep Mock System (Current)**
- ✅ **Pros**: No setup required, works immediately
- ✅ **Data Persistence**: Users are saved to localStorage
- ✅ **Development**: Perfect for testing and development
- ❌ **Limitations**: Data lost if localStorage is cleared

## 🚀 **Option 2: Enable Real Supabase**

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### Step 2: Set Up Environment Variables
Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Switch to Real Supabase
In `src/lib/supabase.ts`, change:

```typescript
// Current (Mock)
export const supabase = mockSupabase

// Change to (Real Supabase)
export const supabase = supabaseClient
```

### Step 4: Set Up Database
1. Go to SQL Editor in Supabase dashboard
2. Copy and paste the contents of `src/lib/database-schema.sql`
3. Execute the SQL to create tables

### Step 5: Configure Authentication
1. Go to Authentication > Settings in Supabase
2. Enable email confirmations
3. Set up redirect URLs

## 🔄 **Hybrid Approach (Recommended)**

You can keep the mock system for development and use Supabase for production:

```typescript
// In src/lib/supabase.ts
const isDevelopment = process.env.NODE_ENV === 'development'

export const supabase = isDevelopment ? mockSupabase : supabaseClient
```

## 📊 **Comparison**

| Feature | Mock System | Real Supabase |
|---------|-------------|---------------|
| Setup Time | 0 minutes | 15-30 minutes |
| Data Persistence | localStorage | Database |
| User Management | Basic | Full-featured |
| Authentication | Simple | Advanced |
| Scalability | Limited | Unlimited |
| Production Ready | No | Yes |

## 🎯 **Recommendation**

For **development and testing**: Keep the mock system
For **production deployment**: Switch to real Supabase

The mock system is working perfectly for development and includes all the features you need!
