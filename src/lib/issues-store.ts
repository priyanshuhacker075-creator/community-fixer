import { useEffect, useSyncExternalStore } from "react";
import { Issue, IssueCategory, IssueStatus, PollutionSeverity, AiVerification, RewardStatus } from "./issues";
import { supabase } from "@/integrations/supabase/client";

const VOTER_KEY = "civicfix:voter_id:v1";

export function getVoterId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(VOTER_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() ?? `v_${Math.random().toString(36).slice(2)}_${Date.now()}`);
    localStorage.setItem(VOTER_KEY, id);
  }
  return id;
}

let state: Issue[] = [];
let myVotes = new Set<string>();
let hydrated = false;
let realtimeBound = false;
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

type DbIssue = {
  id: string; title: string; description: string; category: string; status: string;
  address: string; lat: number; lng: number; reporter: string; image: string | null;
  severity: string | null; ai_reasoning: string | null; ai_verification: any;
  upvote_count: number; created_at: string;
  reporter_email?: string | null;
  points_awarded?: number | null;
  reward_status?: string | null;
  reward_sent_at?: string | null;
  reward_note?: string | null;
  voter_id?: string | null;
};
type DbUpdate = { id: string; issue_id: string; note: string; by_name: string; created_at: string };

function rowToIssue(r: DbIssue, updates: DbUpdate[] = []): Issue {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category as IssueCategory,
    status: r.status as IssueStatus,
    address: r.address,
    lat: Number(r.lat), lng: Number(r.lng),
    createdAt: r.created_at,
    upvotes: r.upvote_count ?? 0,
    reporter: r.reporter,
    reporterEmail: r.reporter_email ?? undefined,
    image: r.image ?? undefined,
    severity: (r.severity ?? undefined) as PollutionSeverity | undefined,
    aiReasoning: r.ai_reasoning ?? undefined,
    aiVerification: (r.ai_verification ?? undefined) as AiVerification | undefined,
    pointsAwarded: r.points_awarded ?? 0,
    rewardStatus: (r.reward_status ?? "unclaimed") as RewardStatus,
    rewardSentAt: r.reward_sent_at ?? undefined,
    rewardNote: r.reward_note ?? undefined,
    updates: updates
      .filter((u) => u.issue_id === r.id)
      .map((u) => ({ at: u.created_at, note: u.note, by: u.by_name })),
  };
}

async function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const voter = getVoterId();
  const [{ data: issues }, { data: updates }, { data: votes }] = await Promise.all([
    supabase.from("issues").select("*").order("created_at", { ascending: false }),
    supabase.from("issue_updates").select("*").order("created_at", { ascending: true }),
    supabase.from("upvotes").select("issue_id").eq("voter_id", voter),
  ]);
  const updateRows = (updates ?? []) as DbUpdate[];
  state = ((issues ?? []) as DbIssue[]).map((r) => rowToIssue(r, updateRows));
  myVotes = new Set((votes ?? []).map((v: any) => v.issue_id));
  emit();
  bindRealtime();
}

function bindRealtime() {
  if (realtimeBound) return;
  realtimeBound = true;
  const voter = getVoterId();
  supabase
    .channel("civicfix-public")
    .on("postgres_changes", { event: "*", schema: "public", table: "issues" }, (payload) => {
      if (payload.eventType === "INSERT") {
        const issue = rowToIssue(payload.new as DbIssue, []);
        if (!state.find((i) => i.id === issue.id)) state = [issue, ...state];
        else state = state.map((i) => (i.id === issue.id ? { ...issue, updates: i.updates } : i));
      } else if (payload.eventType === "UPDATE") {
        const r = payload.new as DbIssue;
        state = state.map((i) => (i.id === r.id ? { ...rowToIssue(r), updates: i.updates } : i));
      } else if (payload.eventType === "DELETE") {
        const r = payload.old as DbIssue;
        state = state.filter((i) => i.id !== r.id);
      }
      emit();
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "upvotes" }, (payload) => {
      const row: any = payload.new ?? payload.old;
      if (row?.voter_id === voter) {
        if (payload.eventType === "INSERT") myVotes.add(row.issue_id);
        else if (payload.eventType === "DELETE") myVotes.delete(row.issue_id);
      }
      emit();
    })
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "issue_updates" }, (payload) => {
      const u = payload.new as DbUpdate;
      state = state.map((i) =>
        i.id === u.issue_id
          ? { ...i, updates: [...i.updates, { at: u.created_at, note: u.note, by: u.by_name }] }
          : i,
      );
      emit();
    })
    .subscribe();
}

export const issuesStore = {
  get: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },
  hydrate,

  add: async (issue: Issue) => {
    const voter = getVoterId();
    // Optimistic local insert
    state = [{ ...issue, upvotes: 1 }, ...state.filter((i) => i.id !== issue.id)];
    myVotes.add(issue.id);
    emit();

    const { error } = await supabase.from("issues").insert({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      status: issue.status,
      address: issue.address,
      lat: issue.lat,
      lng: issue.lng,
      reporter: issue.reporter,
      voter_id: voter,
      image: issue.image ?? null,
      severity: issue.severity ?? null,
      ai_reasoning: issue.aiReasoning ?? null,
      ai_verification: issue.aiVerification ?? null,
      reporter_email: issue.reporterEmail ?? null,
      points_awarded: issue.pointsAwarded ?? 0,
      reward_status: issue.rewardStatus ?? "unclaimed",
    } as any);
    if (error) { console.error("[issues.insert]", error); return; }
    await supabase.from("upvotes").insert({ issue_id: issue.id, voter_id: voter });
  },

  markRewardSent: async (id: string, note: string) => {
    const sentAt = new Date().toISOString();
    state = state.map((i) =>
      i.id === id ? { ...i, rewardStatus: "sent", rewardSentAt: sentAt, rewardNote: note } : i,
    );
    emit();
    await supabase
      .from("issues")
      .update({ reward_status: "sent", reward_sent_at: sentAt, reward_note: note } as any)
      .eq("id", id);
  },

  toggleUpvote: async (id: string) => {
    const voter = getVoterId();
    const has = myVotes.has(id);
    // Optimistic
    if (has) {
      myVotes.delete(id);
      state = state.map((i) => (i.id === id ? { ...i, upvotes: Math.max(0, i.upvotes - 1) } : i));
    } else {
      myVotes.add(id);
      state = state.map((i) => (i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i));
    }
    emit();
    if (has) await supabase.from("upvotes").delete().eq("issue_id", id).eq("voter_id", voter);
    else await supabase.from("upvotes").insert({ issue_id: id, voter_id: voter });
  },

  hasVoted: (id: string) => myVotes.has(id),

  update: async (id: string, updates: Partial<Issue>) => {
    state = state.map((i) => (i.id === id ? { ...i, ...updates } : i));
    emit();
    const dbPatch: any = {};
    if (updates.status) dbPatch.status = updates.status;
    if (updates.title) dbPatch.title = updates.title;
    if (updates.description) dbPatch.description = updates.description;
    if (updates.category) dbPatch.category = updates.category;
    if (updates.severity) dbPatch.severity = updates.severity;
    if (Object.keys(dbPatch).length) await supabase.from("issues").update(dbPatch).eq("id", id);
  },

  addUpdate: async (id: string, note: string, by: string) => {
    state = state.map((i) =>
      i.id === id ? { ...i, updates: [...i.updates, { at: new Date().toISOString(), note, by }] } : i,
    );
    emit();
    await supabase.from("issue_updates").insert({ issue_id: id, note, by_name: by });
  },

  remove: async (id: string) => {
    state = state.filter((i) => i.id !== id);
    emit();
    await supabase.from("issues").delete().eq("id", id);
  },
};

export function useIssues(): Issue[] {
  const data = useSyncExternalStore(issuesStore.subscribe, () => state, () => state);
  useEffect(() => { issuesStore.hydrate(); }, []);
  return data;
}
