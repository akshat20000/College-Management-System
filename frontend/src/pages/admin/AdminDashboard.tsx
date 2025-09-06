import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../../store/store'
import { fetchCourses } from '../../features/course/courseSlice'
import { fetchSubjects } from '../../features/subject/subjectSlice.ts'
import { fetchClasses } from '../../features/class/classSlice.ts'

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  // Redux state
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user)
  const { courses } = useSelector((state: RootState) => state.course)
  const { subjects } = useSelector((state: RootState) => state.subject)
  const { offerings } = useSelector((state: RootState) => state.class)

  // Create dropdown state
  const [showCreateDropdown, setShowCreateDropdown] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login', { replace: true })
    } else {
      // Fetch data
      dispatch(fetchCourses())
      dispatch(fetchSubjects())
      dispatch(fetchClasses())
    }
  }, [isAuthenticated, user, navigate, dispatch])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

        {/* Create button */}
        <div className="relative">
          <button
            onClick={() => setShowCreateDropdown(!showCreateDropdown)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Create
          </button>

          {showCreateDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border shadow-lg rounded transition-all duration-300">
              <button onClick={() => navigate('/admin/courses')}
                className="block w-full text-left px-4 py-2 hover:bg-purple-100">New Course</button>
              <button onClick={() => navigate('/admin/subjects')}
                className="block w-full text-left px-4 py-2 hover:bg-purple-100">New Subject</button>
              <button onClick={() => navigate('/admin/classes')}
                className="block w-full text-left px-4 py-2 hover:bg-purple-100">New Class</button>
            </div>
          )}
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white shadow rounded-lg hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">Courses ({courses.length})</h2>
          <ul className="mt-2 text-gray-600 list-disc list-inside">
            {courses.map((course: any) => (
              <li key={course.id}>{course.name}</li>))}
          </ul>
        </div>

        <div className="p-6 bg-white shadow rounded-lg hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">Subjects ({subjects.length})</h2>
          <ul className="mt-2 text-gray-600 list-disc list-inside">
            {subjects.map((subject: any) => (<li key={subject.id}>{subject.name}</li>))}
          </ul>
        </div>

        <div className="p-6 bg-white shadow rounded-lg hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">Classes ({offerings.length})</h2>
          <ul className="mt-2 text-gray-600 list-disc list-inside">
            
            {offerings.map((cls: any) => {
              const subjectName = subjects.find(s => s._id === cls.subject._id)?.name || 'Unnamed Class';
              
              return <li key={cls.id}>{subjectName}</li>;
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 