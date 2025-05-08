"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

export default function EmailDashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Email Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Create New Email</h2>
                    <p className="text-gray-600 mb-4">Start a new email campaign from scratch</p>
                    <button
                        onClick={() => router.push('/emails/steps/one')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Create Email
                    </button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Recent Campaigns</h2>
                    <p className="text-gray-600 mb-4">View and manage your recent email campaigns</p>
                    <button
                        onClick={() => router.push('/emails/campaigns')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        View Campaigns
                    </button>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Email Templates</h2>
                    <p className="text-gray-600 mb-4">Access and manage your email templates</p>
                    <button
                        onClick={() => router.push('/emails/templates')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        View Templates
                    </button>
                </div>
            </div>
        </div>
    );
} 