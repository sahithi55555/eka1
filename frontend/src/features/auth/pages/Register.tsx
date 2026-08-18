import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/layout/Card";
import { Alert } from "../../../components/ui/Alert";
import { authService } from "../services/authService";

export const Register: React.FC = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [designation, setDesignation] = useState("");
    const [department, setDepartment] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await authService.register({ full_name: fullName, email, password, designation, department });
            setSuccess(true);
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to register. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md px-6">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create an Account</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Join the EKA Platform today.</p>
                </div>

                <Card className="p-8">
                    {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                    {success && (
                        <Alert variant="success" className="mb-4">
                            Registration successful! Redirecting to login...
                        </Alert>
                    )}
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Full Name</label>
                            <Input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Email Address</label>
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Password</label>
                            <Input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Designation / Job Title</label>
                            <Input
                                type="text"
                                required
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                placeholder="Software Engineer"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-200">Department</label>
                            <Input
                                type="text"
                                required
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                placeholder="Engineering"
                                className="w-full"
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={loading || success}
                        >
                            {loading ? "Creating account..." : "Register"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Log in
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};
