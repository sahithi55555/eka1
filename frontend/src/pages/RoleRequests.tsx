import React, { useEffect, useState } from "react"
import {
    UserCheck,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    Search,
    AlertCircle,
    Shield
} from "lucide-react"
import { PageHeader } from "../components/common/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/layout/Card"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Alert } from "../components/ui/Alert"
import { Modal } from "../components/ui/Modal"
import { authService } from "../features/auth/services/authService"

interface RoleRequestItem {
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

export default function RoleRequests() {
    const [requests, setRequests] = useState<RoleRequestItem[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<string>("pending")
    const [searchQuery, setSearchQuery] = useState("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null)

    // Rejection modal state
    const [rejectTarget, setRejectTarget] = useState<RoleRequestItem | null>(null)
    const [rejectReason, setRejectReason] = useState("")

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const data = await authService.getRoleRequests(statusFilter === "all" ? undefined : statusFilter)
            setRequests(data)
        } catch (err: any) {
            setMessage({ type: "danger", text: err.message || "Failed to load role requests." })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [statusFilter])

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

    const handleRejectConfirm = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!rejectTarget) return

        setActionLoading(rejectTarget.email)
        setMessage(null)
        try {
            await authService.rejectRole(rejectTarget.email, rejectReason || "Request declined by administrator.")
            setMessage({ type: "success", text: `Role request for ${rejectTarget.email} has been rejected.` })
            setRejectTarget(null)
            setRejectReason("")
            await fetchRequests()
        } catch (err: any) {
            setMessage({ type: "danger", text: err.message || "Failed to reject role." })
        } finally {
            setActionLoading(null)
        }
    }

    const filteredRequests = requests.filter((r) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
            (r.full_name || "").toLowerCase().includes(q) ||
            (r.email || "").toLowerCase().includes(q) ||
            (r.designation || "").toLowerCase().includes(q) ||
            (r.department || "").toLowerCase().includes(q)
        )
    })

    const pendingCount = requests.filter(r => r.role_status === "pending").length

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
            <PageHeader
                title="Role Requests Governance"
                description="Review and authorize elevated privilege requests (Administrator, Manager) submitted by users."
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchRequests}
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

            {/* Quick Status Tabs Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border overflow-x-auto">
                    {[
                        { key: "pending", label: "Pending Approval" },
                        { key: "approved", label: "Approved" },
                        { key: "rejected", label: "Rejected" },
                        { key: "all", label: "All Records" }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setStatusFilter(tab.key)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all shrink-0 flex items-center gap-1.5 ${
                                statusFilter === tab.key
                                    ? "bg-background text-foreground shadow-sm font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <span>{tab.label}</span>
                            {tab.key === "pending" && pendingCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search requests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 text-xs"
                    />
                </div>
            </div>

            {/* Table Card */}
            <Card className="border-border bg-card/80">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-primary" />
                        <span className="capitalize">{statusFilter} Requests</span>
                    </CardTitle>
                    <CardDescription>
                        Direct privilege escalation requests submitted during account registration or role changes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-border overflow-hidden bg-card/50">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">User</th>
                                        <th className="px-4 py-3 font-semibold">Org Details</th>
                                        <th className="px-4 py-3 font-semibold">Current Role</th>
                                        <th className="px-4 py-3 font-semibold">Requested Role</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-xs text-muted-foreground">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
                                                Loading role requests...
                                            </td>
                                        </tr>
                                    ) : filteredRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-xs text-muted-foreground">
                                                No role requests found in {statusFilter} status.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map((req) => (
                                            <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-xs text-foreground">
                                                        {req.full_name || "Unknown"}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {req.email}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    <div className="text-foreground font-medium">{req.designation || "—"}</div>
                                                    <div className="text-[11px] text-muted-foreground">{req.department || "—"}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground uppercase border border-border">
                                                        {req.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase">
                                                        <Shield className="h-3 w-3" />
                                                        {req.requested_role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {req.role_status === "pending" && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                            <Clock className="h-3.5 w-3.5" /> Pending
                                                        </span>
                                                    )}
                                                    {req.role_status === "approved" && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                                                        </span>
                                                    )}
                                                    {req.role_status === "rejected" && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-500">
                                                            <XCircle className="h-3.5 w-3.5" /> Rejected
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    {req.role_status === "pending" ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={actionLoading === req.email}
                                                                onClick={() => {
                                                                    setRejectTarget(req)
                                                                    setRejectReason("")
                                                                }}
                                                                className="text-xs h-7 px-2.5 text-destructive hover:bg-destructive/10 border-destructive/30 shadow-none"
                                                            >
                                                                Reject
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="primary"
                                                                disabled={actionLoading === req.email}
                                                                onClick={() => handleApprove(req.email)}
                                                                className="text-xs h-7 px-2.5 shadow-none"
                                                            >
                                                                {actionLoading === req.email ? "Approving..." : "Approve"}
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">No action needed</span>
                                                    )}
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

            {/* Reject Confirmation Modal */}
            <Modal
                open={rejectTarget !== null}
                onClose={() => setRejectTarget(null)}
                title="Decline Role Request"
                description={`Reject privileged role request for ${rejectTarget?.full_name || rejectTarget?.email}.`}
            >
                {rejectTarget && (
                    <form onSubmit={handleRejectConfirm} className="space-y-4 pt-2">
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>
                                Declining this request will keep <strong>{rejectTarget.email}</strong> at standard <strong>{rejectTarget.role}</strong> access.
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-foreground mb-1">
                                Optional Reason for Rejection
                            </label>
                            <Input
                                placeholder="e.g., Elevated privileges require team lead confirmation"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="text-xs"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setRejectTarget(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="danger"
                                size="sm"
                            >
                                Confirm Rejection
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    )
}
