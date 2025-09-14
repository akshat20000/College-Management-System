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
  const { subjects: subjectsState, status: subjectsStatus } = useSelector((state: RootState) => state.subject)
  const { offerings: classesState, status: classStatus } = useSelector((state: RootState) => state.class)

  // Fetch all necessary data on mount
  useEffect(() => {
    if (!user?.id) return

    // Fetch attendance records for the student
    dispatch(fetchAttendanceByStudent(user.id))


    // Fetch subjects if not loaded
    if (subjectsStatus === 'idle') {
      dispatch(fetchSubjects())
    }

    // Fetch classes if not loaded
    if (classStatus === 'idle') {
      dispatch(fetchClasses())
    }
  }, [user?.id, dispatch, subjectsStatus, classStatus])

  // Filter classes that the student is enrolled in
  const studentClasses = classesState.filter((cls: ClassOffering) => 
    cls.students && cls.students.includes(user?.id || '')
  )

  // Attendance statistics - handle empty array
  const hasAttendanceData = attendanceRecords && attendanceRecords.length > 0
  const presentCount = hasAttendanceData ? attendanceRecords.filter(a => a.status === 'present').length : 0
  const absentCount = hasAttendanceData ? attendanceRecords.filter(a => a.status === 'absent').length : 0
  const lateCount = hasAttendanceData ? attendanceRecords.filter(a => a.status === 'late').length : 0
  const excusedCount = hasAttendanceData ? attendanceRecords.filter(a => a.status === 'excused').length : 0
  const totalCount = hasAttendanceData ? attendanceRecords.length : 0
  const presentPercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0

  // Calculate circle circumference for progress circles
  const circumference = 2 * Math.PI * 40 // radius = 40

  // Loading UI
  if (attendanceStatus === 'loading' || classStatus === 'loading' || subjectsStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Error UI - but ignore "No attendance records found" as it's expected for new students
  const isNoAttendanceError = attendanceError && attendanceError.includes('No attendance records found')
  if (attendanceError && !isNoAttendanceError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600">{attendanceError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'Student'}!</h1>
          <p className="text-gray-600 mt-2">Here's an overview of your academic progress.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Attendance Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Overall Attendance</h2>

            {hasAttendanceData ? (
              <>
                <div className="flex justify-center mb-6">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                      
                      {/* Present progress */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="none" 
                        stroke="#10B981" 
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (presentCount / totalCount) * circumference}
                        className="transition-all duration-1000 ease-in-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {presentPercentage}%
                        </div>
                        <div className="text-sm text-gray-500">Present</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                    <div className="text-sm text-gray-500">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                    <div className="text-sm text-gray-500">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{lateCount}</div>
                    <div className="text-sm text-gray-500">Late</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{excusedCount}</div>
                    <div className="text-sm text-gray-500">Excused</div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Present</span>
                    </div>
                    <span className="text-sm font-medium">{presentCount} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Absent</span>
                    </div>
                    <span className="text-sm font-medium">{absentCount} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Late</span>
                    </div>
                    <span className="text-sm font-medium">{lateCount} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Excused</span>
                    </div>
                    <span className="text-sm font-medium">{excusedCount} days</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Attended Yet</h3>
                <p className="text-gray-500 mb-2">Your attendance records will appear here once you start attending classes.</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Getting Started:</span> Check the "My Classes" section to see your enrolled classes.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* My Classes Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">My Classes</h2>

            <div className="space-y-4">
              {studentClasses.length > 0 ? (
                studentClasses.map((cls: ClassOffering) => {
                  // Find subject using correct field names
                  const subj: Subject | undefined = subjectsState.find(
                    s => s._id === (typeof cls.subject === 'object' ? cls.subject._id : cls.subject)
                  );
                  
                  // Find teacher name
                  const teacherName = typeof cls.primaryTeacher === 'object' 
                    ? cls.primaryTeacher 
                    : cls.primaryTeacher;

                  return (
                    <div key={cls._id || cls.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {subj?.name || 'Unknown Subject'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Section: {cls.sectionName} • {cls.academicYear} • {cls.semester}
                          </p>
                          {teacherName && (
                            <p className="text-sm text-gray-600">
                              Teacher: {teacherName}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {cls.students?.length || 0} students enrolled
                          </div>
                        </div>
                      </div>

                      {/* Schedule Display */}
                      {cls.schedule && cls.schedule.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-2">
                            {cls.schedule.map((schedule, index) => (
                              <span 
                                key={index} 
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                {schedule.dayOfWeek} {schedule.startTime}-{schedule.endTime}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Link
                          to={`/student/attendance/${cls._id || cls.id}`}
                          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          View Attendance
                        </Link>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Enrolled</h3>
                  <p className="text-gray-500 mb-4">You haven't been enrolled in any classes yet.</p>
                  <p className="text-sm text-gray-400">Contact your administrator for class enrollment.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/student-attendance"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View All Attendance Records
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
