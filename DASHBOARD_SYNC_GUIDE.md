# Sync Authentication Users with Website Dashboard

## 🎯 **Goal: Show All Auth Users in Your Website Dashboard**

Your website dashboard should display all users from Supabase Authentication in the user management section.

## 🔧 **Database Setup**

### **Step 1: Run the Sync Script**
Use `sync-auth-to-dashboard.sql` to sync all authentication users to your dashboard:

```sql
-- This script will:
-- ✅ Sync all existing auth.users to public.users
-- ✅ Create auto-sync trigger for future users
-- ✅ Ensure users appear in your dashboard
-- ✅ Handle role synchronization
```

### **Step 2: Verify Sync**
Use `ensure-dashboard-sync.sql` to check if sync is working:

```sql
-- This script will:
-- ✅ Check sync status
-- ✅ Show missing users
-- ✅ Sync any missing users
-- ✅ Verify complete sync
```

## 🚀 **Application Implementation**

### **Step 1: Update Your Dashboard Query**
In your website dashboard, query users from `public.users`:

```javascript
// In your dashboard component
const { data: users, error } = await supabase
  .from('users')
  .select('*')
  .order('created_at', { ascending: false })

if (error) {
  console.error('Error fetching users:', error)
}
```

### **Step 2: Display Users in Dashboard**
```jsx
// User management component
function UserManagement() {
  const [users, setUsers] = useState([])
  
  useEffect(() => {
    fetchUsers()
  }, [])
  
  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data)
  }
  
  return (
    <div>
      <h2>User Management</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Phone</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td>
                <span className={`role ${user.role}`}>
                  {user.role}
                </span>
              </td>
              <td>
                <span className={`status ${user.status}`}>
                  {user.status}
                </span>
              </td>
              <td>{user.phone_number}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### **Step 3: Handle Role Updates**
When you update a user's role in the dashboard, also update it in authentication:

```javascript
// Update user role
const updateUserRole = async (userId, newRole) => {
  // Update in public.users
  const { error: publicError } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId)
  
  if (publicError) {
    console.error('Error updating public role:', publicError)
    return
  }
  
  // Update in auth.users (requires admin privileges)
  const { error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    { 
      user_metadata: { 
        role: newRole 
      } 
    }
  )
  
  if (authError) {
    console.error('Error updating auth role:', authError)
  }
}
```

## ✅ **What This Achieves**

### **For Users:**
- ✅ **All authentication users** appear in dashboard
- ✅ **Real-time sync** when new users sign up
- ✅ **Role management** works properly
- ✅ **User status** is visible

### **For Admins:**
- ✅ **Complete user list** in dashboard
- ✅ **Role management** interface
- ✅ **User status** control
- ✅ **Phone numbers** and contact info

### **For Application:**
- ✅ **Consistent data** between auth and dashboard
- ✅ **Auto-sync** for new users
- ✅ **Role-based access** control
- ✅ **User management** functionality

## 🔍 **Verification Steps**

### **1. Check Database Sync:**
```sql
-- Run this to verify sync
SELECT 
  'Sync Status:' as info,
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.users) as dashboard_users,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.users) 
    THEN 'SYNC COMPLETE'
    ELSE 'SYNC INCOMPLETE'
  END as status;
```

### **2. Check Dashboard Display:**
- ✅ All users appear in user management
- ✅ Roles are displayed correctly
- ✅ New users appear automatically
- ✅ Role updates work properly

## 🚨 **Troubleshooting**

### **If users don't appear in dashboard:**
1. Run `ensure-dashboard-sync.sql`
2. Check if `public.users` table exists
3. Verify your dashboard queries `public.users`

### **If roles don't sync:**
1. Check the trigger is working
2. Verify role updates in both tables
3. Ensure your app checks the right table

### **If new users don't appear:**
1. Check if the trigger exists
2. Verify trigger function works
3. Test with a new user signup

This setup ensures your website dashboard always shows all authentication users with proper role management!
