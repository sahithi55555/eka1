import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/layout/Card";
import { Alert } from "../../../components/ui/Alert";
import { authService } from "../services/authService";
import { User, Mail, Lock, Briefcase, Building2, Shield } from "lucide-react";

export const Register: React.FC = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [designation, setDesignation] = useState("");
    const [department, setDepartment] = useState("");
    const [requestedRole, setRequestedRole] = useState("employee");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await authService.register({
                full_name: fullName,
                email,
                password,
                designation,
                department,
                requested_role: requestedRole,
            });
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
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground selection:bg-primary/20">
            <div className="w-full max-w-lg px-6 py-12">
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
                    <h1 className="text-3xl font-extrabold tracking-tight">Create an Account</h1>
                    <p className="text-sm text-muted-foreground">Join the EKA enterprise knowledge network</p>
                </div>

                <Card className="p-8 border-border bg-card shadow-lg">
                    {error && <Alert variant="danger" className="mb-5">{error}</Alert>}
                    {success && (
                        <Alert variant="success" className="mb-5">
                            Registration successful! {requestedRole !== "employee" ? "Your privileged role request has been submitted for admin review." : ""} Redirecting to login...
                        </Alert>
                    )}
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Jane Doe"
                                    className="w-full pl-10"
                                    disabled={loading || success}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5">
                                Corporate Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="jane.doe@company.com"
                                    className="w-full pl-10"
                                    disabled={loading || success}
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
                                    disabled={loading || success}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1.5">
                                    Designation / Title
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        required
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                        placeholder="Principal Architect"
                                        className="w-full pl-10 text-xs"
                                        disabled={loading || success}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1.5">
                                    Department
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        required
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        placeholder="Engineering"
                                        className="w-full pl-10 text-xs"
                                        disabled={loading || success}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-primary" />
                                Initial Requested Role
                            </label>
                            <select
                                value={requestedRole}
                                onChange={(e) => setRequestedRole(e.target.value)}
                                disabled={loading || success}
                                className="w-full px-3 py-2 border rounded-lg shadow-sm bg-background border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="employee">Employee (Standard Knowledge Access)</option>
                                <option value="manager">Manager (Knowledge + Department Analytics)</option>
                                <option value="admin">Administrator (Full RBAC & System Governance)</option>
                            </select>
                            {requestedRole !== "employee" && (
                                <p className="mt-1.5 text-xs text-amber-500 flex items-center gap-1">
                                    <span>⚠️ Privileged roles require administrator approval. Standard access is granted immediately.</span>
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-2.5 mt-2 font-semibold shadow-sm"
                            disabled={loading || success}
                        >
                            {loading ? "Creating account..." : "Complete Registration"}
                        </Button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-border text-center text-xs text-muted-foreground">
                        <span>Already registered? </span>
                        <Link to="/login" className="font-semibold text-primary hover:underline ml-1">
                            Sign in here
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

