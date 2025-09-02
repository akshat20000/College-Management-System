import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store/store'
import { fetchAttendanceByStudent } from '../features/attendance/attendanceSlice'
import { fetchSubjects } from '../features/subject/subjectSlice'
import { fetchClasses } from '../features/class/classSlice'
import type { ClassOffering, Subject } from '../types'

export function StudentDashboard(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>()

  // Redux state
  const user = useSelector((state: RootState) => state.user.user)
  const { records: attendanceRecords, status: attendanceStatus, error: attendanceError } = useSelector((state: RootState) => state.attendance)
  const { subjects: subjectsState } = useSelector((state: RootState) => state.subject)
  const { offerings: classesState, status: classStatus } = useSelector((state: RootState) => state.class)

  // Fetch all necessary data on mount
  useEffect(() => {
    if (!user?.id) return

    // Attendance
    dispatch(fetchAttendanceByStudent(user.id))

    // Subjects
    if (!subjectsState || Object.keys(subjectsState).length === 0) {
      dispatch(fetchSubjects())
    }

    // Classes
    if (!classesState || classesState.length === 0) {
      dispatch(fetchClasses())
    }
  }, [user, dispatch, subjectsState, classesState])

  // Attendance statistics
  const presentCount = attendanceRecords.filter(a => a.status === 'present').length
  const absentCount = attendanceRecords.filter(a => a.status === 'absent').length
  const lateCount = attendanceRecords.filter(a => a.status === 'late').length
  const excusedCount = attendanceRecords.filter(a => a.status === 'excused').length
  const totalCount = attendanceRecords.length || 1

  // Loading/Error UI
  if (attendanceStatus === 'loading' || classStatus === 'loading') {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (attendanceError) {
    return <div className="p-8 text-center text-red-500">Error: {attendanceError}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Attendance Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Overall Attendance</h2>

            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="8"
                    strokeDasharray={`${(presentCount / totalCount) * 251.2} 251.2`} strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#EF4444" strokeWidth="8"
                    strokeDasharray={`${(absentCount / totalCount) * 251.2} 251.2`}
                    strokeDashoffset={`-${(presentCount / totalCount) * 251.2}`} />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="8"
                    strokeDasharray={`${(lateCount / totalCount) * 251.2} 251.2`}
                    strokeDashoffset={`-${((presentCount + absentCount) / totalCount) * 251.2}`} />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="8"
                    strokeDasharray={`${(excusedCount / totalCount) * 251.2} 251.2`}
                    strokeDashoffset={`-${((presentCount + absentCount + lateCount) / totalCount) * 251.2}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round((presentCount / totalCount) * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">Present</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3"><div className="w-4 h-4 bg-green-500 rounded"></div><span>Present</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 bg-red-500 rounded"></div><span>Absent</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 bg-yellow-500 rounded"></div><span>Late</span></div>
              <div className="flex items-center gap-3"><div className="w-4 h-4 bg-blue-500 rounded"></div><span>Excused</span></div>
            </div>
          </div>

          {/* My Classes Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">My Classes</h2>

            <div className="space-y-4">
              {classesState.map((cls: ClassOffering) => {
                const subj: Subject | undefined = subjectsState.find(s => s.id === cls.subject);
                return (
                  <div key={cls.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="font-bold text-gray-900">
                      {subj ? subj.name : cls.subject} - {cls.academicYear}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Teacher: {cls.primaryTeacher}
                    </div>
                    <div className="mt-3">
                      <Link
                        to={`/student/attendance/${cls.id}`}
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition duration-200"
                      >
                        View Attendance
                      </Link>
                    </div>
                  </div>
                )
              })}

              {classesState.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No classes enrolled yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
