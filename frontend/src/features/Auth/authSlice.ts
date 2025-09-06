import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService, type LoginCredentials, type RegisterData, type AuthResponse } from '../../services/authServices';
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
      authService.setCurrentUser(data.user);
      return data;
    } catch (err: any) {
      return rejectWithValue('Token refresh failed');
    }
  },
  {
    // if a request is already in progress.
    // If it is, the new dispatch will be cancelled before the API call is made.
    condition: (_, { getState }) => {
      const { auth } = getState() as RootState;
      if (auth.loading) {
        return false;
      }
    },
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // login cases...
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

    // register cases...
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

    // logout cases...
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;
    });

    // --- FIX: Add pending and rejected cases for refreshToken ---
    builder.addCase(refreshToken.pending, (state) => {
      // Set loading to true when the refresh/verify action starts
      state.loading = true;
      state.error = null;
    });
    builder.addCase(refreshToken.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
      // When it succeeds, update the state and set loading to false
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
    });
    builder.addCase(refreshToken.rejected, (state, action: any) => {
      // When it fails, clear the session and set loading to false
      state.loading = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
    });
  },
});

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;

export default authSlice.reducer;
