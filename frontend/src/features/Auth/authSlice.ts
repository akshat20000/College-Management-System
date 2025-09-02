import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService, type LoginCredentials,type  RegisterData, type AuthResponse } from '../../services/authServices';
import type { RootState } from '../../store/store';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: authService.getCurrentUser(),
  token: localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};


// login
export const login = createAsyncThunk<AuthResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      authService.setCurrentUser(data.user);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

// register
export const register = createAsyncThunk<AuthResponse, RegisterData>(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await authService.register(formData);
      authService.setCurrentUser(data.user);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

// logout
export const logout = createAsyncThunk<void>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem('user');
    } catch (err: any) {
      return rejectWithValue('Logout failed');
    }
  }
);

// refresh token
export const refreshToken = createAsyncThunk<AuthResponse>(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.refreshToken();
      return data;
    } catch (err: any) {
      return rejectWithValue('Token refresh failed');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload;
    });

    // register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    });
    builder.addCase(register.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload;
    });

    // logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    });

    // refresh
    builder.addCase(refreshToken.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    });
  },
});

// ---------------------- Selectors ----------------------

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;

export default authSlice.reducer;
