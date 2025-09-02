import { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchClasses, createClass } from '../../features/class/classSlice';
import { fetchSubjects } from '../../features/subject/subjectSlice';
import { fetchCourses } from '../../features/course/courseSlice';
import { fetchUsers, type User } from '../../features/user/userslice';

type Semester = "Fall" | "Spring" | "Summer" | "Odd" | "Even" | "Yearly";
type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

interface ScheduleEntry {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
}

export function AdminClasses(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { offerings: classOfferings, status: classesStatus } = useSelector((state: RootState) => state.class);
  const { subjects, status: subjectsStatus } = useSelector((state: RootState) => state.subject);
  const { courses, status: coursesStatus } = useSelector((state: RootState) => state.course);
  const { users, status: usersStatus } = useSelector((state: RootState) => state.user);

  // Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState<Semester>('Fall');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]); // State now holds an array of schedule objects

  // Fetch data on mount
  useEffect(() => {
    if (classesStatus === 'idle') dispatch(fetchClasses());
    if (subjectsStatus === 'idle') dispatch(fetchSubjects());
    if (coursesStatus === 'idle') dispatch(fetchCourses());
    if (usersStatus === 'idle') dispatch(fetchUsers());
  }, [dispatch, classesStatus, subjectsStatus, coursesStatus, usersStatus]);

  const teachers = users.filter((user: User) => user.role === 'teacher');


  const addScheduleEntry = () => {
    setSchedule([...schedule, { dayOfWeek: 'Monday', startTime: '', endTime: '', room: '' }]);
  };


  const removeScheduleEntry = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };


  const handleScheduleChange = (index: number, field: keyof ScheduleEntry, value: string) => {
    const updatedSchedule = [...schedule];
    if (field === 'dayOfWeek') {
      updatedSchedule[index][field] = value as DayOfWeek;
    } else {
      updatedSchedule[index][field] = value;
    }
    setSchedule(updatedSchedule);
  };



  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = subjects.find(s => s.id === selectedSubject);
    if (!subject || !selectedTeacher || !academicYear || !semester) return;

    const classData = {
      subject: selectedSubject,
      program: subject.program,
      sectionName,
      primaryTeacher: selectedTeacher,
      academicYear,
      semester,
      schedule,
      startDate,
      endDate,
      students: []
    };

    dispatch(createClass(classData)).then(() => {
      setShowCreateForm(false);
      // Reset all form fields
      setSelectedSubject('');
      setSectionName('');
      setSelectedTeacher('');
      setAcademicYear('');
      setSemester('Fall');
      setSchedule([]);
      setStartDate('');
      setEndDate('');
      dispatch(fetchClasses());
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Classes</h1>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700">
          {showCreateForm ? 'Cancel' : 'New Class'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateClass} className="space-y-6 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-medium">Create a New Class</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subject, Teacher, Section, etc. */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium">Subject</label>
              <select id="subject" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} required className="mt-1 block w-full rounded-md shadow-sm">
                <option value="" disabled>Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="teacher" className="block text-sm font-medium">Teacher</label>
              <select id="teacher" value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} required className="mt-1 block w-full rounded-md shadow-sm">
                <option value="" disabled>Select Teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id!}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="section" className="block text-sm font-medium">Section</label>
              <input id="section" type="text" value={sectionName} onChange={e => setSectionName(e.target.value)} required className="mt-1 block w-full rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium">Academic Year</label>
              <input id="year" type="text" placeholder="e.g., 2024-2025" value={academicYear} onChange={e => setAcademicYear(e.target.value)} required className="mt-1 block w-full rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="semester" className="block text-sm font-medium">Semester</label>
              <select id="semester" value={semester} onChange={e => setSemester(e.target.value as Semester)} required className="mt-1 block w-full rounded-md shadow-sm">
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Odd">Odd</option>
                <option value="Even">Even</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium">Start Date</label>
            <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium">End Date</label>
            <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1 block w-full rounded-md shadow-sm" />
          </div>


          <div>
            <label className="block text-sm font-medium">Schedule</label>
            <div className="mt-2 space-y-3">
              {schedule.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-white">
                  {/* Day of Week */}
                  <select value={entry.dayOfWeek} onChange={e => handleScheduleChange(index, 'dayOfWeek', e.target.value)} className="w-full rounded-md">
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                    <option>Saturday</option>
                  </select>
                  {/* Start Time */}
                  <input type="time" value={entry.startTime} onChange={e => handleScheduleChange(index, 'startTime', e.target.value)} required className="w-full rounded-md" />
                  {/* End Time */}
                  <input type="time" value={entry.endTime} onChange={e => handleScheduleChange(index, 'endTime', e.target.value)} required className="w-full rounded-md" />
                  {/* Room */}
                  <input type="text" placeholder="Room" value={entry.room} onChange={e => handleScheduleChange(index, 'room', e.target.value)} required className="w-full rounded-md" />
                  {/* Remove Button */}
                  <button type="button" onClick={() => removeScheduleEntry(index)} className="px-2 py-1 text-red-600 hover:text-red-800">&times;</button>
                </div>
              ))}
              <button type="button" onClick={addScheduleEntry} className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                + Add Time Slot
              </button>
            </div>
          </div>


          <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700">Save Class</button>
        </form>
      )}


      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">

        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-600">
              <th className="px-3 py-2">Subject</th>
              <th className="px-3 py-2">Program</th>
              <th className="px-3 py-2">Section</th>
              <th className="px-3 py-2">Teacher</th>
              <th className="px-3 py-2">Schedule</th>
              <th className="px-3 py-2">Term</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classOfferings.map((cls, index) => (
              <tr key={cls.id ?? `class-${index}`} className="border-b last:border-0">
                <td className="px-3 py-2 font-medium">{subjects.find((s) => s.id === cls.subject)?.name ?? '-'}</td>
                <td className="px-3 py-2">{courses.find((c) => c.id === cls.program)?.name ?? '-'}</td>
                <td className="px-3 py-2">{cls.sectionName}</td>
                <td className="px-3 py-2">{users.find((u: User) => u.id === cls.primaryTeacher)?.name ?? '-'}</td>
                <td className="px-3 py-2">
                  {cls.schedule.map((s, sIndex) => (
                    <div key={`sched-${index}-${sIndex}`} className="text-xs text-gray-600">
                      {s.dayOfWeek} {s.startTime}-{s.endTime} · {s.room}
                    </div>
                  ))}
                </td>
                <td className="px-3 py-2">{cls.academicYear} · {cls.semester}</td>
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
