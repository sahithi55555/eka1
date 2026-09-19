import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PageHeader } from "../components/common/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/layout/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Alert } from "../components/ui/Alert"
import { authService } from "../features/auth/services/authService"
import { ShieldCheck, CheckCircle2, XCircle, Clock, RefreshCw, UserCheck, Search, Users, ArrowRight } from "lucide-react"

interface RoleRequest {
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

export default function Admin() {
    const [requests, setRequests] = useState<RoleRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null)

    // Manual promote state
    const [promoteEmail, setPromoteEmail] = useState("")
    const [promoteRole, setPromoteRole] = useState("admin")
    const [promoteLoading, setPromoteLoading] = useState(false)

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const data = await authService.getRoleRequests(filter === "all" ? undefined : filter)
            setRequests(data)
        } catch (err: any) {
            setMessage({ type: "danger", text: err.message || "Failed to load role requests." })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [filter])

    const handleApprove = async (email: string) => {
        setActionLoading(email)
        setMessage(null)
        try {
            await authService.approveRole(email)
            setMessage({ type: "success", text: `Role request for ${email} approved successfully.` })
            await fetchRequests()
        } catch (err: any) {
            setMessage({ type: "danger", text: err.message || "Failed to approve role." })
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (email: string) => {
        setActionLoading(email)
        setMessage(null)
        try {
            await authService.rejectRole(email, "Request declined by administrator.")
            setMessage({ type: "success", text: `Role request for ${email} rejected.` })
            await fetchRequests()
        } catch (err: any) {
            setMessage({ type: "danger", text: err.message || "Failed to reject role." })
        } finally {
            setActionLoading(null)
        }
    }

    const handlePromote = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!promoteEmail) return
        setPromoteLoading(true)
        setMessage(null)
        try {
            await authService.promoteUser(promoteEmail, promoteRole)
            setMessage({ type: "success", text: `User ${promoteEmail} promoted to ${promoteRole.toUpperCase()} successfully.` })
            setPromoteEmail("")
            await fetchRequests()
        } catch (err: any) {
            setMessage({ type: "danger", text: err.message || "Failed to promote user." })
        } finally {
            setPromoteLoading(false)
        }
    }

    const filteredRequests = requests.filter((r) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
            (r.full_name || "").toLowerCase().includes(q) ||
            (r.email || "").toLowerCase().includes(q) ||
            (r.designation || "").toLowerCase().includes(q) ||
            (r.department || "").toLowerCase().includes(q)
        )
    })

    const pendingCount = requests.filter((r) => r.role_status === "pending").length

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
            <PageHeader
                title="Admin Control & Role Governance"
                description="Review role requests, manage user access, and configure organizational permissions."
            />

            {message && (
                <Alert variant={message.type} className="mb-4">
                    {message.text}
                </Alert>
            )}

            {/* Hub Direct Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                    to="/admin/users"
                    className="p-5 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">User Governance</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Manage accounts, departments, and active roles</p>
                        </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                    to="/admin/role-requests"
                    className="p-5 rounded-xl border border-border bg-card/80 hover:bg-card hover:border-primary/40 hover:shadow-md transition-all flex items-center justify-between group"
                >
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                            <UserCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <span>Role Requests</span>
                                {pendingCount > 0 && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                                        {pendingCount} Pending
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Approve or reject elevated privilege requests</p>
                        </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
            </div>

            {/* Quick Stats / Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-amber-500 bg-card/70 border-border">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-400">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Pending Requests</p>
                        <h3 className="text-2xl font-bold text-foreground">{pendingCount}</h3>
                    </div>
                </Card>

                <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-emerald-500 bg-card/70 border-border">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Approved Roles</p>
                        <h3 className="text-2xl font-bold text-foreground">
                            {requests.filter((r) => r.role_status === "approved").length}
                        </h3>
                    </div>
                </Card>

                <Card className="p-4 flex items-center space-x-4 border-l-4 border-l-blue-500 bg-card/70 border-border">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Total Users Tracked</p>
                        <h3 className="text-2xl font-bold text-foreground">{requests.length}</h3>
                    </div>
                </Card>
            </div>

            {/* Role Requests Management Table */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Role Approval Requests</CardTitle>
                            <CardDescription>
                                Secure RBAC approvals: elevated roles require explicit administrator confirmation.
                            </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
                                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters & Search */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                        <div className="flex items-center space-x-2">
                            {["all", "pending", "approved", "rejected"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize transition-colors ${
                                        filter === f
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name, email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 text-sm"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-medium">
                                <tr>
                                    <th className="px-4 py-3">User</th>
                                    <th className="px-4 py-3">Org Details</th>
                                    <th className="px-4 py-3">Active Role</th>
                                    <th className="px-4 py-3">Requested Role</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            Loading requests...
                                        </td>
                                    </tr>
                                ) : filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            No role requests found matching the current filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {req.full_name || "Unknown"}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {req.email}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                                                <div>{req.designation || "—"}</div>
                                                <div className="text-gray-400">{req.department || "—"}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 uppercase">
                                                    {req.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 uppercase">
                                                    {req.requested_role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {req.role_status === "pending" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                                        <Clock className="w-3 h-3 mr-1" /> Pending
                                                    </span>
                                                )}
                                                {req.role_status === "approved" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
                                                    </span>
                                                )}
                                                {req.role_status === "rejected" && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                                        <XCircle className="w-3 h-3 mr-1" /> Rejected
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                {req.role_status === "pending" ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            disabled={actionLoading === req.email}
                                                            onClick={() => handleApprove(req.email)}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="danger"
                                                            disabled={actionLoading === req.email}
                                                            onClick={() => handleReject(req.email)}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No action needed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Direct Promotion Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                        <span>Direct Role Promotion</span>
                    </CardTitle>
                    <CardDescription>
                        Directly elevate or reassign any user's active RBAC role immediately as an administrator.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePromote} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                User Email
                            </label>
                            <Input
                                type="email"
                                required
                                placeholder="user@company.com"
                                value={promoteEmail}
                                onChange={(e) => setPromoteEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                New Active Role
                            </label>
                            <select
                                value={promoteRole}
                                onChange={(e) => setPromoteRole(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="admin">Administrator</option>
                                <option value="manager">Manager</option>
                                <option value="employee">Employee</option>
                            </select>
                        </div>
                        <div>
                            <Button type="submit" variant="primary" className="w-full" disabled={promoteLoading}>
                                {promoteLoading ? "Promoting..." : "Promote Role"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

