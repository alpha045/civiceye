import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import complaintReducer from "./slices/complaintSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    complaints: complaintReducer,
  },
});
