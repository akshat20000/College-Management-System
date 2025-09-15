import { useState } from 'react'
import type { JSX, FormEvent } from 'react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { authService } from '../services/authServices'
import { useNavigate, Link } from 'react-router-dom'

// ✅ Validation helpers
const isEmail = (value: string): boolean =>
  /^[A-Za-z0-9._%+-]+@university\.edu\.in$/.test(value)

const isStrongPassword = (value: string): boolean =>
  /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(value)

export function Signup(): JSX.Element {
  const navigate = useNavigate()
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    program: '',
    department: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ✅ Generic form handler
  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}

    if (!form.name.trim()) next.name = 'Name is required'
    else if (form.name.trim().length < 2) next.name = 'Name must be at least 2 characters'

    if (!form.email.trim()) next.email = 'Email is required'
    else if (!isEmail(form.email.trim())) next.email = 'Enter a valid university email'

    if (!form.password) next.password = 'Password is required'
    else if (!isStrongPassword(form.password)) {
      next.password =
        'Password must be 8+ chars, include one uppercase & one special character'
    }

    if (role === 'student' && !form.program.trim())
      next.program = 'Program is required for students'

    if (role === 'teacher' && !form.department.trim())
      next.department = 'Department is required for teachers'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
        program: role === 'student' ? form.program.trim() : undefined,
        department: role === 'teacher' ? form.department.trim() : undefined
      }

      const response = await authService.register(payload)
      authService.setCurrentUser(response.user)

      navigate(role === 'student' ? '/student' : '/teacher', { replace: true })
    } catch (err: any) {
      setErrors({ api: err.response?.data?.message || 'Signup failed' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-teal-600 flex-col justify-between p-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Join Us</h1>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Create Your Account</h2>
          <p className="text-gray-200 text-lg">
            Join our community and stay on top of your academic progress.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Get Started</h2>
            <p className="mt-2 text-gray-600">It's quick and easy.</p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            {/* Name */}
            <FormField
              label="Full Name"
              value={form.name}
              onChange={val => handleChange('name', val)}
              placeholder="Full Name"
              error={errors.name}
            />

            {/* Email */}
            <FormField
              label="Email Address"
              type="email"
              value={form.email}
              onChange={val => handleChange('email', val)}
              placeholder="you@university.edu.in"
              error={errors.email}
            />

            {/* Password */}
            <FormField
              label="Password"
              type="password"
              value={form.password}
              onChange={val => handleChange('password', val)}
              placeholder="••••••••"
              error={errors.password}
            />

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as 'student' | 'teacher')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            {/* Program / Department */}
            {role === 'student' ? (
              <FormField
                label="Program"
                value={form.program}
                onChange={val => handleChange('program', val)}
                placeholder="BE CSE"
                error={errors.program}
              />
            ) : (
              <FormField
                label="Department"
                value={form.department}
                onChange={val => handleChange('department', val)}
                placeholder="CSE"
                error={errors.department}
              />
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
              <Link
                to="/login"
                className="text-teal-600 hover:text-teal-500 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 🔹 Small reusable field wrapper */
function FormField({
  label,
  type = 'text',
  value,
  placeholder,
  onChange,
  error
}: {
  label: string
  type?: string
  value: string
  placeholder?: string
  error?: string
  onChange: (val: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
