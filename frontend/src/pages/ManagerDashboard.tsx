import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/layout/Card";

export const ManagerDashboard: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Manager Dashboard</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Team Overview</CardTitle>
                    <CardDescription>Manage your team metrics and reports.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Only managers and administrators should see this workflow.</p>
                </CardContent>
            </Card>
        </div>
    );
};
