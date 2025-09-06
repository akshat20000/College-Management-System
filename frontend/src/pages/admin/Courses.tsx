import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../../store/store'
import { fetchCourses, createCourse } from '../../features/course/courseSlice'
import { fetchUsers } from '../../features/user/userslice'

export function AdminCourses(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>()
  const { courses, status } = useSelector((state: RootState) => state.course)
  const { users, status: usersStatus } = useSelector((state: RootState) => state.user)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDuration, setNewCourseDuration] = useState('')
  const [newCourseDescription, setNewCourseDescription] = useState('')
  const [selectedCoordinator, setSelectedCoordinator] = useState('');

  const [filter, setFilter] = useState('')
  const visible = courses.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCourses())
    }
  }, [dispatch, status])

  useEffect(() => {
    if (usersStatus === 'idle') {
      dispatch(fetchUsers())
    }
  }, [dispatch, usersStatus])

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCourseName && newCourseDuration) {
      const courseData = {
        name: newCourseName,
        description: newCourseDescription,
        duration: newCourseDuration,
        coordinator: selectedCoordinator || null,
      };
      // Dispatch the action to create the course
      dispatch(createCourse(courseData)).then(() => {
        // Reset form and hide it
        setNewCourseName('');
        setNewCourseDuration('');
        setNewCourseDescription('');
        setSelectedCoordinator('');
        setShowCreateForm(false);
        // Optionally, refetch courses
        dispatch(fetchCourses());
      });
    }
  };
console.log(users)
  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Courses</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : 'New Program'}
        </button>
      </div>

      {/* Creation Form (conditionally rendered) */}
      {showCreateForm && (
        <form onSubmit={handleCreateCourse} className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-medium">Create a New Course</h2>
          <div>
            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              id="courseName"
              type="text"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., Bachelor of Science"
              required
            />
          </div>
          <div>
            <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700">Description</label>
            <input
              id="courseDescription"
              type="text"
              value={newCourseDescription}
              onChange={(e) => setNewCourseDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., 4 Years"
              required
            />
          </div>
          <div>
            <label htmlFor="courseDuration" className="block text-sm font-medium text-gray-700">Duration</label>
            <input
              id="courseDuration"
              type="text"
              value={newCourseDuration}
              onChange={(e) => setNewCourseDuration(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., 4 Years"
              required
            />
          </div>
          <div>
            <label htmlFor="coordinator" className="block text-sm font-medium text-gray-700">Coordinator</label>
            <select
              id="coordinator"
              value={selectedCoordinator}
              onChange={(e) => setSelectedCoordinator(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select Coordinator (Optional)</option>
              {users.filter(teacher => teacher.id != null)
                .map(teacher => (
                  <option key={teacher.id} value={teacher.id!}>
                    {teacher.name}
                  </option>
                ))}
            </select>
          </div>
          <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
            Save Program
          </button>
        </form>
      )}

      {/* Search and Table */}
      <div className="flex items-center gap-3">
        <input
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Search programs..."
          className="w-72 rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">

        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Duration</th>
              <th className="px-3 py-2">Coordinator</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(p => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="px-3 py-2 font-medium">{p.name}</td>
                <td className="px-3 py-2">{p.description}</td>
                <td className="px-3 py-2">{p.duration}</td>
                <td className="px-3 py-2">{(p.coordinator as any)?.name ?? '-'}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50">Edit</button>
                    <button className="rounded-md border px-2 py-1 text-sm text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

}
