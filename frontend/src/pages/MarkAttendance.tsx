import { useMemo } from 'react'
import type { JSX } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store/store'
import { Link, useParams  } from 'react-router-dom'
import { markAttendance } from '../features/attendance/attendanceSlice'
import type { AttendanceStatus } from '../types'

export function MarkAttendance(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>()

  const { classId } = useParams<{ classId: string }>()
  const { offerings: classOfferings } = useSelector((state: RootState) => state.class)
  const { subjects } = useSelector((state: RootState) => state.subject)
  const { users } = useSelector((state: RootState) => state.user)
  const { records } = useSelector((state: RootState) => state.attendance)
  const cls = classOfferings.find(c => c._id === classId)

  if (!cls) return <p>Class not found</p>

  // Find the subject for this class
  const subject = subjects.find(s => s._id === cls.subject._id)
  const subjectName = subject?.name ?? 'Unknown Subject'

  const students = cls.students ?? []

  const today = new Date().toISOString().slice(0, 10)

  const currentMap = useMemo(
    () =>
      new Map(
        records
          .filter(r => r.classId === classId && r.date.startsWith(today))
          .map(r => [r.studentId, r.status as AttendanceStatus])
      ),
    [records, classId, today]
  )

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    if (!studentId) return
    dispatch(
      markAttendance({
        classId,
        date: today,
        records: [{ studentId, status }]
      })
    )
  }

  const todayFormatted = new Date(today).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <Link
            to="/teacher"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            Back to Dashboard
          </Link>

          <h1 className="text-2xl font-bold mb-2">Mark Attendance: {subjectName}</h1>
          <p className="text-gray-600">{todayFormatted}</p>

          <div className="space-y-6 mt-4">
            {students.map(s => (
              <div
                key={s._id}   
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>{s.name ?? 'Unnamed Student'}</div>
                <div className="flex gap-2">
                  {(['present', 'absent', 'late'] as AttendanceStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => setStatus(s._id, st)}   
                      className={`px-4 py-2 rounded-full text-sm ${
                        currentMap.get(s._id) === st   
                          ? st === 'present'
                            ? 'bg-green-500 text-white'
                            : st === 'absent'
                            ? 'bg-red-500 text-white'
                            : 'bg-yellow-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
