import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'

import { StudentDashboard } from './pages/StudentDashboard'
import { TeacherDashboard } from './pages/TeacherDashboard'
import AdminDashboard  from './pages/admin/AdminDashboard'
import { MarkAttendance } from './pages/MarkAttendance'
import { Login } from './pages/Login'
import { AdminCourses } from './pages/admin/Courses'
import { AdminSubjects } from './pages/admin/Subjects'
import { AdminClasses } from './pages/admin/Classes'
import { Layout } from './components/Layout'
import { Signup } from './pages/Signup'
import { StudentAttendanceRecord } from './pages/StudentAttendanceRecord'
import { ProtectedRoute } from './components/ProtectedRoute'

import type { JSX } from 'react'

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/signup" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* student routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAttendanceRecord />
                </ProtectedRoute>
              }
            />

            {/* teacher routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/mark"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <MarkAttendance />
                </ProtectedRoute>
              }
            />

            {/* admin routes */}

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
              />
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subjects"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSubjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminClasses />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Provider>
    </BrowserRouter>
  )
}
