import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { classService } from '../../services/classService'
import type { ClassOffering } from '../../types'

// Thunk to fetch all classes
export const fetchClasses = createAsyncThunk(
  'class/fetchClasses',
  async () => {
    const data = await classService.getClasses()
    return data
  }
)

// Thunk to fetch a single class offering by ID
export const fetchClassOffering = createAsyncThunk(
  'class/fetchOffering',
  async (id: string) => {
    const data = await classService.getClass(id)
    return data
  }
)

export const createClass = createAsyncThunk(
  'class/createClass',
  async (classData: Omit<ClassOffering, 'id'>) => {
    const data = await classService.createClass(classData)
    return data
  }
)

interface ClassState {
  offerings: ClassOffering[]
  selectedClass: ClassOffering | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: ClassState = {
  offerings: [],
  selectedClass: null,
  status: 'idle',
  error: null,
}

const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchClasses (all classes)
    builder.addCase(fetchClasses.pending, (state) => {
      state.status = 'loading'
    })
    builder.addCase(fetchClasses.fulfilled, (state, action: PayloadAction<ClassOffering[]>) => {
      state.status = 'succeeded'
      state.offerings = action.payload
    })
    builder.addCase(fetchClasses.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.error.message || 'Failed to fetch classes'
    })

    // fetchClassOffering (single class)
    builder.addCase(fetchClassOffering.pending, (state) => {
      state.status = 'loading'
    })
    builder.addCase(fetchClassOffering.fulfilled, (state, action: PayloadAction<ClassOffering>) => {
      state.status = 'succeeded'
      state.selectedClass = action.payload
    })
    builder.addCase(fetchClassOffering.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.error.message || 'Failed to fetch class'
    })

    // create class reducer
    builder
      .addCase(createClass.pending, (state) => { state.status = 'loading' })
      .addCase(createClass.fulfilled, (state, action: PayloadAction<ClassOffering>) => {
        state.status = 'succeeded'
        state.offerings.push(action.payload) // Add new class to the list
      })
      .addCase(createClass.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to create class'
      })
  },
})

export default classSlice.reducer
