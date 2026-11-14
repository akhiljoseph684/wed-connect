import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { platformService } from "../../services/platform.service.js";

export const fetchPlatformSettings = createAsyncThunk(
  "platform/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await platformService.getSettings();
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

const platformSlice = createSlice({
  name: "platform",

  initialState: {
    loading: false,
    initialized: false,
    error: null,
    settings: {
      maintenanceMode: false,
      enforceEmailVerification: false,
      allowNewUserRegistrations: true,
    },
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPlatformSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;

        state.settings = {
          ...state.settings,
          ...action.payload,
        };
      })

      .addCase(fetchPlatformSettings.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload;
      });
  },
});

export default platformSlice.reducer;
