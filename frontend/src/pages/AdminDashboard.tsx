import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/layout/Card";

export const AdminDashboard: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Administrator Dashboard</h1>
            <Card>
                <CardHeader>
                    <CardTitle>System Administration</CardTitle>
                    <CardDescription>Manage platform-wide settings and security logs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Only root administrators should see this dashboard.</p>
                </CardContent>
            </Card>
        </div>
    );
};
