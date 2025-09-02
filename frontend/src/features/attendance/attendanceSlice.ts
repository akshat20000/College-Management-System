import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { attendanceService, type MarkAttendanceData } from '../../services/attendanceService'
import type { AttendanceRecord, AttendanceStatus } from '../../types'

interface AttendanceState {
  records: AttendanceRecord[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: AttendanceState = {
  records: [],
  status: 'idle',
  error: null,
}

// Thunks
export const fetchAttendanceByClass = createAsyncThunk(
  'attendance/fetchByClass',
  async (classId: string) => {
    const data = await attendanceService.getAttendanceByClass(classId)
    return data
  }
)

export const markAttendance = createAsyncThunk(
  'attendance/mark',
  async (payload: MarkAttendanceData) => {
    const data = await attendanceService.markAttendance(payload)
    return data.attendance
  }
)

export const updateAttendance = createAsyncThunk(
  'attendance/update',
  async ({ id, status }: { id: string; status: AttendanceStatus }) => {
    const updated = await attendanceService.updateAttendance(id, status)
    return updated
  }
)

export const fetchAttendanceByStudent = createAsyncThunk(
  'attendance/fetchByStudent',
  async (studentId: string) => {
    const data = await attendanceService.getAttendanceByStudent(studentId)
    return data
  }
)

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    resetAttendance: (state) => {
      state.records = []
      state.status = 'idle'
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchByClass
      .addCase(fetchAttendanceByClass.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchAttendanceByClass.fulfilled, (state, action: PayloadAction<AttendanceRecord[]>) => {
        state.status = 'succeeded'
        state.records = action.payload
      })
      .addCase(fetchAttendanceByClass.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch attendance'
      })


       // fetchByStudent
    .addCase(fetchAttendanceByStudent.pending, (state) => {
      state.status = 'loading'
      state.error = null
    })
    .addCase(fetchAttendanceByStudent.fulfilled, (state, action: PayloadAction<AttendanceRecord[]>) => {
      state.status = 'succeeded'
      state.records = action.payload
    })
    .addCase(fetchAttendanceByStudent.rejected, (state, action) => {
      state.status = 'failed'
      state.error = action.error.message || 'Failed to fetch student attendance'
    })


      // markAttendance
      .addCase(markAttendance.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(markAttendance.fulfilled, (state, action: PayloadAction<AttendanceRecord[]>) => {
        state.status = 'succeeded'
        // Replace today's attendance or append
        action.payload.forEach(r => {
          const idx = state.records.findIndex(rec => rec.id === r.id)
          if (idx >= 0) state.records[idx] = r
          else state.records.push(r)
        })
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to mark attendance'
      })

      // updateAttendance
      .addCase(updateAttendance.fulfilled, (state, action: PayloadAction<AttendanceRecord>) => {
        const idx = state.records.findIndex(r => r.id === action.payload.id)
        if (idx >= 0) state.records[idx] = action.payload
        else state.records.push(action.payload)
      })
  }
})

export const { resetAttendance } = attendanceSlice.actions
export default attendanceSlice.reducer
