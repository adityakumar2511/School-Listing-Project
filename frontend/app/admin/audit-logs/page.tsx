"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FiAlertTriangle,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiEdit,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";
import { authHeaders, getAuthToken } from "@/lib/auth-token";

// ── Types ─────────────────────────────────────────────────────────────────────

type AuditAction =
  | "SCHOOL_VERIFIED"
  | "SCHOOL_REJECTED"
  | "SCHOOL_EDITED"
  | "SCHOOL_DELETED"
  | "SCHOOL_FEATURED_TOGGLED"
  | "SCHOOL_CREATED"
  | "USER_DEACTIVATED"
  | "USER_REACTIVATED"
  | "USER_ROLE_CHANGED"
  | "TEAM_MEMBER_CREATED"
  | "TEAM_MEMBER_DEACTIVATED"
  | "TEAM_MEMBER_PERMISSIONS_UPDATED"
  | "INQUIRY_STATUS_CHANGED"
  | "INQUIRY_DELETED"
  | "ADMIN_LOGIN"
  | "ADMIN_LOGOUT";

interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string | null;
  actorRole: string;
  actorTeamRole: string | null;
  action: AuditAction;
  targetType: string;
  targetId: string;
  targetName: string | null;
  previousData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  notes: string | null;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface StatsResponse {
  totalActions: number;
  actionsByType: { action: AuditAction; _count: { action: number } }[];
  actionsByActor: {
    actorEmail: string | null;
    actorTeamRole: string | null;
    _count: { actorId: number };
  }[];
  recentDanger: AuditLog[];
}

// ── Action config ─────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<
  AuditAction,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    danger?: boolean;
  }
> = {
  SCHOOL_VERIFIED: {
    label: "Verified School",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: <FiCheck size={12} />,
  },
  SCHOOL_REJECTED: {
    label: "Rejected School",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: <FiAlertTriangle size={12} />,
  },
  SCHOOL_EDITED: {
    label: "Edited School",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: <FiEdit size={12} />,
  },
  SCHOOL_DELETED: {
    label: "Deleted School",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: <FiTrash2 size={12} />,
    danger: true,
  },
  SCHOOL_FEATURED_TOGGLED: {
    label: "Featured Toggled",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: <FiEdit size={12} />,
  },
  SCHOOL_CREATED: {
    label: "School Created",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: <FiCheck size={12} />,
  },
  USER_DEACTIVATED: {
    label: "User Deactivated",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: <FiUser size={12} />,
  },
  USER_REACTIVATED: {
    label: "User Reactivated",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: <FiUser size={12} />,
  },
  USER_ROLE_CHANGED: {
    label: "Role Changed",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: <FiUser size={12} />,
  },
  TEAM_MEMBER_CREATED: {
    label: "Team Member Added",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: <FiUser size={12} />,
  },
  TEAM_MEMBER_DEACTIVATED: {
    label: "Team Member Deactivated",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: <FiUser size={12} />,
  },
  TEAM_MEMBER_PERMISSIONS_UPDATED: {
    label: "Permissions Updated",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    icon: <FiShield size={12} />,
  },
  INQUIRY_STATUS_CHANGED: {
    label: "Inquiry Updated",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: <FiEdit size={12} />,
  },
  INQUIRY_DELETED: {
    label: "Inquiry Deleted",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: <FiTrash2 size={12} />,
  },
  ADMIN_LOGIN: {
    label: "Admin Login",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: <FiShield size={12} />,
  },
  ADMIN_LOGOUT: {
    label: "Admin Logout",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    icon: <FiShield size={12} />,
  },
};

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Actions" },
  { value: "SCHOOL_VERIFIED", label: "School Verified" },
  { value: "SCHOOL_REJECTED", label: "School Rejected" },
  { value: "SCHOOL_EDITED", label: "School Edited" },
  { value: "SCHOOL_DELETED", label: "School Deleted" },
  { value: "SCHOOL_FEATURED_TOGGLED", label: "Featured Toggled" },
  { value: "ADMIN_LOGIN", label: "Admin Login" },
  { value: "ADMIN_LOGOUT", label: "Admin Logout" },
  { value: "TEAM_MEMBER_CREATED", label: "Team Member Added" },
  { value: "TEAM_MEMBER_DEACTIVATED", label: "Team Member Deactivated" },
  { value: "USER_DEACTIVATED", label: "User Deactivated" },
  { value: "INQUIRY_STATUS_CHANGED", label: "Inquiry Updated" },
  { value: "INQUIRY_DELETED", label: "Inquiry Deleted" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function RoleBadge({ role, teamRole }: { role: string; teamRole?: string | null }) {
  if (role === "admin") {
    return (
      <span className="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
        Master Admin
      </span>
    );
  }
  const map: Record<string, string> = {
    MODERATOR: "bg-blue-100 text-blue-700",
    EDITOR: "bg-amber-100 text-amber-700",
    SUPPORT: "bg-gray-100 text-gray-700",
  };
  const cls = teamRole ? (map[teamRole] ?? "bg-gray-100 text-gray-700") : "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {teamRole ?? role}
    </span>
  );
}

// ── Diff Drawer ───────────────────────────────────────────────────────────────

function DiffDrawer({
  log,
  onClose,
}: {
  log: AuditLog;
  onClose: () => void;
}) {
  const prev = log.previousData ?? {};
  const next = log.newData ?? {};
  const allKeys = Array.from(new Set([...Object.keys(prev), ...Object.keys(next)]));
  const changedKeys = allKeys.filter((k) => JSON.stringify(prev[k]) !== JSON.stringify(next[k]));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <p className="font-semibold text-gray-900">Change Details</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {log.targetType}: {log.targetName ?? log.targetId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-gray-100 text-gray-500"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {changedKeys.length === 0 ? (
            <p className="text-sm text-gray-500">No field changes recorded.</p>
          ) : (
            changedKeys.map((key) => (
              <div key={key} className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-3 py-1.5 border-b">
                  <span className="text-xs font-mono font-semibold text-gray-700">{key}</span>
                </div>
                <div className="grid grid-cols-2 divide-x text-xs">
                  <div className="p-3 bg-red-50">
                    <p className="text-red-400 font-medium mb-1 uppercase tracking-wide text-[10px]">Before</p>
                    <pre className="text-red-700 whitespace-pre-wrap break-words font-mono">
                      {JSON.stringify(prev[key], null, 2) ?? "—"}
                    </pre>
                  </div>
                  <div className="p-3 bg-green-50">
                    <p className="text-green-400 font-medium mb-1 uppercase tracking-wide text-[10px]">After</p>
                    <pre className="text-green-700 whitespace-pre-wrap break-words font-mono">
                      {JSON.stringify(next[key], null, 2) ?? "—"}
                    </pre>
                  </div>
                </div>
              </div>
            ))
          )}

          {log.notes && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs font-semibold text-amber-700 mb-1">Note / Reason</p>
              <p className="text-sm text-amber-800">{log.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  });
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  const fetchLogs = useCallback(async () => {
    if (!getAuthToken()) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (search) params.set("search", search);
      if (actionFilter) params.set("action", actionFilter);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);

      const res = await fetch(`${API}/api/admin/audit-logs?${params}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = (await res.json()) as { logs: AuditLog[]; pagination: Pagination };
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [API, page, search, actionFilter, fromDate, toDate]);

  const fetchStats = useCallback(async () => {
    if (!getAuthToken()) return;
    try {
      const res = await fetch(`${API}/api/admin/audit-logs/stats`, {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      setStats((await res.json()) as StatsResponse);
    } catch {
      // stats are non-critical
    }
  }, [API]);

  useEffect(() => {
    void fetchLogs();
    void fetchStats();
  }, [fetchLogs, fetchStats]);

  function resetFilters() {
    setSearch("");
    setActionFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  }

  async function handleExport() {
    if (!getAuthToken()) return;
    try {
      const params = new URLSearchParams({ page: "1", limit: "10000" });
      if (search) params.set("search", search);
      if (actionFilter) params.set("action", actionFilter);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);

      const res = await fetch(`${API}/api/admin/audit-logs?${params}`, {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { logs: AuditLog[] };

      const csv = [
        ["Date", "Actor", "Role", "Action", "Target Type", "Target Name", "IP", "Notes"].join(","),
        ...data.logs.map((l) =>
          [
            new Date(l.createdAt).toISOString(),
            l.actorEmail ?? l.actorId,
            l.actorTeamRole ?? l.actorRole,
            l.action,
            l.targetType,
            `"${(l.targetName ?? "").replace(/"/g, '""')}"`,
            l.ipAddress ?? "",
            `"${(l.notes ?? "").replace(/"/g, '""')}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // export failure is non-critical
    }
  }

  const dangerCount = stats?.actionsByType.find((a) => a.action === "SCHOOL_DELETED")?._count.action ?? 0;
  const verifiedCount = stats?.actionsByType.find((a) => a.action === "SCHOOL_VERIFIED")?._count.action ?? 0;
  const mostActive = stats?.actionsByActor[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Complete record of all admin actions
            </p>
          </div>
          <button
            onClick={() => void handleExport()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#042C53] px-4 py-2 text-sm font-medium text-white hover:bg-[#185FA5] transition-colors"
          >
            <FiDownload size={15} />
            Export CSV
          </button>
        </div>

        {/* Stats Bar */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: "Actions (30 days)",
              value: stats?.totalActions ?? "—",
              color: "text-[#042C53]",
            },
            {
              label: "Most Active",
              value: mostActive?.actorEmail ?? mostActive?.actorTeamRole ?? "—",
              color: "text-purple-700",
              small: true,
            },
            {
              label: "Schools Verified",
              value: verifiedCount,
              color: "text-green-700",
            },
            {
              label: "Danger Actions",
              value: dangerCount,
              color: dangerCount > 0 ? "text-red-600" : "text-gray-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-xs text-gray-500">{s.label}</p>
              <p
                className={`mt-1 font-bold ${s.color} ${s.small ? "text-sm truncate" : "text-2xl"}`}
              >
                {String(s.value)}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search by email or school name"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-sm focus:border-[#185FA5] focus:outline-none"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#185FA5] focus:outline-none"
            >
              {ACTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#185FA5] focus:outline-none"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#185FA5] focus:outline-none"
            />

            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw size={13} />
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#185FA5] border-t-transparent" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <FiShield size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No audit logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Who</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Target</th>
                    <th className="px-4 py-3">Changes</th>
                    <th className="px-4 py-3">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => {
                    const cfg = ACTION_CONFIG[log.action];
                    const isDanger = cfg?.danger === true;
                    const hasChanges =
                      (log.previousData && Object.keys(log.previousData).length > 0) ||
                      (log.newData && Object.keys(log.newData).length > 0);

                    return (
                      <tr
                        key={log.id}
                        className={
                          isDanger
                            ? "border-l-4 border-red-400 bg-red-50"
                            : "hover:bg-gray-50"
                        }
                      >
                        {/* When */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            title={new Date(log.createdAt).toLocaleString()}
                            className="text-gray-600 cursor-default"
                          >
                            {timeAgo(log.createdAt)}
                          </span>
                        </td>

                        {/* Who */}
                        <td className="px-4 py-3">
                          <p className="truncate max-w-[160px] text-gray-800 font-medium">
                            {log.actorEmail ?? log.actorId.slice(0, 8) + "…"}
                          </p>
                          <RoleBadge role={log.actorRole} teamRole={log.actorTeamRole} />
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {cfg ? (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bgColor} ${cfg.color}`}
                            >
                              {cfg.icon}
                              {cfg.label}
                            </span>
                          ) : (
                            <span className="text-gray-500">{log.action}</span>
                          )}
                        </td>

                        {/* Target */}
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-400">{log.targetType}</p>
                          <p className="text-gray-700 truncate max-w-[180px]">
                            {log.targetName ?? log.targetId.slice(0, 12) + "…"}
                          </p>
                        </td>

                        {/* Changes */}
                        <td className="px-4 py-3">
                          {hasChanges ? (
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-[#185FA5] hover:bg-blue-50 transition-colors"
                            >
                              View Changes
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>

                        {/* IP */}
                        <td className="px-4 py-3">
                          {log.ipAddress ? (
                            <span
                              title={log.userAgent ?? ""}
                              className="text-xs text-gray-500 font-mono cursor-default"
                            >
                              {log.ipAddress}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && logs.length > 0 && (
            <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">
                Showing{" "}
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} records
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                  className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:bg-white disabled:opacity-40 transition-colors"
                >
                  <FiChevronLeft size={15} />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`min-w-[30px] rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                          pagination.page === p
                            ? "border-[#185FA5] bg-[#185FA5] text-white"
                            : "border-gray-200 text-gray-600 hover:bg-white"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  {pagination.totalPages > 5 && (
                    <span className="px-1 text-gray-400 text-xs">…</span>
                  )}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page === pagination.totalPages}
                  className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:bg-white disabled:opacity-40 transition-colors"
                >
                  <FiChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Diff Drawer */}
      {selectedLog && (
        <DiffDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
