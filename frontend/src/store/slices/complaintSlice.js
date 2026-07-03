import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api.js";

// 1. Fetch All Complaints Thunk
export const fetchComplaints = createAsyncThunk("complaints/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/complaints");
    return data.complaints;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to fetch complaints");
  }
});

// 2. Create Complaint Thunk (FIXED MULTIPART CONTENT-TYPE FOR CLOUDINARY)
export const createComplaint = createAsyncThunk("complaints/create", async (complaintData, { rejectWithValue }) => {
  try {
    // 🚨 FIXED: Yahan explicitly multipart header pass kiya hai taaki api.js ka global JSON header override ho sake
    const { data } = await api.post("/complaints", complaintData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data.complaint;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Failed to create complaint");
  }
});

// 3. Track Single Complaint Thunk
export const trackComplaint = createAsyncThunk("complaints/track", async (trackingId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/complaints/track/${trackingId}`);
    return data.complaint;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Complaint not found");
  }
});

// 4. Complaint Slice Definition
const complaintSlice = createSlice({
  name: "complaints",
  initialState: {
    list: [],
    tracked: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    clearSuccess(state) { state.success = false; },
    clearError(state) { state.error = null; },
    clearTracked(state) { state.tracked = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Complaints Handlers
      .addCase(fetchComplaints.pending, (state) => { state.loading = true; })
      .addCase(fetchComplaints.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchComplaints.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Create Complaint Handlers
      .addCase(createComplaint.pending, (state) => { state.loading = true; state.success = false; })
      .addCase(createComplaint.fulfilled, (state, action) => { state.loading = false; state.success = true; state.list.unshift(action.payload); })
      .addCase(createComplaint.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Track Complaint Handlers
      .addCase(trackComplaint.pending, (state) => { state.loading = true; state.tracked = null; })
      .addCase(trackComplaint.fulfilled, (state, action) => { state.loading = false; state.tracked = action.payload; })
      .addCase(trackComplaint.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearSuccess, clearError, clearTracked } = complaintSlice.actions;
export default complaintSlice.reducer;