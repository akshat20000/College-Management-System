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

export const updateClass = createAsyncThunk(
  'class/updataclass',
  async ({ id, data }: { id: string; data: Partial<ClassOffering> }) => {
    const response = await classService.updateClass(id, data)
    return response
  }
)

export const deleteClass = createAsyncThunk(
  'class/deleteClass',
  async (id: string) => {
    await classService.deleteClass(id)
    return id
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


      // Update class
      .addCase(updateClass.fulfilled, (state, action) => {
        const index = state.offerings.findIndex(cls => cls._id === action.payload._id)
        if (index !== -1) {
          state.offerings[index] = action.payload
        }
      })

      // Delete class
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.offerings = state.offerings.filter(cls => cls._id !== action.payload)
      })
  },
})

export default classSlice.reducer
