import { useState, useEffect } from "react";
import type { JSX } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { fetchClasses, createClass, updateClass, deleteClass } from "../../features/class/classSlice";
import { fetchSubjects } from "../../features/subject/subjectSlice";
import { fetchCourses } from "../../features/course/courseSlice";
import { fetchUsers, type User } from "../../features/user/userslice";
import { authService } from '../../services/authServices';
import type { ClassOffering } from "../../types";


type Semester = "Fall" | "Spring" | "Summer" | "Odd" | "Even" | "Yearly";
type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

interface ScheduleEntry {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
}

interface StudentEntry {
  cmsId: string;
  userId: string;
  name: string;
  isValid: boolean;
  isLoading: boolean;
}

export function AdminClasses(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { offerings: classOfferings, status: classesStatus } = useSelector(
    (state: RootState) => state.class
  );
  const { subjects, status: subjectsStatus } = useSelector(
    (state: RootState) => state.subject
  );
  const { courses, status: coursesStatus } = useSelector(
    (state: RootState) => state.course
  );
  const { users, status: usersStatus } = useSelector(
    (state: RootState) => state.user
  );
  
  // Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassOffering | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState<Semester>("Fall");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  
  // Teacher CMS ID Validation
  const [teacherCmsId, setTeacherCmsId] = useState("");
  const [cmsIdValid, setCmsIdValid] = useState<boolean | null>(null);
  const [cmsIdLoading, setCmsIdLoading] = useState(false);
  const [matchedTeacherId, setMatchedTeacherId] = useState("");
  
  // Student Management State
  const [students, setStudents] = useState<StudentEntry[]>([]);
  const [newStudentCmsId, setNewStudentCmsId] = useState("");
  
  // Fetch data on mount
  useEffect(() => {
    if (classesStatus === "idle") dispatch(fetchClasses());
    if (subjectsStatus === "idle") dispatch(fetchSubjects());
    if (coursesStatus === "idle") dispatch(fetchCourses());
    if (usersStatus === "idle") dispatch(fetchUsers());
  }, [dispatch, classesStatus, subjectsStatus, coursesStatus, usersStatus]);
  
  // Validate teacher CMS ID with debounce
  useEffect(() => {
    if (!teacherCmsId) {
      setCmsIdValid(null);
      setMatchedTeacherId('');
      return;
    }

    setCmsIdLoading(true);
    const debounce = setTimeout(() => { 
      authService.checkUserByCmsid(teacherCmsId, 'teacher')
        .then(data => {
          setCmsIdValid(data.found);
          if (data.found && data.user) {
            setMatchedTeacherId(data.user._id); 
          } else {
            setMatchedTeacherId('');
          }
        })
        .catch(() => {
          setCmsIdValid(false);
          setMatchedTeacherId('');
        })
        .finally(() => {
          setCmsIdLoading(false);
        });
    }, 400);

    return () => clearTimeout(debounce);
  }, [teacherCmsId]);

  // Student validation functions
  const validateStudentCmsId = async (cmsId: string): Promise<StudentEntry> => {
    try {
      const response = await authService.checkUserByCmsid(cmsId, 'student');
      
      if (!response.found) {
        return {
          cmsId,
          userId: '',
          name: 'Student not found',
          isValid: false,
          isLoading: false
        };
      }
      
      return {
        cmsId,
        userId: response.user?._id,
        name: response.user.name,
        isValid: true,
        isLoading: false
      };
    } catch (error) {
      return {
        cmsId,
        userId: '',
        name: 'Validation error',
        isValid: false,
        isLoading: false
      };
    }
  };

  const addStudent = async () => {
    if (!newStudentCmsId.trim()) return;
    
    // Check if student already added
    if (students.some(s => s.cmsId === newStudentCmsId)) {
      alert('Student already added to the class');
      return;
    }

    // Add loading entry
    const loadingEntry: StudentEntry = {
      cmsId: newStudentCmsId,
      userId: '',
      name: 'Validating...',
      isValid: false,
      isLoading: true
    };
    
    setStudents(prev => [...prev, loadingEntry]);
    setNewStudentCmsId('');

    // Validate the student
    const validatedStudent = await validateStudentCmsId(newStudentCmsId);
    setStudents(prev => 
      prev.map(s => s.cmsId === newStudentCmsId ? validatedStudent : s)
    );
  };

  const removeStudent = (cmsId: string) => {
    setStudents(prev => prev.filter(s => s.cmsId !== cmsId));
  };

  // Helper functions for schedule management
  const addSchedule = () => {
    setSchedule([...schedule, { dayOfWeek: "Monday", startTime: "", endTime: "", room: "" }]);
  };

  const removeSchedule = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (index: number, field: keyof ScheduleEntry, value: string) => {
    const updated = [...schedule];
    if (field === "dayOfWeek") {
      updated[index][field] = value as DayOfWeek;
    } else {
      updated[index][field] = value;
    }
    setSchedule(updated);
  };

  // Reset form function
  const resetForm = () => {
    setSelectedSubject("");
    setSectionName("");
    setTeacherCmsId("");
    setMatchedTeacherId("");
    setAcademicYear("");
    setSemester("Fall");
    setSchedule([]);
    setStartDate("");
    setEndDate("");
    setCmsIdValid(null);
    setStudents([]);
    setNewStudentCmsId("");
  };

  // Create class handler
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = subjects.find((s) => s._id === selectedSubject);
    if (!subject || !matchedTeacherId || !academicYear || !semester || !startDate || !endDate) return;

    // Get valid student IDs
    const validStudentIds = students
      .filter(s => s.isValid)
      .map(s => s.userId);

    const classData = {
      subject: selectedSubject,
      program: subject.program,
      sectionName,
      primaryTeacher: matchedTeacherId,
      academicYear,
      semester,
      schedule,
      startDate: startDate.split('T')[0],
      endDate: endDate.split('T')[0],
      students: validStudentIds,
    };

    dispatch(createClass(classData)).then(() => {
      setShowCreateForm(false);
      resetForm();
      dispatch(fetchClasses());
    });
  };
  
  // Edit class handler
  const handleEditClass = (cls: ClassOffering) => {
    setEditingClass(cls);
    setSelectedSubject(cls.subject._id || cls.subject);
    setSectionName(cls.sectionName);
    setAcademicYear(cls.academicYear);
    setSemester(cls.semester);
    setSchedule(cls.schedule || []);
    setStartDate(cls.startDate);
    setEndDate(cls.endDate);
    
    // Find teacher's CMS ID if available
    const teacher = users.find(user => user._id === (cls.primaryTeacher._id || cls.primaryTeacher));
    if (teacher) {
      setTeacherCmsId(teacher.cmsId || "");
      setMatchedTeacherId(teacher._id);
      setCmsIdValid(true);
    }

    // Load existing students
    const existingStudents: StudentEntry[] = cls.students.map(studentId => {
      const student = users.find(u => u._id === studentId);
      return {
        cmsId: student?.cmsId || '',
        userId: studentId,
        name: student?.name || 'Unknown Student',
        isValid: true,
        isLoading: false
      };
    });
    setStudents(existingStudents);
    
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  // Update class handler
  const handleUpdateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !matchedTeacherId) return;

    const subject = subjects.find((s) => s._id === selectedSubject);
    if (!subject) return;

    // Get valid student IDs
    const validStudentIds = students
      .filter(s => s.isValid)
      .map(s => s.userId);

    const updateData = {
      subject: selectedSubject,
      program: subject.program,
      sectionName,
      primaryTeacher: matchedTeacherId,
      academicYear,
      semester,
      schedule,
      startDate: startDate.split('T')[0],
      endDate: endDate.split('T')[0],
      students: validStudentIds,
    };
    
    console.log(updateData)
    dispatch(updateClass({ id: editingClass._id, data: updateData })).then(() => {
      setShowEditForm(false);
      setEditingClass(null);
      resetForm();
      dispatch(fetchClasses());
    });
  };
 
  // console.log('Start Date:', startDate.split('T')[0], 'Type:', typeof startDate);
  // console.log('End Date:', endDate.split('T')[0], 'Type:', typeof endDate);
  // Delete class handler
  const handleDeleteClass = (classId: string) => {
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      dispatch(deleteClass(classId)).then(() => {
        dispatch(fetchClasses());
      });
    }
  };

  // Cancel handlers
  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingClass(null);
    resetForm();
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    resetForm();
  };

  // Student enrollment section component
  const renderStudentSection = () => (
    <div>
      <label className="block text-sm font-medium mb-2">Students</label>
      
      {/* Add student input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newStudentCmsId}
          onChange={(e) => setNewStudentCmsId(e.target.value)}
          placeholder="Enter student CMS ID"
          className="flex-1 rounded-md border px-3 py-2"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStudent())}
        />
        <button
          type="button"
          onClick={addStudent}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          disabled={!newStudentCmsId.trim()}
        >
          Add Student
        </button>
      </div>

      {/* Students list */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {students.map((student, index) => (
          <div
            key={`${student.cmsId}-${index}`}
            className={`flex items-center justify-between p-2 rounded border ${
              student.isLoading
                ? 'bg-gray-100'
                : student.isValid
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex-1">
              <div className="font-medium text-sm">
                CMS ID: {student.cmsId}
              </div>
              <div className={`text-xs ${student.isLoading ? 'text-gray-500' : student.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {student.name}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeStudent(student.cmsId)}
              className="text-red-600 hover:bg-red-100 px-2 py-1 rounded"
              disabled={student.isLoading}
            >
              Remove
            </button>
          </div>
        ))}
        {students.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4 border rounded">
            No students added yet. Use the input above to add students by their CMS ID.
          </div>
        )}
      </div>

      <div className="text-xs text-gray-600 mt-2">
        Valid students: {students.filter(s => s.isValid).length} / {students.length}
      </div>
    </div>
  );

  // Form JSX component for reusability
  const renderForm = (isEdit: boolean) => (
    <form 
      onSubmit={isEdit ? handleUpdateClass : handleCreateClass} 
      className={`space-y-6 p-4 border rounded-lg ${isEdit ? 'bg-yellow-50' : 'bg-gray-50'}`}
    >
      <h2 className="text-lg font-medium">
        {isEdit ? 'Edit Class' : 'Create a New Class'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium">
            Subject
          </label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            required
            className="mt-1 block w-full rounded-md shadow-sm border px-3 py-2"
          >
            <option value="" disabled>
              Select Subject
            </option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="teacher" className="block text-sm font-medium">
            Teacher (CMS ID)
          </label>
          <div className="relative">
            <input
              id="teacher"
              type="text"
              value={teacherCmsId}
              onChange={(e) => setTeacherCmsId(e.target.value)}
              placeholder="Enter teacher CMS ID"
              className="pl-2 pr-8 py-2 border rounded w-full"
              required
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              {cmsIdLoading ? (
                <span className="text-gray-400">⏳</span>
              ) : cmsIdValid === true ? (
                <span className="text-green-500 font-bold">✔️</span>
              ) : cmsIdValid === false ? (
                <span className="text-red-500 font-bold">❌</span>
              ) : null}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="section" className="block text-sm font-medium">
            Section
          </label>
          <input
            id="section"
            type="text"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md shadow-sm border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium">
            Academic Year
          </label>
          <input
            id="year"
            type="text"
            placeholder="e.g., 2024-2025"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            required
            className="mt-1 block w-full rounded-md shadow-sm border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="semester" className="block text-sm font-medium">
            Semester
          </label>
          <select
            id="semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value as Semester)}
            required
            className="mt-1 block w-full rounded-md shadow-sm border px-3 py-2"
          >
            <option value="Fall">Fall</option>
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Odd">Odd</option>
            <option value="Even">Even</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label htmlFor="startDate" className="block text-sm font-medium">Start Date</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mt-1 block w-full rounded-md shadow-sm border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium">End Date</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="mt-1 block w-full rounded-md shadow-sm border px-3 py-2"
          />
        </div>
      </div>

      {/* Schedule Section */}
      <div>
        <label className="block text-sm font-medium">Schedule</label>
        <div className="mt-2 space-y-3">
          {schedule.map((entry, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 border rounded-md bg-white"
            >
              <select
                value={entry.dayOfWeek}
                onChange={(e) =>
                  handleScheduleChange(index, "dayOfWeek", e.target.value)
                }
                className="w-full rounded-md border px-2 py-1"
              >
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>
              <input
                type="time"
                value={entry.startTime}
                onChange={(e) =>
                  handleScheduleChange(index, "startTime", e.target.value)
                }
                required
                className="w-full rounded-md border px-2 py-1"
              />
              <input
                type="time"
                value={entry.endTime}
                onChange={(e) =>
                  handleScheduleChange(index, "endTime", e.target.value)
                }
                required
                className="w-full rounded-md border px-2 py-1"
              />
              <input
                type="text"
                placeholder="Room"
                value={entry.room}
                onChange={(e) =>
                  handleScheduleChange(index, "room", e.target.value)
                }
                required
                className="w-full rounded-md border px-2 py-1"
              />
              <button
                type="button"
                onClick={() => removeSchedule(index)}
                className="text-red-600 px-2 py-1 hover:bg-red-100 rounded"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSchedule}
            className="text-blue-600 mt-2 text-sm hover:underline"
          >
            + Add Time Slot
          </button>
        </div>
      </div>

      {/* Students Section */}
      {renderStudentSection()}

      <div className="flex gap-2">
        <button
          type="submit"
          className={`rounded text-white p-2 mt-4 ${
            isEdit 
              ? 'bg-orange-600 hover:bg-orange-700' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
          disabled={cmsIdValid !== true}
        >
          {isEdit ? 'Update Class' : 'Save Class'}
        </button>
        <button
          type="button"
          onClick={isEdit ? handleCancelEdit : handleCancelCreate}
          className="rounded bg-gray-600 hover:bg-gray-700 text-white p-2 mt-4"
        >
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Classes</h1>
        <div className="space-x-2">
          {showEditForm && (
            <button
              onClick={handleCancelEdit}
              className="rounded-md bg-gray-600 px-3 py-1.5 text-white hover:bg-gray-700"
            >
              Cancel Edit
            </button>
          )}
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setShowEditForm(false);
              setEditingClass(null);
              if (showCreateForm) resetForm();
            }}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
          >
            {showCreateForm ? "Cancel" : "New Class"}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && !showEditForm && renderForm(false)}

      {/* Edit Form */}
      {showEditForm && editingClass && renderForm(true)}

      {/* Classes Table */}
      <div className="overflow-x-auto rounded border bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-600">
              <th className="px-3 py-2">Subject</th>
              <th className="px-3 py-2">Program</th>
              <th className="px-3 py-2">Section</th>
              <th className="px-3 py-2">Teacher</th>
              <th className="px-3 py-2">Students</th>
              <th className="px-3 py-2">Schedule</th>
              <th className="px-3 py-2">Term</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classOfferings.length > 0 ? (
              classOfferings.map((cls, index) => {
                let programName = "";
                courses.forEach((c) => {
                  if (c._id === cls.program) programName = c.name;
                });

                return (
                  <tr key={cls._id ?? `class-${index}`} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">
                      {cls.subject?.name ?? "N/A"}
                    </td>
                    <td className="px-3 py-2">{programName}</td>
                    <td className="px-3 py-2">{cls.sectionName}</td>
                    <td className="px-3 py-2">{cls.primaryTeacher?.name ?? "N/A"}</td>
                    <td className="px-3 py-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {cls.students?.length || 0} students
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      {cls.schedule && cls.schedule.length > 0 ? (
                        cls.schedule.map((s, si) => (
                          <div key={`sched-${index}-${si}`} className="text-xs">
                            {s.dayOfWeek} {s.startTime}-{s.endTime} · {s.room}
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400">No schedule</span>
                      )}
                    </td>

                    <td className="px-3 py-2">
                      {cls.academicYear} · {cls.semester}
                    </td>

                    <td className="px-3 py-2">
                      <button 
                        onClick={() => handleEditClass(cls)}
                        className="border px-2 py-1 mr-1 hover:bg-blue-100 text-blue-600 rounded"
                        disabled={showEditForm || showCreateForm}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClass(cls._id)}
                        className="border px-2 py-1 text-red-600 hover:bg-red-100 rounded"
                        disabled={showEditForm || showCreateForm}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                  No classes available. Create your first class using the "New Class" button.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Loading states */}
      {classesStatus === 'loading' && (
        <div className="text-center py-4">
          <span className="text-gray-600">Loading classes...</span>
        </div>
      )}
    </div>
  );
}
