'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { 
  UserPlus, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Database,
  Key,
  Mail,
  Phone,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateAdminDirectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [result, setResult] = useState<any>(null)

  const [adminData, setAdminData] = useState({
    fullName: 'System Administrator',
    email: 'admin@loanhub.com',
    phone: '+254700000000',
    nationalId: 'ADMIN001',
    kraPin: 'ADMIN001',
    password: 'Admin@LoanHub2024!'
  })

  const createAdminDirectly = async () => {
    setIsLoading(true)
    setStep(2)

    try {
      // This would typically call a server-side function
      // For now, we'll show the SQL commands to run
      const sqlCommands = `
-- Create Admin User in Supabase (FIXED VERSION)
-- Run this in Supabase SQL Editor

-- Step 1: Create admin user (minimal fields only)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  '${adminData.email}',
  crypt('${adminData.password}', gen_salt('bf')),
  NOW(),
  '{"role": "admin", "full_name": "${adminData.fullName}"}',
  NOW(),
  NOW()
);

-- Step 2: Create user profile
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id FROM auth.users WHERE email = '${adminData.email}';
  
  -- Insert into public.users table
  INSERT INTO public.users (
    id,
    full_name,
    national_id,
    phone_number,
    email,
    kra_pin,
    password_hash,
    role,
    status,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    '${adminData.fullName}',
    '${adminData.nationalId}',
    '${adminData.phone}',
    '${adminData.email}',
    '${adminData.kraPin}',
    crypt('${adminData.password}', gen_salt('bf')),
    'admin',
    'active',
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
END $$;

-- Step 3: Verify creation
SELECT 
  'Admin User Created Successfully' as status,
  u.email,
  u.raw_user_meta_data->>'role' as auth_role,
  p.role as profile_role,
  p.full_name,
  p.status
FROM auth.users u
LEFT JOIN public.users p ON u.id = p.id
WHERE u.email = '${adminData.email}';
      `

      setResult({
        success: true,
        sqlCommands,
        message: 'Admin user SQL commands generated successfully!'
      })

      setStep(3)
      toast.success('SQL commands generated! Copy and run in Supabase SQL Editor.')

    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      })
      setStep(3)
      toast.error('Failed to generate admin creation commands')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('SQL commands copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const testAdminLogin = () => {
    toast.success('Test login: Use the credentials above to sign in at /auth/signin')
    router.push('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Admin User Directly in Supabase
          </h1>
          <p className="text-gray-600">
            Generate SQL commands to create an admin user directly in the database
          </p>
        </div>

        {/* Step 1: Admin Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-blue-600" />
                Admin User Details
              </CardTitle>
              <CardDescription>
                Enter the details for the admin user to be created
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={adminData.fullName}
                    onChange={(e) => setAdminData({...adminData, fullName: e.target.value})}
                    placeholder="System Administrator"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={adminData.email}
                    onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                    placeholder="admin@loanhub.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={adminData.phone}
                    onChange={(e) => setAdminData({...adminData, phone: e.target.value})}
                    placeholder="+254700000000"
                  />
                </div>
                <div>
                  <Label htmlFor="nationalId">National ID</Label>
                  <Input
                    id="nationalId"
                    value={adminData.nationalId}
                    onChange={(e) => setAdminData({...adminData, nationalId: e.target.value})}
                    placeholder="ADMIN001"
                  />
                </div>
                <div>
                  <Label htmlFor="kraPin">KRA PIN</Label>
                  <Input
                    id="kraPin"
                    value={adminData.kraPin}
                    onChange={(e) => setAdminData({...adminData, kraPin: e.target.value})}
                    placeholder="ADMIN001"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={adminData.password}
                    onChange={(e) => setAdminData({...adminData, password: e.target.value})}
                    placeholder="Strong password"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Important Notes</h4>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• Use a strong password with uppercase, lowercase, numbers, and special characters</li>
                      <li>• The email must be unique and not already registered</li>
                      <li>• Phone number should be in international format (+254XXXXXXXXX)</li>
                      <li>• National ID and KRA PIN should be unique identifiers</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                onClick={createAdminDirectly} 
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Database className="h-5 w-5 mr-2 animate-spin" />
                    Generating SQL Commands...
                  </>
                ) : (
                  <>
                    <Key className="h-5 w-5 mr-2" />
                    Generate SQL Commands
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Loading */}
        {step === 2 && (
          <Card>
            <CardContent className="text-center py-12">
              <Database className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Generating SQL Commands
              </h3>
              <p className="text-gray-600">
                Creating database commands for admin user creation...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                {result.success ? 'SQL Commands Generated' : 'Error Occurred'}
              </CardTitle>
              <CardDescription>
                {result.success 
                  ? 'Copy the SQL commands below and run them in Supabase SQL Editor'
                  : 'An error occurred while generating the commands'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {result.success ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800">Next Steps</h4>
                        <ol className="text-sm text-green-700 mt-1 space-y-1 list-decimal list-inside">
                          <li>Copy the SQL commands below</li>
                          <li>Go to your Supabase Dashboard</li>
                          <li>Navigate to SQL Editor</li>
                          <li>Paste and run the commands</li>
                          <li>Test login with the admin credentials</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold">SQL Commands</Label>
                      <Button 
                        onClick={() => copyToClipboard(result.sqlCommands)}
                        size="sm"
                        variant="outline"
                      >
                        Copy to Clipboard
                      </Button>
                    </div>
                    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
                      {result.sqlCommands}
                    </pre>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Admin Credentials</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><strong>Email:</strong> {adminData.email}</p>
                      <p><strong>Password:</strong> {adminData.password}</p>
                      <p><strong>Role:</strong> admin</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={testAdminLogin} className="flex-1">
                      Test Admin Login
                    </Button>
                    <Button 
                      onClick={() => setStep(1)} 
                      variant="outline"
                      className="flex-1"
                    >
                      Create Another Admin
                    </Button>
                  </div>
                </>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800">Error</h4>
                      <p className="text-sm text-red-700 mt-1">{result.error}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Supabase Dashboard</h4>
                <p className="text-gray-600">
                  Go to your Supabase project dashboard and navigate to the SQL Editor to run the generated commands.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Alternative Method</h4>
                <p className="text-gray-600">
                  You can also create admin users through the Authentication section in Supabase Dashboard.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
