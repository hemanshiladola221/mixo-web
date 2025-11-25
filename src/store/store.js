import { configureStore } from "@reduxjs/toolkit";
import campaignsReducer from "./campaignsSlice";


const store = configureStore({
    reducer: {
        campaigns: campaignsReducer,
    },
});


export default store;