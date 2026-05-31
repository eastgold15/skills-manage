// ─── MCP Server Marketplace Sources ─────────────────────────────────────────────
// This file defines MCP server sources from various marketplaces.
// Each entry contains installation configs for different AI clients.

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * Installation method for MCP server
 */
export type McpInstallMethod = "npx" | "npm" | "uvx" | "pip" | "cargo" | "binary" | "docker" | "remote";

/**
 * Supported AI client platforms
 */
export type McpClientPlatform = 
  | "claude-desktop" 
  | "vscode" 
  | "cursor" 
  | "windsurf"
  | "zed"
  | "claude-code";

/**
 * Transport type for MCP server
 */
export type McpTransportType = "stdio" | "sse" | "streamable-http";

/**
 * Configuration template for a specific client
 */
export interface McpClientConfig {
  /** The client platform this config is for */
  platform: McpClientPlatform;
  /** Command to run the MCP server (required for stdio transport) */
  command?: string;
  /** Arguments to pass to the command (required for stdio transport) */
  args?: string[];
  /** Environment variables (optional) */
  env?: Record<string, string>;
  /** Working directory (optional) */
  cwd?: string;
  /** Transport type (stdio for local, sse/streamable-http for remote) */
  transport?: McpTransportType;
  /** URL for remote servers (required for sse/streamable-http transport) */
  url?: string;
  /** Required headers for remote servers */
  headers?: Record<string, string>;
}

/**
 * Marketplace source for an MCP server
 */
export interface McpMarketplaceServer {
  /** Unique identifier (e.g., npm package name or registry ID) */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Long description (optional) */
  longDescription?: string;
  /** Publisher/author */
  publisher: string;
  /** GitHub repository (optional) */
  repository?: {
    url: string;
    source: "github" | "gitlab" | "other";
  };
  /** Website URL (optional) */
  websiteUrl?: string;
  /** Icon URL (optional) */
  iconUrl?: string;
  /** Category tags */
  tags: McpServerTag[];
  /** Primary installation method */
  installMethod: McpInstallMethod;
  /** Package identifier (npm package, pip package, etc.) */
  packageIdentifier: string;
  /** Package version (optional, defaults to "latest") */
  packageVersion?: string;
  /** Client-specific configuration templates */
  clientConfigs: McpClientConfig[];
  /** Prerequisites/requirements (optional) */
  prerequisites?: string[];
  /** Whether this server requires authentication */
  requiresAuth?: boolean;
  /** Auth setup instructions (optional) */
  authInstructions?: string;
  /** Source marketplace */
  source: "official-registry" | "smithery" | "npm" | "pypi" | "curated";
  /** Usage count/popularity metric */
  popularity?: number;
  /** Whether the server is deprecated */
  isDeprecated?: boolean;
}

/**
 * Category tags for MCP servers
 */
export type McpServerTag = 
  | "search"
  | "database"
  | "file-system"
  | "web"
  | "ai-ml"
  | "devops"
  | "communication"
  | "productivity"
  | "security"
  | "monitoring"
  | "cloud"
  | "git"
  | "testing"
  | "docs"
  | "media"
  | "finance"
  | "other";

/**
 * MCP marketplace source provider
 */
export interface McpMarketplaceSource {
  /** Source name */
  name: string;
  /** Source identifier */
  slug: string;
  /** API endpoint (if available) */
  apiEndpoint?: string;
  /** Whether this source requires API key */
  requiresApiKey?: boolean;
  /** Total servers count (cached) */
  totalServers?: number;
}

// ─── Marketplace Sources ───────────────────────────────────────────────────────

export const MCP_MARKETPLACE_SOURCES: McpMarketplaceSource[] = [
  {
    name: "Official MCP Registry",
    slug: "official-registry",
    apiEndpoint: "https://registry.modelcontextprotocol.io/v0/servers",
    requiresApiKey: false,
    totalServers: 100,
  },
  {
    name: "Smithery",
    slug: "smithery",
    apiEndpoint: "https://api.smithery.ai/v1/servers",
    requiresApiKey: true,
    totalServers: 3000,
  },
  {
    name: "npm (MCP packages)",
    slug: "npm",
    apiEndpoint: "https://registry.npmjs.org/-/v1/search?text=mcp%20server",
    requiresApiKey: false,
    totalServers: 500,
  },
];

// ─── Curated MCP Servers ───────────────────────────────────────────────────────

/**
 * Curated list of popular MCP servers with pre-configured installation templates.
 * These servers are manually selected and configured for easy one-click installation.
 */
export const CURATED_MCP_SERVERS: McpMarketplaceServer[] = [
  // ─── File System & Search ────────────────────────────────────────────────────
  {
    id: "@danielsimonjr/everything-mcp",
    name: "Everything MCP",
    description: "Windows file search using Everything engine - instant file and folder searching",
    longDescription: "Model Context Protocol (MCP) server for Everything, the blazing-fast file search engine for Windows. Enables instant file and folder searching through MCP.",
    publisher: "danielsimonjr",
    repository: {
      url: "https://github.com/danielsimonjr/everything-mcp",
      source: "github",
    },
    tags: ["file-system", "search"],
    installMethod: "npx",
    packageIdentifier: "@danielsimonjr/everything-mcp",
    clientConfigs: [
      {
        platform: "claude-desktop",
        command: "npx",
        args: ["-y", "@danielsimonjr/everything-mcp"],
      },
      {
        platform: "vscode",
        command: "npx",
        args: ["-y", "@danielsimonjr/everything-mcp"],
      },
      {
        platform: "cursor",
        command: "npx",
        args: ["-y", "@danielsimonjr/everything-mcp"],
      },
      {
        platform: "claude-code",
        command: "npx",
        args: ["-y", "@danielsimonjr/everything-mcp"],
      },
    ],
    prerequisites: [
      "Windows Only",
      "Everything search engine must be installed: https://www.voidtools.com/downloads/",
      "es.exe must be available at C:\\Program Files\\Everything\\es.exe",
    ],
    source: "curated",
    popularity: 1000,
  },
  {
    id: "@anthropic/mcp-server-filesystem",
    name: "Filesystem MCP",
    description: "Secure file system operations with configurable allowed directories",
    publisher: "Anthropic",
    repository: {
      url: "https://github.com/modelcontextprotocol/servers",
      source: "github",
    },
    tags: ["file-system"],
    installMethod: "npx",
    packageIdentifier: "@anthropic/mcp-server-filesystem",
    clientConfigs: [
      {
        platform: "claude-desktop",
        command: "npx",
        args: ["-y", "@anthropic/mcp-server-filesystem", "/path/to/allowed/dir"],
      },
      {
        platform: "vscode",
        command: "npx",
        args: ["-y", "@anthropic/mcp-server-filesystem", "${workspaceFolder}"],
      },
    ],
    source: "curated",
    popularity: 5000,
  },

  // ─── Search & Web ────────────────────────────────────────────────────────────
  {
    id: "@anthropic/mcp-server-brave-search",
    name: "Brave Search MCP",
    description: "Web search using Brave Search API",
    publisher: "Anthropic",
    repository: {
      url: "https://github.com/modelcontextprotocol/servers",
      source: "github",
    },
    tags: ["search", "web"],
    installMethod: "npx",
    packageIdentifier: "@anthropic/mcp-server-brave-search",
    clientConfigs: [
      {
        platform: "claude-desktop",
        command: "npx",
        args: ["-y", "@anthropic/mcp-server-brave-search"],
        env: {
          BRAVE_API_KEY: "YOUR_API_KEY",
        },
      },
      {
        platform: "vscode",
        command: "npx",
        args: ["-y", "@anthropic/mcp-server-brave-search"],
        env: {
          BRAVE_API_KEY: "YOUR_API_KEY",
        },
      },
    ],
    requiresAuth: true,
    authInstructions: "Get your Brave Search API key from https://brave.com/search/api/",
    source: "curated",
    popularity: 3000,
  },
  {
    id: "exa-mcp",
    name: "Exa Search",
    description: "AI-powered web search and crawling with fresh results",
    publisher: "Exa",
    repository: {
      url: "https://github.com/exa-labs/exa-mcp-server",
      source: "github",
    },
    websiteUrl: "https://smithery.ai/servers/exa",
    tags: ["search", "web", "ai-ml"],
    installMethod: "remote",
    packageIdentifier: "exa",
    clientConfigs: [
      {
        platform: "claude-desktop",
        transport: "streamable-http",
        url: "https://api.exa.ai/mcp",
        headers: {
          Authorization: "Bearer YOUR_API_KEY",
        },
      },
      {
        platform: "vscode",
        transport: "streamable-http",
        url: "https://api.exa.ai/mcp",
        headers: {
          Authorization: "Bearer YOUR_API_KEY",
        },
      },
    ],
    requiresAuth: true,
    authInstructions: "Get your Exa API key from https://exa.ai",
    source: "smithery",
    popularity: 24000,
  },

  // ─── Database ────────────────────────────────────────────────────────────────
  {
    id: "@anthropic/mcp-server-postgres",
    name: "PostgreSQL MCP",
    description: "PostgreSQL database operations with query execution",
    publisher: "Anthropic",
    repository: {
      url: "https://github.com/modelcontextprotocol/servers",
      source: "github",
    },
    tags: ["database"],
    installMethod: "npx",
    packageIdentifier: "@anthropic/mcp-server-postgres",
    clientConfigs: [
      {
        platform: "claude-desktop",
        command: "npx",
        args: ["-y", "@anthropic/mcp-server-postgres", "postgresql://user:pass@host:port/db"],
      },
    ],
    prerequisites: ["PostgreSQL connection string required"],
    source: "curated",
    popularity: 2000,
  },
  {
    id: "@anthropic/mcp-server-sqlite",
    name: "SQLite MCP",
    description: "SQLite database operations with query execution",
    publisher: "Anthropic",
    repository: {
      url: "https://github.com/modelcontextprotocol/servers",
      source: "github",
    },
    tags: ["database"],
    installMethod: "npx",
    packageIdentifier: "@anthropic/mcp-server-sqlite",
    clientConfigs: [
      {
        platform: "claude-desktop",
        command: "npx",
        args: ["-y", "@anthropic/mcp-server-sqlite", "--db-path", "/path/to/database.db"],
      },
    ],
    source: "curated",
    popularity: 1500,
  },

  // ─── Git & Version Control ───────────────────────────────────────────────────
  {
    id: "@anthropic/mcp-server-git",
    name: "Git MCP",
    description: "Git operations including status, diff, commit, and history",
    publisher: "Anthropic",
    repository: {
      url: "https://github.com/modelcontextprotocol/servers",
      source: "github",
    },
    tags: ["git", "devops"],
    installMethod: "npx",
    packageIdentifier: "@anthropic/mcp-server-git",
    clientConfigs: [
      {
        platform: "claude-desktop",
        command: "npx",
        args: ["-y", "@anthropic/mcp-server-git", "--repository", "/path/to/repo"],
      },
      {
        platform: "vscode",
        command: "npx",
        args: ["-y", "@anthropic/mcp-server-git", "--repository", "${workspaceFolder}"],
      },
    ],
    source: "curated",
    popularity: 4000,
  },

  // ─── Memory & Context ────────────────────────────────────────────────────────
  {
    id: "@anthropic/mcp-server-memory",
    name: "Memory MCP",
    description: "Persistent memory storage using knowledge graphs",
    publisher: "Anthropic",
    repository: {
      url: "https://github.com/modelcontextprotocol/servers",
      source: "github",
    },
    tags: ["ai-ml", "productivity"],
    installMethod: "npx",
    packageIdentifier: "@anthropic/mcp-server-memory",
    clientConfigs: [
      {
        platform: "claude-desktop",
        command: "npx",
        args: ["-y", "@anthropic/mcp-server-memory"],
      },
      {
        platform: "vscode",
        command: "npx",
        args: ["-y", "@anthropic/mcp-server-memory"],
      },
    ],
    source: "curated",
    popularity: 3500,
  },

  // ─── Cloud & DevOps ──────────────────────────────────────────────────────────
  {
    id: "@anthropic/mcp-server-github",
    name: "GitHub MCP",
    description: "GitHub API operations - repos, issues, PRs, search",
    publisher: "Anthropic",
    repository: {
      url: "https://github.com/modelcontextprotocol/servers",
      source: "github",
    },
    tags: ["git", "cloud", "devops"],
    installMethod: "npx",
    packageIdentifier: "@anthropic/mcp-server-github",
    clientConfigs: [
      {
        platform: "claude-desktop",
        command: "npx",
        args: ["-y", "@anthropic/mcp-server-github"],
        env: {
          GITHUB_TOKEN: "YOUR_GITHUB_TOKEN",
        },
      },
      {
        platform: "vscode",
        command: "npx",
        args: ["-y", "@anthropic/mcp-server-github"],
        env: {
          GITHUB_TOKEN: "YOUR_GITHUB_TOKEN",
        },
      },
    ],
    requiresAuth: true,
    authInstructions: "Create a GitHub Personal Access Token at https://github.com/settings/tokens",
    source: "curated",
    popularity: 6000,
  },

  // ─── Documentation ───────────────────────────────────────────────────────────
  {
    id: "context7-mcp",
    name: "Context7",
    description: "Fetch up-to-date, version-specific documentation and code examples",
    publisher: "Upstash",
    repository: {
      url: "https://github.com/upstash/context7",
      source: "github",
    },
    websiteUrl: "https://smithery.ai/servers/upstash/context7-mcp",
    tags: ["docs", "ai-ml"],
    installMethod: "npx",
    packageIdentifier: "@upstash/context7-mcp",
    clientConfigs: [
      {
        platform: "claude-desktop",
        command: "npx",
        args: ["-y", "@upstash/context7-mcp"],
      },
      {
        platform: "vscode",
        command: "npx",
        args: ["-y", "@upstash/context7-mcp"],
      },
      {
        platform: "claude-code",
        command: "npx",
        args: ["-y", "@upstash/context7-mcp"],
      },
    ],
    source: "smithery",
    popularity: 9500,
  },

  // ─── Communication ───────────────────────────────────────────────────────────
  {
    id: "@anthropic/mcp-server-slack",
    name: "Slack MCP",
    description: "Slack API operations - channels, messages, users",
    publisher: "Anthropic",
    repository: {
      url: "https://github.com/modelcontextprotocol/servers",
      source: "github",
    },
    tags: ["communication", "productivity"],
    installMethod: "npx",
    packageIdentifier: "@anthropic/mcp-server-slack",
    clientConfigs: [
      {
        platform: "claude-desktop",
        command: "npx",
        args: ["-y", "@anthropic/mcp-server-slack"],
        env: {
          SLACK_BOT_TOKEN: "xoxb-your-token",
        },
      },
    ],
    requiresAuth: true,
    authInstructions: "Create a Slack Bot and get the Bot User OAuth Token",
    source: "curated",
    popularity: 2500,
  },

  // ─── Browser Automation ──────────────────────────────────────────────────────
  {
    id: "browserbase-mcp",
    name: "Browserbase",
    description: "Cloud browser automation with Stagehand for web interactions",
    publisher: "Browserbase",
    repository: {
      url: "https://github.com/browserbase/mcp-server-browserbase",
      source: "github",
    },
    websiteUrl: "https://browserbase.com",
    tags: ["web", "testing"],
    installMethod: "npx",
    packageIdentifier: "@browserbase/mcp-server-browserbase",
    clientConfigs: [
      {
        platform: "claude-desktop",
        command: "npx",
        args: ["-y", "@browserbase/mcp-server-browserbase"],
        env: {
          BROWSERBASE_API_KEY: "YOUR_API_KEY",
        },
      },
    ],
    requiresAuth: true,
    authInstructions: "Get your Browserbase API key from https://browserbase.com",
    source: "smithery",
    popularity: 1000,
  },

  // ─── AI & LLM ────────────────────────────────────────────────────────────────
  {
    id: "@anthropic/mcp-server-puppeteer",
    name: "Puppeteer MCP",
    description: "Browser automation with Puppeteer - navigation, screenshots, scraping",
    publisher: "Anthropic",
    repository: {
      url: "https://github.com/modelcontextprotocol/servers",
      source: "github",
    },
    tags: ["web", "testing"],
    installMethod: "npx",
    packageIdentifier: "@anthropic/mcp-server-puppeteer",
    clientConfigs: [
      {
        platform: "claude-desktop",
        command: "npx",
        args: ["-y", "@anthropic/mcp-server-puppeteer"],
      },
    ],
    source: "curated",
    popularity: 3000,
  },
];

// ─── All Tags ──────────────────────────────────────────────────────────────────

export const MCP_SERVER_TAGS: McpServerTag[] = [
  "search",
  "database",
  "file-system",
  "web",
  "ai-ml",
  "devops",
  "communication",
  "productivity",
  "security",
  "monitoring",
  "cloud",
  "git",
  "testing",
  "docs",
  "media",
  "finance",
  "other",
];

// ─── Client Platform Display Names ─────────────────────────────────────────────

export const MCP_CLIENT_PLATFORM_NAMES: Record<McpClientPlatform, string> = {
  "claude-desktop": "Claude Desktop",
  "vscode": "VS Code",
  "cursor": "Cursor",
  "windsurf": "Windsurf",
  "zed": "Zed",
  "claude-code": "Claude Code",
};

// ─── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Get the config file path for a specific client platform
 */
export function getMcpConfigPath(platform: McpClientPlatform): string {
  switch (platform) {
    case "claude-desktop":
      return "~/.claude/claude_desktop_config.json";
    case "vscode":
      return ".vscode/mcp.json";
    case "cursor":
      return "~/.cursor/mcp.json";
    case "windsurf":
      return "~/.windsurf/mcp.json";
    case "zed":
      return "~/.zed/mcp.json";
    case "claude-code":
      return "~/.claude/settings.json";
    default:
      return "";
  }
}

/**
 * Get the config key name for a specific client platform
 */
export function getMcpConfigKey(platform: McpClientPlatform): string {
  switch (platform) {
    case "claude-desktop":
      return "mcpServers";
    case "vscode":
    case "cursor":
    case "windsurf":
      return "servers";
    case "zed":
      return "mcp_servers";
    case "claude-code":
      return "mcpServers";
    default:
      return "mcpServers";
  }
}

/**
 * Generate the JSON config snippet for a MCP server on a specific platform
 */
export function generateMcpConfigSnippet(
  server: McpMarketplaceServer,
  platform: McpClientPlatform
): Record<string, unknown> | null {
  const config = server.clientConfigs.find((c) => c.platform === platform);
  if (!config) return null;

  if (config.transport && config.url) {
    // Remote server config
    return {
      type: config.transport,
      url: config.url,
      headers: config.headers || {},
    };
  }

  // Local server config (stdio)
  const result: Record<string, unknown> = {};

  if (config.command) {
    result.command = config.command;
  }

  if (config.args && config.args.length > 0) {
    result.args = config.args;
  }

  if (config.env) {
    result.env = config.env;
  }

  if (config.cwd) {
    result.cwd = config.cwd;
  }

  return result;
}

/**
 * Filter MCP servers by tag
 */
export function filterMcpServersByTag(
  servers: McpMarketplaceServer[],
  tag: McpServerTag
): McpMarketplaceServer[] {
  return servers.filter((s) => s.tags.includes(tag));
}

/**
 * Search MCP servers by name or description
 */
export function searchMcpServers(
  servers: McpMarketplaceServer[],
  query: string
): McpMarketplaceServer[] {
  const lowerQuery = query.toLowerCase();
  return servers.filter(
    (s) =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery) ||
      s.tags.some((t) => t.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get all unique tags from curated servers
 */
export function getUniqueMcpServerTags(): McpServerTag[] {
  const tags = new Set<McpServerTag>();
  CURATED_MCP_SERVERS.forEach((s) => s.tags.forEach((t) => tags.add(t)));
  return Array.from(tags);
}