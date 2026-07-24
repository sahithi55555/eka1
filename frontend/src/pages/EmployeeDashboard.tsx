import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/layout/Card";

export const EmployeeDashboard: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Employee Dashboard</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Welcome Employee</CardTitle>
                    <CardDescription>This is your personal workspace.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Only employees and higher roles should see this panel.</p>
                </CardContent>
            </Card>
        </div>
    );
};
