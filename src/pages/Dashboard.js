// src/pages/Dashboard.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchCampaigns,
    fetchGlobalInsights,
    fetchCampaignDetails,
    fetchInsights,
    startInsightsStream,
} from "../store/campaignsSlice";

import { Card } from "../components/ui/Card";
import { Loader2 } from "lucide-react";

function Dashboard() {
    const dispatch = useDispatch();

    const {
        list,
        insights,
        selectedCampaign,
        globalInsights,
        streamingData,
        loading,
    } = useSelector((s) => s.campaigns);


    useEffect(() => {
        dispatch(fetchCampaigns());
        dispatch(fetchGlobalInsights());
    }, [dispatch]);

    console.log(streamingData, "streamingData");


    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-100 min-h-screen">
            <div className="md:col-span-4">
                <h2 className="text-xl font-bold mb-2">Overall Dashboard Metrics</h2>

                {!globalInsights && <p className="text-gray-500">Loading...</p>}

                {globalInsights && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {Object.entries(globalInsights).map(([k, v]) => (
                            <Card key={k} className="p-4 bg-white shadow">
                                <p className="text-gray-500 uppercase text-xs">{k}</p>
                                <p className="text-xl font-bold">{v}</p>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* CAMPAIGN LIST */}
            <div className="md:col-span-1 space-y-4">
                <h2 className="text-xl font-bold">Campaigns</h2>

                {loading && <Loader2 className="animate-spin" />}

                {list?.map((c) => (
                    <Card
                        key={c.id}
                        className="cursor-pointer hover:shadow-lg p-4"
                        onClick={() => {
                            dispatch(fetchInsights(c.id));
                            dispatch(fetchCampaignDetails(c.id));
                            dispatch(startInsightsStream(c.id));
                        }}
                    >
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-sm text-gray-500">Platform: {c.platforms?.[0]}</p>
                        <p className="text-sm text-gray-500">Budget: {c.budget}</p>
                        <p className="text-sm text-gray-500">Daily Budget: {c.daily_budget}</p>

                        <div
                            className={`inline-block px-2 py-1 rounded-full text-white text-xs font-semibold mt-2 
                            ${c.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                        >
                            {c.status === "active" ? "Active" : "Inactive"}
                        </div>
                    </Card>
                ))}
            </div>

            {/* RIGHT SIDE PANEL */}
            <div className="md:col-span-3">

                {/* CAMPAIGN DETAILS */}
                {/* {selectedCampaign && (
                    <div className="mb-6 p-4 bg-white shadow rounded-lg">
                        <h2 className="text-lg font-semibold mb-2">Campaign Details</h2>

                        <p><strong>Name:</strong> {selectedCampaign.name}</p>
                        <p><strong>Status:</strong> {selectedCampaign.status}</p>
                        <p><strong>Platform:</strong> {selectedCampaign.platforms?.[0]}</p>
                        <p><strong>Budget:</strong> {selectedCampaign.budget}</p>
                        <p><strong>Daily Budget:</strong> {selectedCampaign.daily_budget}</p>
                        <p><strong>Objective:</strong> {selectedCampaign.objective}</p>
                    </div>
                )} */}

                {/* INSIGHTS */}
                <h2 className="text-xl font-bold mb-4">Insights</h2>

                {!insights && <p>Select a campaign to view insights.</p>}

                {insights && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(insights).map(([k, v]) => {
                            if (k === "timestamp") {
                                v = new Date(v).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                });
                            }

                            return (
                                <Card key={k} className="p-4 shadow bg-white">
                                    <p className="text-gray-500 uppercase text-xs">{k}</p>
                                    <p className="text-xl font-bold">{v}</p>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* REAL-TIME STREAMING */}
                {streamingData && (
                    <div className="mt-8">
                        <h3 className="font-semibold mb-2 text-green-600">
                            Live Metrics (Real-Time)
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(streamingData).map(([k, v]) => (
                                <Card key={k} className="p-4 bg-green-50 border border-green-300">
                                    <p className="text-gray-600 text-sm">{k}</p>
                                    <p className="text-xl font-bold">{v}</p>
                                </Card>
                            ))}
                        </div>

                        <p className="text-xs text-green-500 mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Updating live...
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}

export default Dashboard;
