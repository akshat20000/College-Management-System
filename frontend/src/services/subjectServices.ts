import { api } from './api'
import type { Subject } from '../types'

export const subjectService = {
  async getSubjects(): Promise<Subject[]> {
    const response = await api.get<Subject[]>('/subjects')
    return response.data
  },

  async getSubject(id: string): Promise<Subject> {
    const response = await api.get<Subject>(`/subjects/${id}`)
    return response.data
  },

  async createSubject(data: { name: string; courseId: string }): Promise<Subject> {
    const response = await api.post<Subject>('/subjects', data)
    return response.data
  },

   updateSubject: async (id: string, subject: Subject): Promise<Subject> => {
    const res = await api.put(`/subjects/${id}`, subject)
    return res.data
  },
  deleteSubject: async (id: string): Promise<void> => {
    await api.delete(`/subjects/${id}`)
  }
  
}
