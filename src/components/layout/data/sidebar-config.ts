import {
  Blocks,
  Radar,
  Store,
  Layers,
  LayoutGrid,
  Plug,
} from "lucide-react";
import type { ModuleConfig } from "../types";

export const skillsModuleConfig: ModuleConfig = {
  id: "skills",
  name: "Skills Manage",
  icon: LayoutGrid,
  navGroups: [
    {
      items: [
        { title: "sidebar.centralSkills", url: "/central", icon: Blocks },
        { title: "sidebar.discovered", url: "/discover", icon: Radar },
        { title: "marketplace.title", url: "/marketplace", icon: Store },
        { title: "sidebar.collections", url: "/collections", icon: Layers },
      ],
    },
  ],
  getCountByAgent: () => {
    // 在 MainSidebar 中通过 hook 获取，这里不需要实现
    return {};
  },
};

export const mcpModuleConfig: ModuleConfig = {
  id: "mcp",
  name: "MCP Manage",
  icon: Plug,
  navGroups: [
    {
      items: [
        { title: "mcp.sidebar.centralMcps", url: "/mcp/central", icon: Blocks },
        { title: "mcp.sidebar.discovered", url: "/mcp/discover", icon: Radar },
        { title: "mcp.sidebar.marketplace", url: "/mcp/marketplace", icon: Store },
        { title: "mcp.sidebar.collections", url: "/mcp/collections", icon: Layers },
      ],
    },
  ],
  getCountByAgent: () => {
    // 在 MainSidebar 中通过 hook 获取，这里不需要实现
    return {};
  },
};

export const sidebarModules = {
  skills: skillsModuleConfig,
  mcp: mcpModuleConfig,
};