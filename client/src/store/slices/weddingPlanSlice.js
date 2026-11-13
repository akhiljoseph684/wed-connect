import { createSlice } from '@reduxjs/toolkit';

const weddingPlanSlice = createSlice({
  name: 'weddingPlan',
  initialState: {
    activePlan: null,
    plans: [],
    loading: false,
    stats: null,
  },
  reducers: {
    setActivePlan: (state, action) => {
      state.activePlan = action.payload;
    },
    setPlans: (state, action) => {
      state.plans = action.payload;
      if (!state.activePlan && action.payload.length > 0) {
        state.activePlan = action.payload[0];
      }
    },
    setPlanStats: (state, action) => {
      state.stats = action.payload;
    },
    updateActivePlanData: (state, action) => {
      if (state.activePlan) {
        state.activePlan = { ...state.activePlan, ...action.payload };
      }
    },
  },
});

export const { setActivePlan, setPlans, setPlanStats, updateActivePlanData } = weddingPlanSlice.actions;
export default weddingPlanSlice.reducer;
