export type Role = 'admin' | 'teacher' | 'student'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  assignedClasses: string[]
}



export interface Course {
  id: string
  name: string
  description: string
  duration: string
  coordinator?: string | { name: string; email: string }
}

export type SubjectType = 'Theory' | 'Lab' 

export interface Subject {
  id: string
  name: string
  code?: string
  description?: string
  program: string // Course id
  type: SubjectType
  credits?: number
}

export interface ScheduleSlot {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
  startTime: string
  endTime: string
  room: string
  assignedTeacher?: string
}

export interface ClassOffering {
  id: string
  subject: string // Subject id
  program: string // Course id
  sectionName: string
  primaryTeacher: string // User id
  students: string[] // User ids
  schedule: ScheduleSlot[]
  academicYear: string
  semester: 'Fall' | 'Spring' | 'Summer' | 'Odd' | 'Even' | 'Yearly'
  startDate: string
  endDate: string
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface AttendanceRecord {
  id: string
  classId: string
  studentId: string
  date: string
  status: AttendanceStatus
  markedBy: string
  slotTime?: string
}

// export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'partial'

// export interface Payment {
//   id: string
//   student: string
//   amount: number
//   date: string
//   course?: string
//   status: PaymentStatus
//   paymentMethod?: string
//   transactionId?: string
// }