// src/store/campaignsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = process.env.REACT_APP_API_URL;

// --- Helper function to handle fetch errors and parse response ---
const fetchWithErrorHandling = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        // Attempt to read the error message from the response body, or use status text
        let errorData;
        try {
            errorData = await res.json();
        } catch (e) {
            // If JSON parsing fails, use status text
            throw new Error(`Request failed with status ${res.status}: ${res.statusText}`);
        }
        // Assuming the backend sends an error message in a common field (e.g., 'message' or 'error')
        throw new Error(errorData.message || errorData.error || `Request failed with status ${res.status}.`);
    }
    return res;
};


/* -------------------------------------------
   1) GET ALL CAMPAIGNS
-------------------------------------------- */
export const fetchCampaigns = createAsyncThunk(
    "campaigns/fetchCampaigns",
    async () => {
        const res = await fetchWithErrorHandling(`${BASE_URL}/campaigns`);
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
        const res = await fetchWithErrorHandling(`${BASE_URL}/campaigns/${id}`);
        return await res.json();
    }
);

/* -------------------------------------------
   3) GET GLOBAL (AGGREGATE) INSIGHTS
-------------------------------------------- */
export const fetchGlobalInsights = createAsyncThunk(
    "campaigns/fetchGlobalInsights",
    async () => {
        const res = await fetchWithErrorHandling(`${BASE_URL}/campaigns/insights`);
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
        const res = await fetchWithErrorHandling(`${BASE_URL}/campaigns/${id}/insights`);
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

        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            eventSource.close();
            // Dispatch specific action for stream error
            dispatch(streamError("Real-time stream connection failed or closed.")); 
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
        error: null, // <-- Error state added
    },

    reducers: {
        streamUpdate: (state, action) => {
            state.streamingData = action.payload;
        },
        streamError: (state, action) => {
            state.error = action.payload; 
        },
        clearError: (state) => { 
            state.error = null;
        }
    },

    extraReducers: (builder) => {
        // --- Shared Handlers for All Async Thunks ---

        const handlePending = (state) => {
            state.loading = true;
            state.error = null; // Clear error on new request
        };

        const handleFulfilled = (state) => {
            state.loading = false;
            state.error = null; // Clear error on successful request
        };

        const handleRejected = (state, action) => {
            state.loading = false;
            // Capture the custom error message thrown in fetchWithErrorHandling
            state.error = action.error.message || "An unknown network error occurred."; 
        };

        builder
            // ==================================
            // FETCH CAMPAIGNS
            // ==================================
            .addCase(fetchCampaigns.pending, handlePending)
            .addCase(fetchCampaigns.fulfilled, (state, action) => {
                handleFulfilled(state);
                state.list = action.payload;
            })
            .addCase(fetchCampaigns.rejected, handleRejected) // REJECTED Handler

            // ==================================
            // CAMPAIGN DETAILS
            // ==================================
            .addCase(fetchCampaignDetails.pending, handlePending)
            .addCase(fetchCampaignDetails.fulfilled, (state, action) => {
                handleFulfilled(state);
                state.selectedCampaign = action.payload;
            })
            .addCase(fetchCampaignDetails.rejected, handleRejected) // REJECTED Handler
            
            // ==================================
            // GLOBAL INSIGHTS
            // ==================================
            .addCase(fetchGlobalInsights.pending, handlePending)
            .addCase(fetchGlobalInsights.fulfilled, (state, action) => {
                handleFulfilled(state);
                state.globalInsights = action.payload;
            })
            .addCase(fetchGlobalInsights.rejected, handleRejected) // REJECTED Handler

            // ==================================
            // SPECIFIC INSIGHTS
            // ==================================
            .addCase(fetchInsights.pending, handlePending)
            .addCase(fetchInsights.fulfilled, (state, action) => {
                handleFulfilled(state);
                state.insights = action.payload.data;
            })
            .addCase(fetchInsights.rejected, handleRejected) // REJECTED Handler
            
            // ==================================
            // STREAM START
            // ==================================
            .addCase(startInsightsStream.pending, handlePending)
            .addCase(startInsightsStream.fulfilled, handleFulfilled)
            .addCase(startInsightsStream.rejected, handleRejected); // REJECTED Handler
    },
});

export const { streamUpdate, streamError, clearError } = campaignsSlice.actions;
export default campaignsSlice.reducer;