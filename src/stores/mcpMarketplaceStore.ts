import { create } from "zustand";
import {
  CURATED_MCP_SERVERS,
  MCP_MARKETPLACE_SOURCES,
  type McpMarketplaceServer,
  type McpMarketplaceSource,
  type McpServerTag,
  searchMcpServers,
} from "@/data/mcpSources";

// ─── Types ────────────────────────────────────────────────────────────────────

interface McpMarketplaceState {
  // Data
  servers: McpMarketplaceServer[];
  sources: McpMarketplaceSource[];
  selectedSource: string;
  selectedTags: McpServerTag[];
  searchQuery: string;

  // UI State
  isLoading: boolean;
  error: string | null;
  viewMode: "grid" | "list";

  // Computed
  filteredServers: McpMarketplaceServer[];
  availableTags: McpServerTag[];

  // Actions
  initialize: () => void;
  refresh: () => void;
  setSelectedSource: (source: string) => void;
  toggleTag: (tag: McpServerTag) => void;
  clearTags: () => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: "grid" | "list") => void;
  clearError: () => void;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function filterServers(
  servers: McpMarketplaceServer[],
  source: string,
  tags: McpServerTag[],
  query: string
): McpMarketplaceServer[] {
  let result = [...servers];

  // Filter by source
  if (source !== "all") {
    result = result.filter((s) => s.source === source);
  }

  // Filter by tags
  if (tags.length > 0) {
    result = result.filter((s) => tags.some((t) => s.tags.includes(t)));
  }

  // Filter by search query
  if (query.trim()) {
    result = searchMcpServers(result, query);
  }

  // Sort by popularity (descending)
  result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  return result;
}

function getAvailableTags(servers: McpMarketplaceServer[]): McpServerTag[] {
  const tags = new Set<McpServerTag>();
  servers.forEach((s) => s.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMcpMarketplaceStore = create<McpMarketplaceState>((set, get) => ({
  // Initial state
  servers: CURATED_MCP_SERVERS,
  sources: [
    { name: "All Sources", slug: "all" },
    ...MCP_MARKETPLACE_SOURCES,
    { name: "Curated", slug: "curated" },
  ],
  selectedSource: "all",
  selectedTags: [],
  searchQuery: "",
  isLoading: false,
  error: null,
  viewMode: "grid",

  // Computed
  get filteredServers() {
    const { servers, selectedSource, selectedTags, searchQuery } = get();
    return filterServers(servers, selectedSource, selectedTags, searchQuery);
  },

  get availableTags() {
    const { servers } = get();
    return getAvailableTags(servers);
  },

  // Actions
  initialize: () => {
    set({ isLoading: true, error: null });
    try {
      // For now, use curated servers
      // TODO: Fetch from official registry API
      set({
        servers: CURATED_MCP_SERVERS,
        isLoading: false,
      });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  refresh: () => {
    get().initialize();
  },

  setSelectedSource: (source: string) => {
    set({ selectedSource: source });
  },

  toggleTag: (tag: McpServerTag) => {
    set((state) => {
      const newTags = state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag];
      return { selectedTags: newTags };
    });
  },

  clearTags: () => {
    set({ selectedTags: [] });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setViewMode: (mode: "grid" | "list") => {
    set({ viewMode: mode });
  },

  clearError: () => {
    set({ error: null });
  },
}));
