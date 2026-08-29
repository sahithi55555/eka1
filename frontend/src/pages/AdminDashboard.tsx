import React from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/layout/Card";
import { Button } from "../components/ui/Button";
import { ShieldCheck, UserCheck, Settings, ArrowRight } from "lucide-react";

export const AdminDashboard: React.FC = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Administrator Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Overview of platform administration, role governance, and system security.
                    </p>
                </div>
                <Link to="/admin">
                    <Button variant="primary" className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 mr-1" />
                        <span>Manage Role Requests</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            <span>Role Governance & Access Control</span>
                        </CardTitle>
                        <CardDescription>
                            Review incoming role requests and manage user RBAC permissions across the enterprise.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Users requesting elevated roles (such as Administrator or Manager) remain in a safe pending status until approved.
                        </p>
                        <Link to="/admin">
                            <Button variant="outline" size="sm">
                                Open Role Governance
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Settings className="w-5 h-5 text-gray-600" />
                            <span>System Settings & Health</span>
                        </CardTitle>
                        <CardDescription>
                            Configure platform settings and check microservice connectivity.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            All API authentication tokens and MongoDB access control policies are active and healthy.
                        </p>
                        <Link to="/settings">
                            <Button variant="outline" size="sm">
                                View Platform Settings
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

