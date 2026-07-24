import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/layout/Card";
import { Alert } from "../../../components/ui/Alert";
import { authService } from "../services/authService";

export const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await authService.login({ email, password });
            const user = await authService.getCurrentUser();
            const role = user.role || "employee";
            navigate(`/${role}/dashboard`);
        } catch (err: any) {
            setError(err.message || "Failed to login. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md px-6">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">EKA Platform</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome back! Please login to your account.</p>
                </div>

                <Card className="p-8">
                    {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                    <form onSubmit={handleLogin} className="space-y-6">
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
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Register here
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};
