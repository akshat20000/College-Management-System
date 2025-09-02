import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { courseService } from '../../services/courseServices'
import type { Course } from '../../types'

interface CourseState {
  courses: Course[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: CourseState = {
  courses: [],
  status: 'idle',
  error: null,
}

// Fetch courses
export const fetchCourses = createAsyncThunk('course/fetchCourses', async () => {
  return await courseService.getCourses()
})

// Create course
export const createCourse = createAsyncThunk('course/createCourse', async (data: { name: string; description?: string; duration?: string }) => {
  return await courseService.createCourse(data)
})

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCourses.pending, (state) => { state.status = 'loading' })
      .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.status = 'succeeded'
        state.courses = action.payload
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch courses'
      })
      // Create
      .addCase(createCourse.pending, (state) => { state.status = 'loading' })
      .addCase(createCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.status = 'succeeded'
        state.courses.push(action.payload)
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to create course'
      })
  },
})

export default courseSlice.reducer
