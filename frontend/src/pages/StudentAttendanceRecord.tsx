import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store/store'
import { useEffect } from 'react'
import { fetchAttendanceByStudent } from '../features/attendance/attendanceSlice'
import { fetchSubjects } from '../features/subject/subjectSlice'
import { fetchClasses } from '../features/class/classSlice'

export function StudentAttendanceRecord(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>()

  // Selectors
  const user = useSelector((state: RootState) => state.user.user)
  const { records,  error } = useSelector((state: RootState) => state.attendance)
  const { subjects } = useSelector((state: RootState) => state.subject)
  const { offerings } = useSelector((state: RootState) => state.class)

  // Load attendance 
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAttendanceByStudent(user.id))
    }
    if (subjects.length === 0) dispatch(fetchSubjects())
    if (offerings.length === 0) dispatch(fetchClasses())
  }, [user, dispatch])

  // find subject 
  const getSubjectName = (classId: string) => {
    const cls = offerings.find(c => c.id === classId)
    if (!cls) return ''
    const subj = subjects.find(s => s.id === cls.subject)
    return subj ? subj.name : ''
  }

  if (status ==='loading') {
    return <div className="p-8 text-center">Loading attendance...</div>
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Back Button */}
          <Link 
            to="/student" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>

          {/* Course Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Attendance Record
            </h1>
            <h2 className="text-xl font-bold text-gray-900">Student: {user?.name}</h2>
          </div>

          {/* Attendance Table */}
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-3 border-b">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-600">
                <div>DATE</div>
                <div>SUBJECT</div>
                <div>STATUS</div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {records.map(record => (
                <div key={record.id} className="px-4 py-3">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    {/* Date */}
                    <div className="text-gray-900">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>

                    {/* Subject */}
                    <div className="text-gray-700">
                      {getSubjectName(record.classId)}
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        record.status === 'present' 
                          ? 'bg-green-500 text-white' 
                          : record.status === 'absent' 
                            ? 'bg-red-500 text-white' 
                            : record.status === 'late' 
                              ? 'bg-yellow-500 text-white' 
                              : 'bg-blue-500 text-white'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {records.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-500">
                  No attendance records found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
