// src/store/campaignsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = process.env.REACT_APP_API_URL;

/* -------------------------------------------
   1) GET ALL CAMPAIGNS
-------------------------------------------- */
export const fetchCampaigns = createAsyncThunk(
    "campaigns/fetchCampaigns",
    async () => {
        const res = await fetch(`${BASE_URL}/campaigns`);
        const json = await res.json();
        return json.campaigns;
    }
);

/* -------------------------------------------
   2) GET SINGLE CAMPAIGN DETAILS
-------------------------------------------- */
export const fetchCampaignDetails = createAsyncThunk(
    "campaigns/fetchCampaignDetails",
    async (id) => {
        const res = await fetch(`${BASE_URL}/campaigns/${id}`);
        return await res.json();
    }
);

/* -------------------------------------------
   3) GET GLOBAL (AGGREGATE) INSIGHTS
-------------------------------------------- */
export const fetchGlobalInsights = createAsyncThunk(
    "campaigns/fetchGlobalInsights",
    async () => {
        const res = await fetch(`${BASE_URL}/campaigns/insights`);
        const json = await res.json();
        return json.insights;
    }
);

/* -------------------------------------------
   4) GET CAMPAIGN-SPECIFIC INSIGHTS
-------------------------------------------- */
export const fetchInsights = createAsyncThunk(
    "campaigns/fetchInsights",
    async (id) => {
        const res = await fetch(`${BASE_URL}/campaigns/${id}/insights`);
        const json = await res.json();
        return { id, data: json.insights };
    }
);

/* -------------------------------------------
   5) STREAM REAL-TIME INSIGHTS (SSE)
-------------------------------------------- */
export const startInsightsStream = createAsyncThunk(
    "campaigns/startStream",
    async (id, { dispatch }) => {
        const url = `${BASE_URL}/campaigns/${id}/insights/stream`;
        const eventSource = new EventSource(url);

        eventSource.onmessage = (event) => {
            dispatch(streamUpdate(JSON.parse(event.data)));
        };

        eventSource.onerror = () => {
            eventSource.close();
        };

        return true;
    }
);

/* -------------------------------------------
   SLICE
-------------------------------------------- */
const campaignsSlice = createSlice({
    name: "campaigns",
    initialState: {
        list: [],
        selectedCampaign: null,
        insights: null,
        globalInsights: null,
        streamingData: null,
        loading: false,
    },

    reducers: {
        streamUpdate: (state, action) => {
            state.streamingData = action.payload;
        },
    },

    extraReducers: (builder) => {
        builder

            // FETCH CAMPAIGNS
            .addCase(fetchCampaigns.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCampaigns.fulfilled, (state, action) => {
                state.list = action.payload;
                state.loading = false;
            })

            // CAMPAIGN DETAILS
            .addCase(fetchCampaignDetails.fulfilled, (state, action) => {
                state.selectedCampaign = action.payload;
            })

            // GLOBAL INSIGHTS
            .addCase(fetchGlobalInsights.fulfilled, (state, action) => {
                state.globalInsights = action.payload;
            })

            // SPECIFIC INSIGHTS
            .addCase(fetchInsights.fulfilled, (state, action) => {
                state.insights = action.payload.data;
            });
    },
});

export const { streamUpdate } = campaignsSlice.actions;
export default campaignsSlice.reducer;
