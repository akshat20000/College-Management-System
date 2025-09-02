import { api } from './api'
import type { AttendanceRecord, AttendanceStatus } from '../types'

export interface MarkAttendanceData {
  classId: string
  date: string
  records: Array<{
    studentId: string
    status: AttendanceStatus
  }>
}

export const attendanceService = {
  async getAttendance(): Promise<AttendanceRecord[]> {
    const response = await api.get<AttendanceRecord[]>('/attendance')
    return response.data
  },

  async getAttendanceByClass(classId: string): Promise<AttendanceRecord[]> {
    const response = await api.get<AttendanceRecord[]>(`/attendance/class/${classId}`)
    return response.data
  },

  async getAttendanceByStudent(studentId: string): Promise<AttendanceRecord[]> {
    const response = await api.get<AttendanceRecord[]>(`/attendance/student/${studentId}`)
    return response.data
  },

  async markAttendance(data: MarkAttendanceData): Promise<{ message: string; attendance: AttendanceRecord[] }> {
    const response = await api.post('/attendance', data)
    return response.data
  },

  async updateAttendance(id: string, status: AttendanceStatus): Promise<AttendanceRecord> {
    const response = await api.put(`/attendance/${id}`, { status })
    return response.data.attendance
  },

  async deleteAttendance(id: string): Promise<void> {
    await api.delete(`/attendance/${id}`)
  },
}


