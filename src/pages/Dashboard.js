import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
    fetchCampaigns,
    fetchGlobalInsights,
    fetchCampaignDetails,
    fetchInsights,
    startInsightsStream,
    // Note: If you add clearError, you'd import it here too
} from "../store/campaignsSlice";

import { Card } from "../components/ui/Card";
import { Loader2, Zap } from "lucide-react"; 
import clsx from "clsx";
import { useNotificationContext } from "../createContextStore/NotificationContext";


// --- Framer Motion Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05, 
        },
    },
};

const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1 },
};

const hoverVariants = {
    hover: {
        scale: 1.02, 
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        y: -2, 
        transition: { duration: 0.2 }
    },
    tap: {
        scale: 0.98,
    }
};

// --- Component: Skeleton Loader ---
const MetricSkeleton = () => (
    <Card className="animate-pulse bg-gray-50 border-gray-100 p-5">
        <div className="h-3 w-1/2 bg-gray-200 rounded mb-2"></div>
        <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
    </Card>
);


function Dashboard() {
    const dispatch = useDispatch();
    const { openNotification } = useNotificationContext(); 
    
    const {
        list,
        insights,
        selectedCampaign,
        globalInsights,
        streamingData,
        loading,
        error, // <-- Get the error state from Redux
    } = useSelector((s) => s.campaigns);


    // --- 1. Initial Data Fetch ---
    useEffect(() => {
        dispatch(fetchCampaigns());
        dispatch(fetchGlobalInsights());
    }, [dispatch]);


    // --- 2. ERROR HANDLING: Display Toast Notification ---
    useEffect(() => {
        if (error) {
            // Display a dismissible error toast
            openNotification(
                "error", 
                "Dashboard Error", 
                error || "Something went wrong during data fetching.",
                true
            );
            // If you added clearError to your slice, you would call:
            // dispatch(clearError()); 
        }
    }, [error, openNotification, dispatch]); 

    // Safety check for potentially nested campaign details data structure
    const campaignDetails = selectedCampaign?.campaign || selectedCampaign;

    
    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8 bg-gray-50 min-h-screen">
            
            {/* OVERALL METRICS PANEL (Wide Column) */}
            <div className="lg:col-span-4 xl:col-span-5">
                <h1 className="text-2xl font-extrabold text-gray-800 mb-6">
                    📈 Beta Dashboard <span className="text-sm font-normal text-gray-500"> / Overview</span>
                </h1>

                {/* GLOBAL INSIGHTS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Show Skeletons while loading */}
                    {loading && !globalInsights && !error && Array(4).fill(0).map((_, i) => <MetricSkeleton key={i} />)}

                    {/* Show loaded insights */}
                    {globalInsights && (
                        <motion.div
                            className="contents" 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {Object.entries(globalInsights).map(([k, v]) => (
                                <motion.div key={k} variants={itemVariants}>
                                    <Card className="p-5">
                                        <p className="text-gray-500 uppercase text-xs font-medium tracking-wider mb-1">{k.replace('_', ' ')}</p>
                                        <p className="text-3xl font-bold text-gray-900">{v}</p>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Show inline error state for global insights if fetching failed */}
                    {error && !globalInsights && (
                        <p className="md:col-span-4 text-center text-red-500 p-4 border border-red-200 bg-red-50 rounded-lg">
                            ⚠️ Failed to load overall metrics: {error}
                        </p>
                    )}
                </div>
            </div>

            {/* CAMPAIGN LIST (Narrow Sidebar) */}
            <div className="lg:col-span-1 space-y-4">
                <h2 className="text-lg font-bold text-gray-700 mb-2">Campaigns ({list?.length || 0})</h2>

                {/* Show loader only if list is empty and loading */}
                {loading && !list?.length && (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                    </div>
                )}
                
                {/* Campaign list */}
                {list?.length > 0 && (
                    <motion.div
                        className="space-y-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {list.map((c) => {
                            const isSelected = campaignDetails?.id === c.id; 
                            return (
                                <Card
                                    as={motion.div}
                                    key={c.id}
                                    className={clsx(
                                        "cursor-pointer p-4 transition-all duration-200",
                                        "hover:border-indigo-400",
                                        isSelected ? "bg-indigo-50 border-indigo-500 shadow-md" : "border-gray-200"
                                    )}
                                    onClick={() => {
                                        dispatch(fetchInsights(c.id));
                                        dispatch(fetchCampaignDetails(c.id));
                                        dispatch(startInsightsStream(c.id));
                                    }}
                                    variants={{ ...itemVariants, ...hoverVariants }}
                                    whileHover="hover"
                                    whileTap="tap"
                                >
                                    <p className={clsx("font-semibold", isSelected ? "text-indigo-800" : "text-gray-800")}>{c.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">Platform: {c.platforms?.[0]}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-sm font-medium text-gray-600">${c.daily_budget} / Day</p>
                                        <div
                                            className={clsx(
                                                "inline-block px-3 py-1 rounded-full text-xs font-semibold",
                                                c.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                            )}
                                        >
                                            {c.status === "active" ? "Active" : "Inactive"}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </motion.div>
                )}
                
                {/* Show inline error state for campaigns list */}
                {error && !list?.length && !loading && (
                    <p className="text-red-500 text-sm italic p-4 border border-red-100 rounded-lg">
                        Could not load campaign list.
                    </p>
                )}
            </div>

            {/* INSIGHTS & REAL-TIME PANEL (Main Content Area) */}
            <div className="lg:col-span-3 xl:col-span-4">

                {/* CAMPAIGN DETAILS */}
                <Card className="mb-8 bg-white p-6 shadow-sm border-l-4 border-l-indigo-500">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        {campaignDetails?.name || "Select a Campaign"}
                    </h2>
                    {campaignDetails ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600"
                        >
                            <p><strong>Status:</strong> <span className={clsx("font-medium", campaignDetails.status === "active" ? "text-green-600" : "text-red-600")}>{campaignDetails.status}</span></p>
                            <p><strong>Platform:</strong> {campaignDetails.platforms?.[0]}</p>
                            <p><strong>Total Budget:</strong> ${campaignDetails.budget}</p>
                            <p><strong>Daily Budget:</strong> ${campaignDetails.daily_budget}</p>
                        </motion.div>
                    ) : (
                        <p className="text-gray-500">Campaign details will appear here upon selection.</p>
                    )}
                </Card>

                {/* INSIGHTS GRID */}
                <h2 className="text-xl font-bold text-gray-700 mb-4">Key Performance Indicators</h2>
                
                {/* Loading/empty state for insights */}
                {loading && selectedCampaign && !insights && <p className="text-indigo-500">Fetching insights...</p>}

                {!insights && !loading && <p className="text-gray-500">Select a campaign to view detailed insights.</p>}
                
                {insights && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {Object.entries(insights).map(([k, v]) => {
                            if (k === "timestamp") {
                                v = new Date(v).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                });
                            }

                            return (
                                <motion.div key={k} variants={itemVariants}>
                                    <Card className="p-5 shadow-sm">
                                        <p className="text-gray-500 uppercase text-xs font-medium tracking-wider mb-1">{k.replace('_', ' ')}</p>
                                        <p className="text-2xl font-extrabold text-indigo-600">{v}</p>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* REAL-TIME STREAMING */}
                {streamingData && (
                    <div className="mt-10">
                        <h3 className="flex items-center gap-2 font-bold text-lg mb-4 text-indigo-600">
                            <Zap className="w-5 h-5 fill-indigo-200 text-indigo-500" />
                            Live Metrics (Real-Time Stream)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {Object.entries(streamingData).map(([k, v]) => (
                                <Card key={k} className="p-5 bg-indigo-50 border-indigo-200">
                                    <p className="text-gray-600 text-sm font-medium mb-1">{k}</p>
                                    <motion.p
                                        key={v} 
                                        initial={{ scale: 0.9, opacity: 0.6 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        className="text-2xl font-extrabold text-indigo-800 inline-block"
                                    >
                                        {v}
                                    </motion.p>
                                </Card>
                            ))}
                        </div>

                        <p className="text-xs text-indigo-500 mt-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                            Data updating from live feed...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;