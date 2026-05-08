import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useIssues, issuesStore } from "@/lib/issues-store";
import {
  Issue,
  IssueStatus,
  IssueCategory,
  STATUS_LABEL,
  CATEGORIES,
  SEVERITY_LABEL,
  SEVERITY_COLOR,
} from "@/lib/issues";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  Send,
  Loader2,
  X,
  Lock,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — CivicFix" },
      { name: "description", content: "Manage and respond to all issue reports." },
    ],
  }),
  component: AdminPage,
});

const ADMIN_PASSWORD = "admin123";
const AUTH_KEY = "civicfix:admin:auth";

function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    setIsAuthenticated(stored === "true");
  }, []);

  const login = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}

const AUTHORITY_MAP: Record<string, { email: string; name: string }> = {
  Fire: { email: "fire.department@civicfix.org", name: "Fire Department" },
  Smoke: { email: "environmental@civicfix.org", name: "Environmental Agency" },
  Dumping: { email: "sanitation@civicfix.org", name: "Sanitation Dept" },
  "Air Pollution": { email: "environmental@civicfix.org", name: "Environmental Agency" },
  "Water Pollution": { email: "water.authority@civicfix.org", name: "Water Authority" },
  Trash: { email: "sanitation@civicfix.org", name: "Sanitation Dept" },
  Graffiti: { email: "public.works@civicfix.org", name: "Public Works" },
  Pothole: { email: "transport@civicfix.org", name: "Transportation Dept" },
  Streetlight: { email: "utilities@civicfix.org", name: "Utilities" },
  Sidewalk: { email: "public.works@civicfix.org", name: "Public Works" },
  Tree: { email: "parks@civicfix.org", name: "Parks Department" },
  Signage: { email: "transport@civicfix.org", name: "Transportation Dept" },
  Other: { email: "admin@civicfix.org", name: "CivicFix Admin" },
};

function AdminPage() {
  const { isAuthenticated, login, logout } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const issues = useIssues();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elegant">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold">Admin Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your password to access the admin dashboard
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setLoginError("");
              if (!login(password)) {
                setLoginError("Invalid password. Please try again.");
              }
            }}
            className="mt-6 space-y-4"
          >
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {loginError && <p className="text-sm text-destructive">{loginError}</p>}

            <button
              type="submit"
              className="w-full rounded-full bg-foreground py-3 text-sm font-semibold text-background hover:opacity-90"
            >
              Login
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Contact the administrator if you forgot your password.
          </p>
        </div>
      </div>
    );
  }

  const statusCounts = {
    open: issues.filter((i) => i.status === "open").length,
    acknowledged: issues.filter((i) => i.status === "acknowledged").length,
    in_progress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  };

  async function notifyAuthority(issue: Issue) {
    const authority = AUTHORITY_MAP[issue.category] || AUTHORITY_MAP["Other"];
    setSending(true);
    setSent(false);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "26d70697-529d-4c6e-9167-d3f6ec2c84e3",
          to: "priyanshuhacker075@gmail.com",
          subject: `[CivicFix Admin] ${issue.category} Report - ${issue.id} - Action Required`,
          name: "CivicFix Admin System",
          email: "admin@civicfix.org",
          message: `
REPORT DETAILS:
- ID: ${issue.id}
- Category: ${issue.category}
- Status: ${issue.status}
- Severity: ${issue.severity || "N/A"}
- Location: ${issue.address}
- Reporter: ${issue.reporter}
- Created: ${new Date(issue.createdAt).toLocaleString()}

TITLE: ${issue.title}
DESCRIPTION: ${issue.description}

RELEVANT AUTHORITY NOTIFIED: ${authority.name} (${authority.email})

This is an automated notification from CivicFix Admin Dashboard.
Please take appropriate action on this issue.
          `.trim(),
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSent(true);
        issuesStore.addUpdate(issue.id, `Authority notified: ${authority.name}`, "Admin");
      }
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    setSending(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage issues and notify authorities</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-6">
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> Open
            </div>
            <p className="mt-1 text-2xl font-bold">{statusCounts.open}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" /> Acknowledged
            </div>
            <p className="mt-1 text-2xl font-bold">{statusCounts.acknowledged}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4" /> In Progress
            </div>
            <p className="mt-1 text-2xl font-bold">{statusCounts.in_progress}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" /> Resolved
            </div>
            <p className="mt-1 text-2xl font-bold">{statusCounts.resolved}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-mono">{issue.id}</td>
                    <td className="px-4 py-3 text-sm max-w-[200px] truncate">{issue.title}</td>
                    <td className="px-4 py-3 text-sm">{issue.category}</td>
                    <td className="px-4 py-3">
                      <select
                        value={issue.status}
                        onChange={(e) =>
                          issuesStore.update(issue.id, { status: e.target.value as IssueStatus })
                        }
                        className="rounded border border-input bg-background px-2 py-1 text-xs"
                      >
                        {Object.keys(STATUS_LABEL).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABEL[s as IssueStatus]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {issue.severity && issue.severity !== "none" ? (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                          style={{ background: SEVERITY_COLOR[issue.severity] }}
                        >
                          {SEVERITY_LABEL[issue.severity]}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-[150px] truncate">
                      {issue.address}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedIssue(issue)}
                        className="rounded bg-foreground px-2 py-1 text-xs font-semibold text-background hover:opacity-90"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-mono text-muted-foreground">{selectedIssue.id}</span>
                <h2 className="mt-1 font-display text-xl font-bold">{selectedIssue.title}</h2>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="rounded-full p-2 hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {selectedIssue.category}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${selectedIssue.status === "resolved" ? "bg-success/10 text-success border-success/20" : selectedIssue.status === "in_progress" ? "bg-accent/15 text-accent-foreground border-accent/30" : "bg-destructive/10 text-destructive border-destructive/20"}`}
                >
                  {STATUS_LABEL[selectedIssue.status]}
                </span>
                {selectedIssue.severity && selectedIssue.severity !== "none" && (
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold text-white"
                    style={{ background: SEVERITY_COLOR[selectedIssue.severity] }}
                  >
                    {SEVERITY_LABEL[selectedIssue.severity]}
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="text-muted-foreground">Description</p>
                <p className="mt-1">{selectedIssue.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedIssue.address}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reporter</p>
                  <p className="font-medium">{selectedIssue.reporter}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(selectedIssue.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Upvotes</p>
                  <p className="font-medium">{selectedIssue.upvotes}</p>
                </div>
              </div>

              {selectedIssue.updates.length > 0 && (
                <div className="rounded-xl border border-border p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Activity</p>
                  <div className="mt-2 space-y-2">
                    {selectedIssue.updates.map((u, i) => (
                      <div key={i} className="text-xs">
                        <span className="font-medium">{u.by}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          - {new Date(u.at).toLocaleString()}
                        </span>
                        <p>{u.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-4">
              <button
                onClick={() => notifyAuthority(selectedIssue)}
                disabled={sending}
                className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Notify {AUTHORITY_MAP[selectedIssue.category]?.name || "Authority"}
              </button>
              {sent && (
                <span className="flex items-center gap-1 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" /> Notification sent!
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
