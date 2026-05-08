export type IssueStatus = "open" | "acknowledged" | "in_progress" | "resolved";
export type IssueCategory =
  | "Pothole"
  | "Streetlight"
  | "Graffiti"
  | "Trash"
  | "Sidewalk"
  | "Tree"
  | "Signage"
  | "Fire"
  | "Smoke"
  | "Dumping"
  | "Air Pollution"
  | "Water Pollution"
  | "Other";

export type PollutionSeverity = "none" | "low" | "medium" | "high" | "critical";

export type Issue = {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  address: string;
  lat: number;
  lng: number;
  createdAt: string;
  upvotes: number;
  reporter: string;
  image?: string;
  severity?: PollutionSeverity;
  aiReasoning?: string;
  updates: { at: string; note: string; by: string }[];
};

export const SEVERITY_LABEL: Record<PollutionSeverity, string> = {
  none: "None", low: "Low", medium: "Medium", high: "High", critical: "Critical",
};

export const SEVERITY_COLOR: Record<PollutionSeverity, string> = {
  none: "#94a3b8",
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

export const STATUS_LABEL: Record<IssueStatus, string> = {
  open: "Open",
  acknowledged: "Acknowledged",
  in_progress: "In progress",
  resolved: "Resolved",
};

export const STATUS_TONE: Record<IssueStatus, string> = {
  open: "bg-destructive/10 text-destructive border-destructive/20",
  acknowledged: "bg-info/10 text-info border-info/20",
  in_progress: "bg-accent/15 text-accent-foreground border-accent/30",
  resolved: "bg-success/10 text-success border-success/20",
};

export const CATEGORIES: IssueCategory[] = [
  "Pothole", "Streetlight", "Graffiti", "Trash", "Sidewalk", "Tree", "Signage", "Other",
];

export const SEED_ISSUES: Issue[] = [
  {
    id: "FIX-1042",
    title: "Massive pothole on Elm & 4th",
    description: "Bus-stop side, deep enough to bend a rim. Three cars hit it this morning.",
    category: "Pothole",
    status: "in_progress",
    address: "Elm St & 4th Ave",
    lat: 40.7128, lng: -74.006,
    createdAt: "2026-05-04T09:12:00Z",
    upvotes: 47,
    reporter: "Marisol R.",
    updates: [
      { at: "2026-05-05T14:00:00Z", note: "Crew dispatched, scheduled patch on Friday.", by: "Public Works" },
      { at: "2026-05-04T11:00:00Z", note: "Reviewed and acknowledged.", by: "311 Triage" },
    ],
  },
  {
    id: "FIX-1039",
    title: "Streetlight out by Riverside Park",
    description: "Two lamp posts dark for 5 nights. Joggers can't see the path.",
    category: "Streetlight",
    status: "acknowledged",
    address: "Riverside Park, gate 3",
    lat: 40.801, lng: -73.972,
    createdAt: "2026-05-02T19:42:00Z",
    upvotes: 22,
    reporter: "Devon K.",
    updates: [{ at: "2026-05-03T08:00:00Z", note: "Ticket forwarded to utility partner.", by: "311 Triage" }],
  },
  {
    id: "FIX-1031",
    title: "Tagging on heritage mural",
    description: "Fresh spray-paint covering the lower-right of the community mural on Bryant.",
    category: "Graffiti",
    status: "resolved",
    address: "Bryant Lane",
    lat: 40.741, lng: -74.001,
    createdAt: "2026-04-28T07:20:00Z",
    upvotes: 14,
    reporter: "Anya P.",
    updates: [{ at: "2026-04-30T16:00:00Z", note: "Restored by mural artist + city crew.", by: "Parks Dept." }],
  },
  {
    id: "FIX-1028",
    title: "Overflowing trash, attracting rats",
    description: "Bin behind the bakery overflowing for a week. Bags stacked on sidewalk.",
    category: "Trash",
    status: "open",
    address: "215 Hawthorne",
    lat: 40.718, lng: -73.99,
    createdAt: "2026-05-06T18:05:00Z",
    upvotes: 9,
    reporter: "Kenji M.",
    updates: [],
  },
  {
    id: "FIX-1024",
    title: "Cracked sidewalk — wheelchair impassable",
    description: "Heaved concrete near the senior center makes the curb cut unusable.",
    category: "Sidewalk",
    status: "open",
    address: "Maple Ct & Vine",
    lat: 40.733, lng: -73.998,
    createdAt: "2026-05-06T08:30:00Z",
    upvotes: 31,
    reporter: "Priya S.",
    updates: [],
  },
  {
    id: "FIX-1020",
    title: "Fallen branch blocking bike lane",
    description: "After last night's storm, large limb across the protected bike lane.",
    category: "Tree",
    status: "in_progress",
    address: "Greenway, mile 2.4",
    lat: 40.755, lng: -73.985,
    createdAt: "2026-05-07T06:15:00Z",
    upvotes: 18,
    reporter: "Jordan L.",
    updates: [{ at: "2026-05-07T10:00:00Z", note: "Arborist en route.", by: "Parks Dept." }],
  },
];
