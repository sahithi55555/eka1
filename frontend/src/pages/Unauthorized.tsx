import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export const Unauthorized: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-8 border rounded-lg bg-white shadow-sm dark:bg-gray-800">
                <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
                <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You do not have the required permissions to view this page.
                </p>
                <Link to="/">
                    <Button variant="primary">Return Home</Button>
                </Link>
            </div>
        </div>
    );
};
