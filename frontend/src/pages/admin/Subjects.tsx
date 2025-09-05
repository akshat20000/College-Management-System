import { useEffect,useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { JSX } from 'react'
import type { RootState, AppDispatch } from '../../store/store'
import { fetchSubjects, createSubject } from '../../features/subject/subjectSlice'
import { fetchCourses } from '../../features/course/courseSlice'

export function AdminSubjects(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>()
  
  const { subjects, status: subjectsStatus } = useSelector((state: RootState) => state.subject)
  const { courses, status: coursesStatus } = useSelector((state: RootState) => state.course)

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [newSubjectType, setNewSubjectType] = useState('Core'); // Default to 'Core'
  const [newSubjectCredits, setNewSubjectCredits] = useState('');

  // Fetch data on mount
  useEffect(() => {
    if (subjectsStatus === 'idle') {
      dispatch(fetchSubjects())
    }
    if (coursesStatus === 'idle') {
      dispatch(fetchCourses())
    }
  }, [dispatch, subjectsStatus, coursesStatus])


  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubjectName && selectedCourseId && newSubjectCode && newSubjectType && newSubjectCredits) {
      const subjectData = {
        name: newSubjectName,
        code: newSubjectCode,
        courseId: selectedCourseId, // Use courseId as expected by your slice
        type: newSubjectType,
        credits: parseInt(newSubjectCredits, 10),
      };

      dispatch(createSubject(subjectData)).then(() => {
        // Reset form and hide it
        setShowCreateForm(false);
        setNewSubjectName('');
        setNewSubjectCode('');
        setSelectedCourseId('');
        setNewSubjectType('Core');
        setNewSubjectCredits('');
        // Refetch subjects to update the list
        dispatch(fetchSubjects());
      });
    }
  };


  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Subjects</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : 'New Subject'}
        </button>
      </div>

      {/* Creation Form (conditionally rendered) */}
      {showCreateForm && (
        <form onSubmit={handleCreateSubject} className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-medium">Create a New Subject</h2>
          
          <div>
            <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700">Subject Name</label>
            <input id="subjectName" type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
          </div>

          <div>
            <label htmlFor="subjectCode" className="block text-sm font-medium text-gray-700">Subject Code</label>
            <input id="subjectCode" type="text" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
          </div>

          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700">Program</label>
            <select id="course" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="" disabled>Select a program</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subjectType" className="block text-sm font-medium text-gray-700">Type</label>
            <select id="subjectType" value={newSubjectType} onChange={(e) => setNewSubjectType(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="Core">Core</option>
              <option value="Elective">Elective</option>
              <option value="Lab">Lab</option>
            </select>
          </div>

          <div>
            <label htmlFor="subjectCredits" className="block text-sm font-medium text-gray-700">Credits</label>
            <input id="subjectCredits" type="number" value={newSubjectCredits} onChange={(e) => setNewSubjectCredits(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
          </div>
          
          <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">
            Save Subject
          </button>
        </form>
      )}

      {/* Subjects Table */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-600">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Program</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Credits</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(s => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="px-3 py-2 font-medium">{s.name}</td>
                <td className="px-3 py-2">{s.code ?? '-'}</td>
                <td className="px-3 py-2">{(s.program as any)?.name ?? courses.find(c => c.id === s.program)?.name ?? '-'}</td>
                <td className="px-3 py-2">{s.type}</td>
                <td className="px-3 py-2">{s.credits ?? '-'}</td>
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
