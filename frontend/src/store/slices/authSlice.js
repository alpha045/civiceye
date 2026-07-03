import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api.js";

const storedUser = localStorage.getItem("civiceye_user");
const storedToken = localStorage.getItem("civiceye_token");

export const loginUser = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("civiceye_user", JSON.stringify(data.user));
    localStorage.setItem("civiceye_token", data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Login failed");
  }
});

export const registerUser = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/register", userData);
    localStorage.setItem("civiceye_user", JSON.stringify(data.user));
    localStorage.setItem("civiceye_token", data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Registration failed");
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (profileData, { rejectWithValue }) => {
  try {
    const { data } = await api.put("/auth/profile", profileData);
    localStorage.setItem("civiceye_user", JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Update failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("civiceye_user");
      localStorage.removeItem("civiceye_token");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.token = action.payload.token; })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.token = action.payload.token; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateProfile.fulfilled, (state, action) => { state.user = action.payload.user; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
