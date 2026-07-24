import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/layout/Card";
import { Alert } from "../../../components/ui/Alert";

export const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md px-6">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reset password</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Enter your email and we'll send a reset link.</p>
                </div>

                <Card className="p-8">
                    {submitted ? (
                        <div className="text-center">
                            <Alert variant="success" className="mb-6">
                                If an account exists for {email}, you will receive reset instructions shortly.
                            </Alert>
                            <Link to="/login">
                                <Button variant="outline" className="w-full">Back to log in</Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                            <Button type="submit" variant="primary" className="w-full">
                                Send reset instructions
                            </Button>
                            <div className="mt-6 text-center text-sm">
                                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                    ← Back to log in
                                </Link>
                            </div>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
};
