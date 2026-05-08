import { useEffect, useSyncExternalStore } from "react";
import { Issue, SEED_ISSUES } from "./issues";

const KEY = "civicfix:issues:v1";
const VOTES_KEY = "civicfix:votes:v1";

function load(): Issue[] {
  if (typeof window === "undefined") return SEED_ISSUES;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SEED_ISSUES;
    return JSON.parse(raw);
  } catch {
    return SEED_ISSUES;
  }
}

function loadVotes(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveVotes(votes: Set<string>) {
  if (typeof window !== "undefined") {
    localStorage.setItem(VOTES_KEY, JSON.stringify([...votes]));
  }
}

let state: Issue[] = SEED_ISSUES;
let userVotes = new Set<string>();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

export const issuesStore = {
  get: () => state,
  hydrate: () => {
    state = load();
    userVotes = loadVotes();
    listeners.forEach((l) => l());
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  add: (issue: Issue) => {
    state = [issue, ...state];
    persist();
  },
  toggleUpvote: (id: string) => {
    const hasVoted = userVotes.has(id);
    if (hasVoted) {
      userVotes.delete(id);
      state = state.map((i) => (i.id === id ? { ...i, upvotes: i.upvotes - 1 } : i));
    } else {
      userVotes.add(id);
      state = state.map((i) => (i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i));
    }
    saveVotes(userVotes);
    persist();
  },
  hasVoted: (id: string) => userVotes.has(id),
  update: (id: string, updates: Partial<Issue>) => {
    state = state.map((i) => (i.id === id ? { ...i, ...updates } : i));
    persist();
  },
  addUpdate: (id: string, note: string, by: string) => {
    state = state.map((i) => {
      if (i.id === id) {
        return { ...i, updates: [...i.updates, { at: new Date().toISOString(), note, by }] };
      }
      return i;
    });
    persist();
  },
};

export function useIssues(): Issue[] {
  const data = useSyncExternalStore(
    issuesStore.subscribe,
    () => issuesStore.get(),
    () => SEED_ISSUES,
  );
  useEffect(() => {
    issuesStore.hydrate();
  }, []);
  return data;
}
