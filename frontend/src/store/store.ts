import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userslice';
import courseReducer from '../features/course/courseSlice'
import subjectReducer from '../features/subject/subjectSlice'
import classReducer from '../features/class/classSlice'
import attendanceReducer from '../features/attendance/attendanceSlice'
import authReducer from '../features/Auth/authSlice';

export const store = configureStore({
  reducer: {
    auth:authReducer,
    user: userReducer, 
    course: courseReducer,
    subject: subjectReducer,
    class: classReducer,
    attendance: attendanceReducer,
  },
});

// Types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
