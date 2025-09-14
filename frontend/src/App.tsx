import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import { Provider , useDispatch, useSelector} from 'react-redux'
import { store , type RootState, type AppDispatch} from './store/store'

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
import { refreshToken } from './features/Auth/authSlice';

import  { type JSX,useEffect } from 'react'


function AppContent(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  const { loading: authLoading, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(refreshToken());
    }
  }, [dispatch]);

  if (authLoading && token) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Loading session...</div>
      </div>
    );
  }

return (
    
      
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
              path="/student/attendance/:classId"
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
              path="/teacher/mark/:subjectId"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <MarkAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/class/:classId"
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
          </Routes>
        </Layout>
      
    
  )

}

export default function App(): JSX.Element {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}
