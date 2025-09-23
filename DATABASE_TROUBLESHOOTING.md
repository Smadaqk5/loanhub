# Database Troubleshooting Guide

## Common "Database error querying schema" Issues

### 1. **Connection Issues**
- Check if you're connected to the right Supabase project
- Verify your database URL and credentials
- Ensure you have proper permissions

### 2. **Schema Access Issues**
- The `information_schema` might not be accessible
- Try running simpler queries first
- Check if you're in the right database

### 3. **Table Doesn't Exist**
- The `users` table might not exist yet
- Run the table creation scripts first
- Check if you're looking in the right schema

## Step-by-Step Troubleshooting

### Step 1: Test Basic Connection
Run `basic-connection-test.sql`:
```sql
SELECT 'Hello Database!' as message;
SELECT NOW() as current_time;
```

### Step 2: Test Schema Access
Run `simple-database-test.sql`:
```sql
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Step 3: Create Users Table
If the table doesn't exist, run `create-users-table-simple.sql`:
```sql
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    -- ... other columns
);
```

### Step 4: Verify Table Structure
```sql
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public';
```

## Common Solutions

### Solution 1: Refresh Database Connection
- Go to Supabase Dashboard
- Refresh the page
- Try running queries again

### Solution 2: Check Database URL
- Verify you're in the right project
- Check environment variables
- Ensure credentials are correct

### Solution 3: Create Missing Tables
- Run the table creation scripts
- Check for any syntax errors
- Verify all required columns exist

### Solution 4: Check Permissions
- Ensure you have admin access
- Check RLS policies
- Verify table permissions

## Error Messages and Solutions

| Error | Solution |
|-------|----------|
| "relation does not exist" | Create the missing table |
| "permission denied" | Check user permissions |
| "schema does not exist" | Verify database connection |
| "column does not exist" | Add missing columns |

## Quick Fixes

### If Users Table Missing:
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### If Role Column Missing:
```sql
ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user';
```

### If Status Column Missing:
```sql
ALTER TABLE public.users ADD COLUMN status TEXT DEFAULT 'active';
```

## Testing Your Fix

After making changes, test with:
```sql
SELECT 'Test successful' as status,
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public';
```
