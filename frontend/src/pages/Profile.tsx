import { useEffect, useState } from "react"
import {
    User,
    Mail,
    Briefcase,
    Building2,
    Shield,
    CheckCircle2,
    Clock,
    AlertCircle,
    KeyRound
} from "lucide-react"
import { PageHeader } from "../components/common/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/layout/Card"
import { authService } from "../features/auth/services/authService"

interface UserProfileData {
    id: string
    email: string
    full_name: string
    role: string
    requested_role?: string
    role_status?: string
    designation?: string
    department?: string
}

export default function Profile() {
    const [user, setUser] = useState<UserProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true
        authService.getCurrentUser()
            .then(data => {
                if (isMounted) setUser(data)
            })
            .catch(err => {
                if (isMounted) setError(err.message || "Failed to load profile details.")
            })
            .finally(() => {
                if (isMounted) setLoading(false)
            })
        return () => { isMounted = false }
    }, [])

    if (loading) {
        return (
            <div className="p-6 max-w-5xl mx-auto flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="p-6 max-w-5xl mx-auto">
                <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error || "Unable to load user profile."}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
            <PageHeader
                title="User Profile"
                description="View your organizational profile, department assignments, and system access role."
            />

            {/* Profile Identity Card */}
            <Card className="border-border bg-card/80 shadow-sm overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b border-border/50" />
                <CardContent className="px-6 pb-6 pt-0 relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-10 mb-4">
                        <div className="flex items-end gap-4">
                            <div className="h-20 w-20 rounded-2xl bg-primary text-primary-foreground border-4 border-card flex items-center justify-center font-bold text-2xl shadow-md">
                                {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="space-y-0.5">
                                <h2 className="text-xl font-bold text-foreground">
                                    {user.full_name || "Enterprise User"}
                                </h2>
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span>{user.email}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 capitalize">
                                <Shield className="h-3.5 w-3.5" />
                                <span>{user.role} Access</span>
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Professional Information */}
                <Card className="border-border bg-card/70">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <span>Professional Information</span>
                        </CardTitle>
                        <CardDescription>
                            Your organizational title and assigned departmental division.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Briefcase className="h-3.5 w-3.5" /> Designation / Job Title
                            </span>
                            <p className="text-sm font-semibold text-foreground">
                                {user.designation || "Not specified"}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5" /> Department
                            </span>
                            <p className="text-sm font-semibold text-foreground">
                                {user.department || "Not specified"}
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" /> Account ID
                            </span>
                            <p className="text-xs font-mono text-foreground truncate">
                                {user.id}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Access & Security Information */}
                <Card className="border-border bg-card/70">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-primary" />
                            <span>Access & Security</span>
                        </CardTitle>
                        <CardDescription>
                            Role-Based Access Control (RBAC) privileges and verification state.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Shield className="h-3.5 w-3.5" /> Active RBAC Role
                                </span>
                                <p className="text-sm font-bold text-foreground uppercase tracking-wide">
                                    {user.role}
                                </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary text-primary-foreground uppercase">
                                {user.role}
                            </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" /> Requested Role
                                </span>
                                <p className="text-sm font-semibold text-foreground uppercase tracking-wide">
                                    {user.requested_role || user.role}
                                </p>
                            </div>
                            <div>
                                {user.role_status === "approved" ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                                    </span>
                                ) : user.role_status === "pending" ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                        <Clock className="h-3.5 w-3.5" /> Pending Review
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/30">
                                        <AlertCircle className="h-3.5 w-3.5" /> Rejected
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed">
                            <p className="font-semibold text-foreground mb-0.5">Enterprise Security Policy</p>
                            User privilege levels are strictly managed by system administrators. Elevated access requests remain pending until confirmed by an authorized administrator.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
