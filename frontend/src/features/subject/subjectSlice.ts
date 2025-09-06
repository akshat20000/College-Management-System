import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { subjectService } from '../../services/subjectServices'
import type { Subject } from '../../types'

interface SubjectState {
  subjects: Subject[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

interface CreateSubjectData {
  name: string;
  code: string;
  program: string; // This is the program ID
  type: string;
  credits: number;
}

const initialState: SubjectState = {
  subjects: [],
  status: 'idle',
  error: null,
}

export const fetchSubjects = createAsyncThunk('subject/fetchSubjects', async () => {
  return await subjectService.getSubjects()
})

export const createSubject = createAsyncThunk('subject/createSubject', async (data: CreateSubjectData) => {
  return await subjectService.createSubject(data)
})

const subjectSlice = createSlice({
  name: 'subject',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => { state.status = 'loading' })
      .addCase(fetchSubjects.fulfilled, (state, action: PayloadAction<Subject[]>) => {
        state.status = 'succeeded'
        state.subjects = action.payload
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch subjects'
      })
      .addCase(createSubject.pending, (state) => { state.status = 'loading' })
      .addCase(createSubject.fulfilled, (state, action: PayloadAction<Subject>) => {
        state.status = 'succeeded'
        state.subjects.push(action.payload)
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to create subject'
      })
  },
})

export default subjectSlice.reducer
