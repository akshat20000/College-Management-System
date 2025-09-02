import { useEffect , type JSX} from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../store/store'
import { fetchClasses } from '../features/class/classSlice'
import { fetchSubjects } from '../features/subject/subjectSlice'
import type { ClassOffering, Subject } from '../types'

export function TeacherDashboard(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.user.user)
  const { offerings: classesState, status: classStatus } = useSelector((state: RootState) => state.class)
  const { subjects: subjectsState } = useSelector((state: RootState) => state.subject)

  useEffect(() => {
    if (!user?.id) return
    dispatch(fetchClasses())
    dispatch(fetchSubjects())
  }, [user?.id, dispatch])

  if (classStatus === 'loading') {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Teacher Dashboard</h1>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">My Classes</h2>

          <div className="grid gap-4">
            {classesState.map((cls: ClassOffering) => {
              // safely get subject
              const subj: Subject | undefined = subjectsState.find(
                (s: Subject) => s.id === cls.subject
              )
              const studentCount = cls.students.length

              return (
                <div key={cls.id ?? cls.subject + cls.academicYear} className="bg-gray-50 rounded-lg p-4">
                  <div className="font-bold text-gray-900 text-lg">
                    {subj?.name ?? cls.subject} - {cls.academicYear}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {studentCount} students
                  </div>
                  <div className="mt-4">
                    <Link
                      to={`/teacher/mark/${cls.id}`}
                      className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition duration-200"
                    >
                      Mark Attendance
                    </Link>
                  </div>
                </div>
              )
            })}

            {classesState.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No classes assigned yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
