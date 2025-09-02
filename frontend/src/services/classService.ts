import { api } from './api'
import type { ClassOffering } from '../types'

export const classService = {
  async getClasses(): Promise<ClassOffering[]> {
    const response = await api.get<ClassOffering[]>('/classes')
    return response.data
  },

  async getTeacherClasses(teacherId: string): Promise<ClassOffering[]> {
    const response = await api.get<ClassOffering[]>(`/classes/teacher/${teacherId}`)
    return response.data
  },

  async getStudentClasses(studentId: string): Promise<ClassOffering[]> {
    const response = await api.get<ClassOffering[]>(`/classes/student/${studentId}`)
    return response.data
  },

  async getClass(id: string): Promise<ClassOffering> {
    const response = await api.get<ClassOffering>(`/classes/${id}`)
    return response.data
  },

   async createClass(data:Omit<ClassOffering,'id'> ):Promise<ClassOffering>{
    const response = await api.post<ClassOffering>('/classes', data)
    return response.data
  },

  
}


