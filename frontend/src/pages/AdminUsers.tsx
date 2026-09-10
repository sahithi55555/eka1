import { useEffect, useState } from "react"
import {
    Users,
    Search,
    UserCheck,
    RefreshCw,
    CheckCircle2,
    Clock,
    XCircle
} from "lucide-react"
import { PageHeader } from "../components/common/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/layout/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Alert } from "../components/ui/Alert"
import { Modal } from "../components/ui/Modal"
import { authService } from "../features/auth/services/authService"

interface UserRecord {
    id: string
    email: string
    full_name: string
    designation?: string
    department?: string
    role: string
    requested_role: string
    role_status: string
    created_at?: string
}

export default function AdminUsers() {
    const [users, setUsers] = useState<UserRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null)

    // Promote modal state
    const [promoteUserTarget, setPromoteUserTarget] = useState<UserRecord | null>(null)
    const [selectedRole, setSelectedRole] = useState("manager")
    const [isPromoting, setIsPromoting] = useState(false)

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const data = await authService.getRoleRequests(undefined)
            setUsers(data)
        } catch (err: any) {
            setMessage({ type: "danger", text: err.message || "Failed to load user list." })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handlePromoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!promoteUserTarget) return

        setIsPromoting(true)
        setMessage(null)
        try {
            await authService.promoteUser(promoteUserTarget.email, selectedRole)
            setMessage({
                type: "success",
                text: `Successfully updated ${promoteUserTarget.email} role to ${selectedRole.toUpperCase()}.`
            })
            setPromoteUserTarget(null)
            await fetchUsers()
        } catch (err: any) {
            setMessage({ type: "danger", text: err.message || "Failed to update user role." })
        } finally {
            setIsPromoting(false)
        }
    }

    const filteredUsers = users.filter((u) => {
        const matchesRole = roleFilter === "all" || u.role === roleFilter
        if (!matchesRole) return false

        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
            (u.full_name || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            (u.designation || "").toLowerCase().includes(q) ||
            (u.department || "").toLowerCase().includes(q)
        )
    })

    const roleCounts = {
        total: users.length,
        admin: users.filter(u => u.role === "admin").length,
        manager: users.filter(u => u.role === "manager").length,
        employee: users.filter(u => u.role === "employee").length,
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
            <PageHeader
                title="User Governance & Access Control"
                description="Manage organizational accounts, inspect RBAC roles, and reassign user permissions."
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchUsers}
                        disabled={loading}
                        className="gap-1.5"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        <span>Refresh</span>
                    </Button>
                }
            />

            {message && (
                <Alert variant={message.type} className="mb-4">
                    {message.text}
                </Alert>
            )}

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Total Users</span>
                    <p className="text-2xl font-bold text-foreground">{roleCounts.total}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                    <span className="text-xs text-muted-foreground font-medium text-purple-600 dark:text-purple-400">Administrators</span>
                    <p className="text-2xl font-bold text-foreground">{roleCounts.admin}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                    <span className="text-xs text-muted-foreground font-medium text-blue-600 dark:text-blue-400">Managers</span>
                    <p className="text-2xl font-bold text-foreground">{roleCounts.manager}</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                    <span className="text-xs text-muted-foreground font-medium text-muted-foreground">Employees</span>
                    <p className="text-2xl font-bold text-foreground">{roleCounts.employee}</p>
                </div>
            </div>

            {/* Users Table Card */}
            <Card className="border-border bg-card/80">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span>Organization Users</span>
                            </CardTitle>
                            <CardDescription>
                                All registered organization members and their current access levels.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, department..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 text-xs"
                            />
                        </div>

                        <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border overflow-x-auto">
                            {[
                                { key: "all", label: "All Roles" },
                                { key: "admin", label: "Admin" },
                                { key: "manager", label: "Manager" },
                                { key: "employee", label: "Employee" }
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setRoleFilter(tab.key)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all shrink-0 ${
                                        roleFilter === tab.key
                                            ? "bg-background text-foreground shadow-sm font-semibold"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-xl border border-border overflow-hidden bg-card/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">User</th>
                                        <th className="px-4 py-3 font-semibold">Department & Title</th>
                                        <th className="px-4 py-3 font-semibold">Active Role</th>
                                        <th className="px-4 py-3 font-semibold">Role Status</th>
                                        <th className="px-4 py-3 font-semibold">Registered</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-xs text-muted-foreground">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
                                                Loading organizational users...
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-xs text-muted-foreground">
                                                No users found matching "{searchQuery}".
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                            {u.full_name ? u.full_name.charAt(0).toUpperCase() : "U"}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-xs text-foreground truncate">
                                                                {u.full_name || "Unknown"}
                                                            </p>
                                                            <p className="text-[11px] text-muted-foreground truncate">
                                                                {u.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    <div className="text-foreground font-medium">{u.designation || "—"}</div>
                                                    <div className="text-[11px] text-muted-foreground">{u.department || "—"}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                                                        u.role === "admin"
                                                            ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                                            : u.role === "manager"
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                                            : "bg-muted text-muted-foreground border border-border"
                                                    }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {u.role_status === "approved" ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                                                        </span>
                                                    ) : u.role_status === "pending" ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                                                            <Clock className="h-3.5 w-3.5" /> Pending ({u.requested_role})
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs text-rose-500 font-medium">
                                                            <XCircle className="h-3.5 w-3.5" /> Rejected
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                    {u.created_at ? new Date(u.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"}
                                                </td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setPromoteUserTarget(u)
                                                            setSelectedRole(u.role === "admin" ? "manager" : "admin")
                                                        }}
                                                        className="text-xs h-7 px-2.5 gap-1 shadow-none"
                                                    >
                                                        <UserCheck className="h-3.5 w-3.5" />
                                                        <span>Change Role</span>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Promote Role Modal */}
            <Modal
                open={promoteUserTarget !== null}
                onClose={() => setPromoteUserTarget(null)}
                title="Update User Access Role"
                description={`Reassign permissions and RBAC role for ${promoteUserTarget?.full_name || promoteUserTarget?.email}.`}
            >
                {promoteUserTarget && (
                    <form onSubmit={handlePromoteSubmit} className="space-y-4 pt-2">
                        <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1">
                            <p className="text-muted-foreground">User: <strong className="text-foreground">{promoteUserTarget.full_name}</strong> ({promoteUserTarget.email})</p>
                            <p className="text-muted-foreground">Current Active Role: <strong className="text-foreground uppercase">{promoteUserTarget.role}</strong></p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                New Active Role
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-background border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                            >
                                <option value="admin">Administrator (Full Access)</option>
                                <option value="manager">Manager (Elevated Access)</option>
                                <option value="employee">Employee (Standard Access)</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2 pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setPromoteUserTarget(null)}
                                disabled={isPromoting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                disabled={isPromoting}
                            >
                                {isPromoting ? "Saving..." : "Confirm Role Update"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    )
}
