import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/layout/Card";
import { Alert } from "../../../components/ui/Alert";
import { authService } from "../services/authService";
import { Lock, Mail } from "lucide-react";

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
            // Navigate to main EKA workspace
            navigate("/home");
        } catch (err: any) {
            setError(err.message || "Failed to login. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground selection:bg-primary/20">
            <div className="w-full max-w-md px-6 py-12">
                <div className="mb-8 text-center space-y-2">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-md mb-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">EKA Platform</h1>
                    <p className="text-sm text-muted-foreground">Sign in to access your enterprise knowledge workspace</p>
                </div>

                <Card className="p-8 border-border bg-card shadow-lg">
                    {error && <Alert variant="danger" className="mb-5">{error}</Alert>}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5">
                                Work Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@company.com"
                                    className="w-full pl-10"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-primary hover:underline font-medium">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-2.5 font-semibold shadow-sm"
                            disabled={loading}
                        >
                            {loading ? "Authenticating..." : "Sign In"}
                        </Button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-border text-center text-xs text-muted-foreground">
                        <span>Don't have an account? </span>
                        <Link to="/register" className="font-semibold text-primary hover:underline ml-1">
                            Register now
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};
