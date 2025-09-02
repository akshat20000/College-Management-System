import { api } from './api'
import type { Course } from '../types'

export const courseService = {
  async getCourses(): Promise<Course[]> {
    const response = await api.get<Course[]>('/courses')
    return response.data
  },

  async getCourse(id: string): Promise<Course> {
    const response = await api.get<Course>(`/courses/${id}`)
    return response.data
  },

  async createCourse(data: { name: string; description?: string; duration?: string }): Promise<Course> {
    const response = await api.post<Course>('/courses', data)
    return response.data
  },
}
