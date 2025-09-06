import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authServices';
import type { LoginCredentials, RegisterData, AuthResponse } from '../../services/authServices';

export interface User {
  id: string | null;
  name: string | null;
  email: string | null;
  role: 'admin' | 'teacher' | 'student' | null;
  program?: string;
  department?: string;
}

interface UserState {
  user: User | null;
  users: User[];          // <-- store all users
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  user: null,
  users: [],
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

// Existing thunks
export const registerUser = createAsyncThunk(
  'user/register',
  async (data: RegisterData): Promise<User> => {
    const response: AuthResponse = await authService.register(data);
    return response.user; 
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: LoginCredentials): Promise<User> => {
    const response: AuthResponse = await authService.login(credentials);
    return response.user;
  }
);

export const fetchUsers = createAsyncThunk('user/fetchUsers', async () => {
  const response = await authService.getAllUsers(); // you need to implement this in authService
  return response; 
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      // Register/Login cases (same as before)
      .addCase(registerUser.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => { state.status = 'succeeded'; state.isAuthenticated = true; state.user = action.payload; localStorage.setItem('user', JSON.stringify(action.payload)); })
      .addCase(registerUser.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message || 'Registration failed'; })
      .addCase(loginUser.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => { state.status = 'succeeded'; state.isAuthenticated = true; state.user = action.payload; localStorage.setItem('user', JSON.stringify(action.payload)); })
      .addCase(loginUser.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message || 'Login failed'; })

      // Users list
      .addCase(fetchUsers.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Fetching users failed';
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
