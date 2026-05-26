import { create } from "zustand";
import { invoke, isTauriRuntime } from "@/lib/tauri";
import { McpServer, McpServerFormData } from "@/types";

const BROWSER_FIXTURE_SERVERS: McpServer[] = [
  {
    id: "gitnexus",
    name: "Git Nexus",
    command: "npx",
    args: ["-y", "gitnexus@latest", "mcp"],
    env: null,
    cwd: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

interface McpServerState {
  servers: McpServer[];
  isLoading: boolean;
  error: string | null;
  installedAgentIds: Record<string, string[]>;

  // Actions
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  createServer: (data: McpServerFormData) => Promise<McpServer>;
  updateServer: (id: string, data: McpServerFormData) => Promise<McpServer>;
  deleteServer: (id: string) => Promise<void>;
  installToAgent: (serverId: string, agentId: string) => Promise<void>;
  uninstallFromAgent: (serverId: string, agentId: string) => Promise<void>;
  batchInstallToAgents: (serverId: string, agentIds: string[]) => Promise<void>;
  batchUninstallFromAgents: (serverId: string, agentIds: string[]) => Promise<void>;
  getInstalledAgents: (serverId: string) => Promise<string[]>;
}

export const useMcpServerStore = create<McpServerState>((set, get) => ({
  servers: [],
  isLoading: false,
  error: null,
  installedAgentIds: {},

  initialize: async () => {
    set({ isLoading: true, error: null });
    if (!isTauriRuntime()) {
      set({ servers: BROWSER_FIXTURE_SERVERS, isLoading: false });
      return;
    }
    try {
      const servers = await invoke<McpServer[]>("get_all_mcp_servers");
      set({ servers, isLoading: false });
      // Preload installed agents for each server
      const installedAgentIds: Record<string, string[]> = {};
      for (const server of servers) {
        installedAgentIds[server.id] = await invoke<string[]>("get_agents_for_mcp_server", { serverId: server.id });
      }
      set({ installedAgentIds });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  refresh: async () => {
    await get().initialize();
  },

  createServer: async (data: McpServerFormData) => {
    if (!isTauriRuntime()) {
      const newServer: McpServer = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        command: data.command,
        args: data.args.split(/\s+/).filter(Boolean),
        env: data.env ? JSON.parse(data.env) : null,
        cwd: data.cwd || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set((state) => ({ servers: [...state.servers, newServer] }));
      return newServer;
    }

    const id = Math.random().toString(36).substr(2, 9);
    const server = await invoke<McpServer>("create_mcp_server", {
      id,
      name: data.name,
      command: data.command,
      args: data.args.split(/\s+/).filter(Boolean),
      env: data.env ? JSON.parse(data.env) : null,
      cwd: data.cwd || undefined,
    });
    set((state) => ({ servers: [...state.servers, server] }));
    return server;
  },

  updateServer: async (id: string, data: McpServerFormData) => {
    if (!isTauriRuntime()) {
      const updatedServer: McpServer = {
        id,
        name: data.name,
        command: data.command,
        args: data.args.split(/\s+/).filter(Boolean),
        env: data.env ? JSON.parse(data.env) : null,
        cwd: data.cwd || null,
        created_at: "",
        updated_at: new Date().toISOString(),
      };
      set((state) => ({
        servers: state.servers.map((s) => (s.id === id ? { ...s, ...updatedServer } : s)),
      }));
      return updatedServer;
    }

    const server = await invoke<McpServer>("update_mcp_server", {
      id,
      name: data.name,
      command: data.command,
      args: data.args.split(/\s+/).filter(Boolean),
      env: data.env ? JSON.parse(data.env) : null,
      cwd: data.cwd || undefined,
    });
    set((state) => ({
      servers: state.servers.map((s) => (s.id === id ? server : s)),
    }));
    return server;
  },

  deleteServer: async (id: string) => {
    if (!isTauriRuntime()) {
      set((state) => ({ servers: state.servers.filter((s) => s.id !== id) }));
      return;
    }

    await invoke("delete_mcp_server", { id });
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== id),
      installedAgentIds: Object.fromEntries(
        Object.entries(state.installedAgentIds).filter(([key]) => key !== id)
      ),
    }));
  },

  installToAgent: async (serverId: string, agentId: string) => {
    if (!isTauriRuntime()) {
      set((state) => ({
        installedAgentIds: {
          ...state.installedAgentIds,
          [serverId]: [...(state.installedAgentIds[serverId] || []), agentId],
        },
      }));
      return;
    }

    await invoke("install_mcp_server_to_agent", { serverId, agentId });
    set((state) => ({
      installedAgentIds: {
        ...state.installedAgentIds,
        [serverId]: [...(state.installedAgentIds[serverId] || []), agentId],
      },
    }));
  },

  uninstallFromAgent: async (serverId: string, agentId: string) => {
    if (!isTauriRuntime()) {
      set((state) => ({
        installedAgentIds: {
          ...state.installedAgentIds,
          [serverId]: (state.installedAgentIds[serverId] || []).filter((id) => id !== agentId),
        },
      }));
      return;
    }

    await invoke("uninstall_mcp_server_from_agent", { serverId, agentId });
    set((state) => ({
      installedAgentIds: {
        ...state.installedAgentIds,
        [serverId]: (state.installedAgentIds[serverId] || []).filter((id) => id !== agentId),
      },
    }));
  },

  batchInstallToAgents: async (serverId: string, agentIds: string[]) => {
    if (!isTauriRuntime()) {
      set((state) => ({
        installedAgentIds: {
          ...state.installedAgentIds,
          [serverId]: [...new Set([...(state.installedAgentIds[serverId] || []), ...agentIds])],
        },
      }));
      return;
    }

    await invoke("batch_install_mcp_server_to_agents", { serverId, agentIds });
    set((state) => ({
      installedAgentIds: {
        ...state.installedAgentIds,
        [serverId]: [...new Set([...(state.installedAgentIds[serverId] || []), ...agentIds])],
      },
    }));
  },

  batchUninstallFromAgents: async (serverId: string, agentIds: string[]) => {
    if (!isTauriRuntime()) {
      const agentIdSet = new Set(agentIds);
      set((state) => ({
        installedAgentIds: {
          ...state.installedAgentIds,
          [serverId]: (state.installedAgentIds[serverId] || []).filter((id) => !agentIdSet.has(id)),
        },
      }));
      return;
    }

    await invoke("batch_uninstall_mcp_server_from_agents", { serverId, agentIds });
    const agentIdSet = new Set(agentIds);
    set((state) => ({
      installedAgentIds: {
        ...state.installedAgentIds,
        [serverId]: (state.installedAgentIds[serverId] || []).filter((id) => !agentIdSet.has(id)),
      },
    }));
  },

  getInstalledAgents: async (serverId: string) => {
    if (!isTauriRuntime()) {
      return get().installedAgentIds[serverId] || [];
    }
    const agents = await invoke<string[]>("get_agents_for_mcp_server", { serverId });
    set((state) => ({
      installedAgentIds: { ...state.installedAgentIds, [serverId]: agents },
    }));
    return agents;
  },
}));