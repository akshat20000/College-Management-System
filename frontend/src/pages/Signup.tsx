import  { useState } from 'react'
import type { JSX, FormEvent } from 'react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { authService } from '../services/authServices'
import { useNavigate, Link } from 'react-router-dom'

function isEmail(value: string): boolean {
  return /.+@.+\..+/.test(value)
}

export function Signup(): JSX.Element {
  const navigate = useNavigate()
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [program, setProgram] = useState('')
  const [department, setDepartment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Name is required'
    else if (name.trim().length < 2) next.name = 'Name must be at least 2 characters'

    if (!email.trim()) next.email = 'Email is required'
    else if (!isEmail(email.trim())) next.email = 'Enter a valid email'

    if (!password) next.password = 'Password is required'
    else if (password.length < 8) next.password = 'Password must be at least 8 characters'

    if (role === 'student') {
      if (!program.trim()) next.program = 'Program is required for students'
    } else {
      if (!department.trim()) next.department = 'Department is required for teachers'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      program: role === 'student' ? program.trim() : undefined,
      department: role === 'teacher' ? department.trim() : undefined,
    }

    
     try {
    const response = await authService.register(payload)
    console.log('Registered user:', response.user)

   
    authService.setCurrentUser(response.user)

    
    navigate(role === 'student' ? '/student' : '/teacher', { replace: true })
  } catch (err: any) {
    console.error('Signup failed:', err.response?.data || err.message)
    setErrors({ api: err.response?.data?.message || 'Signup failed' })
  } finally {
    setSubmitting(false)
  }
}

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Promotional */}
      <div className="hidden lg:flex lg:w-2/5 bg-teal-600 flex-col justify-between p-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Join Us</h1>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Create Your Account</h2>
          <p className="text-gray-200 text-lg">Join our community and stay on top of your academic progress.</p>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Get Started</h2>
            <p className="mt-2 text-gray-600">It's quick and easy.</p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <Input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="John Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                type="email" 
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                type="password" 
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            {role === 'student' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program
                </label>
                <Input 
                  value={program} 
                  onChange={e => setProgram(e.target.value)} 
                  placeholder="BE CSE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                {errors.program && <p className="mt-1 text-sm text-red-600">{errors.program}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <Input 
                  value={department} 
                  onChange={e => setDepartment(e.target.value)} 
                  placeholder="CSE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
              </div>
            )}
             {errors.api && <p className="text-red-600">{errors.api}</p>}
            <Button 
              disabled={submitting} 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              {submitting ? 'Creating…' : 'Sign Up'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}