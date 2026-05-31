// ─── MCP Registry API Client ───────────────────────────────────────────────────
// Client for fetching MCP servers from official registry and other sources

import type { McpMarketplaceServer, McpClientConfig } from "@/data/mcpSources";

// ─── Constants ─────────────────────────────────────────────────────────────────

const OFFICIAL_REGISTRY_URL = "https://registry.modelcontextprotocol.io/v0/servers";
const SMITHERY_API_URL = "https://api.smithery.ai/v1";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface OfficialRegistryServer {
  server: {
    $schema: string;
    name: string;
    title?: string;
    description: string;
    version: string;
    repository?: {
      url: string;
      source: "github" | "gitlab" | "other";
    };
    websiteUrl?: string;
    icons?: Array<{
      src: string;
      mimeType: string;
      sizes?: string[];
    }>;
    remotes?: Array<{
      type: "streamable-http" | "sse";
      url: string;
      headers?: Array<{
        name: string;
        description: string;
        isRequired?: boolean;
        isSecret?: boolean;
      }>;
    }>;
    packages?: Array<{
      registryType: "npm" | "pypi" | "cargo";
      identifier: string;
      version: string;
      transport: {
        type: "stdio";
      };
    }>;
  };
  _meta: {
    "io.modelcontextprotocol.registry/official": {
      status: "active" | "deprecated";
      statusChangedAt: string;
      publishedAt: string;
      updatedAt: string;
      isLatest: boolean;
      statusMessage?: string;
    };
  };
}

export interface OfficialRegistryResponse {
  servers: OfficialRegistryServer[];
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * Fetch MCP servers from the official MCP Registry
 */
export async function fetchOfficialRegistryServers(): Promise<McpMarketplaceServer[]> {
  try {
    const response = await fetch(OFFICIAL_REGISTRY_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const data: OfficialRegistryResponse = await response.json();

    // Transform registry format to our format
    return data.servers
      .filter((s) => s._meta["io.modelcontextprotocol.registry/official"].isLatest)
      .filter((s) => s._meta["io.modelcontextprotocol.registry/official"].status !== "deprecated")
      .map(transformRegistryServerToMarketplaceServer);
  } catch (error) {
    console.error("Failed to fetch from official registry:", error);
    throw error;
  }
}

/**
 * Transform official registry server format to our marketplace format
 */
function transformRegistryServerToMarketplaceServer(
  registryServer: OfficialRegistryServer
): McpMarketplaceServer {
  const { server } = registryServer;

  // Generate client configs from remotes or packages
  const clientConfigs: McpClientConfig[] = [];

  // Handle remote servers (streamable-http or sse)
  if (server.remotes && server.remotes.length > 0) {
    const remote = server.remotes[0]; // Use first remote
    const headers: Record<string, string> = {};
    const env: Record<string, string> = {};

    // Convert headers to env vars if they are secrets
    remote.headers?.forEach((h) => {
      if (h.isSecret) {
        env[h.name] = `YOUR_${h.name.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
      } else {
        headers[h.name] = h.description;
      }
    });

    // Add config for Claude Desktop
    clientConfigs.push({
      platform: "claude-desktop",
      transport: remote.type,
      url: remote.url,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    });

    // Add config for VS Code
    clientConfigs.push({
      platform: "vscode",
      transport: remote.type,
      url: remote.url,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    });
  }

  // Handle stdio servers (npm/pypi packages)
  if (server.packages && server.packages.length > 0) {
    const pkg = server.packages[0];
    let command = "";
    let args: string[] = [];

    switch (pkg.registryType) {
      case "npm":
        command = "npx";
        args = ["-y", pkg.identifier];
        break;
      case "pypi":
        command = "uvx";
        args = [pkg.identifier];
        break;
      case "cargo":
        command = "cargo";
        args = ["run", "--package", pkg.identifier];
        break;
    }

    if (command) {
      clientConfigs.push(
        {
          platform: "claude-desktop",
          command,
          args,
        },
        {
          platform: "vscode",
          command,
          args,
        },
        {
          platform: "cursor",
          command,
          args,
        },
        {
          platform: "claude-code",
          command,
          args,
        }
      );
    }
  }

  // Determine install method
  let installMethod: McpMarketplaceServer["installMethod"] = "npx";
  if (server.remotes && server.remotes.length > 0) {
    installMethod = "remote";
  } else if (server.packages && server.packages.length > 0) {
    const pkg = server.packages[0];
    switch (pkg.registryType) {
      case "npm":
        installMethod = "npx";
        break;
      case "pypi":
        installMethod = "pip";
        break;
      case "cargo":
        installMethod = "cargo";
        break;
    }
  }

  // Infer tags from description
  const tags = inferTagsFromDescription(server.description);

  // Check if requires auth
  const requiresAuth =
    server.remotes?.some((r) => r.headers?.some((h) => h.isRequired)) ?? false;

  return {
    id: server.name,
    name: server.title || server.name,
    description: server.description,
    publisher: server.name.split("/")[0] || "Unknown",
    repository: server.repository,
    websiteUrl: server.websiteUrl,
    iconUrl: server.icons?.[0]?.src,
    tags,
    installMethod,
    packageIdentifier: server.packages?.[0]?.identifier || server.name,
    packageVersion: server.packages?.[0]?.version || server.version,
    clientConfigs,
    requiresAuth,
    source: "official-registry",
    isDeprecated: registryServer._meta["io.modelcontextprotocol.registry/official"].status === "deprecated",
  };
}

/**
 * Infer tags from server description
 */
function inferTagsFromDescription(description: string): McpMarketplaceServer["tags"] {
  const lower = description.toLowerCase();
  const tags: McpMarketplaceServer["tags"] = [];

  if (lower.includes("search") || lower.includes("find")) tags.push("search");
  if (lower.includes("database") || lower.includes("sql") || lower.includes("postgres")) tags.push("database");
  if (lower.includes("file") || lower.includes("filesystem")) tags.push("file-system");
  if (lower.includes("web") || lower.includes("browser") || lower.includes("http")) tags.push("web");
  if (lower.includes("ai") || lower.includes("llm") || lower.includes("model")) tags.push("ai-ml");
  if (lower.includes("git") || lower.includes("github")) tags.push("git");
  if (lower.includes("cloud") || lower.includes("aws") || lower.includes("azure")) tags.push("cloud");
  if (lower.includes("slack") || lower.includes("discord") || lower.includes("email")) tags.push("communication");
  if (lower.includes("docs") || lower.includes("documentation")) tags.push("docs");
  if (lower.includes("test") || lower.includes("debug")) tags.push("testing");
  if (lower.includes("monitor") || lower.includes("log")) tags.push("monitoring");
  if (lower.includes("security") || lower.includes("auth")) tags.push("security");

  if (tags.length === 0) tags.push("other");

  return tags;
}

/**
 * Search MCP servers in official registry
 */
export async function searchOfficialRegistry(query: string): Promise<McpMarketplaceServer[]> {
  // The official registry doesn't have a search endpoint yet, so we fetch all and filter
  const servers = await fetchOfficialRegistryServers();
  const lowerQuery = query.toLowerCase();
  return servers.filter(
    (s) =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Fetch servers from Smithery (requires API key)
 */
export async function fetchSmitheryServers(apiKey?: string): Promise<McpMarketplaceServer[]> {
  if (!apiKey) {
    throw new Error("Smithery API key is required");
  }

  try {
    const response = await fetch(`${SMITHERY_API_URL}/servers`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from Smithery: ${response.status}`);
    }

    // const data = await response.json();
    // TODO: Implement transformation based on actual Smithery API response
    return [];
  } catch (error) {
    console.error("Failed to fetch from Smithery:", error);
    throw error;
  }
}

// ─── Combined Fetch ────────────────────────────────────────────────────────────

/**
 * Fetch MCP servers from all available sources
 */
export async function fetchAllMcpServers(options?: {
  includeOfficial?: boolean;
  includeSmithery?: boolean;
  smitheryApiKey?: string;
}): Promise<McpMarketplaceServer[]> {
  const servers: McpMarketplaceServer[] = [];
  const errors: string[] = [];

  if (options?.includeOfficial !== false) {
    try {
      const officialServers = await fetchOfficialRegistryServers();
      servers.push(...officialServers);
    } catch (error) {
      errors.push(`Official registry: ${error}`);
    }
  }

  if (options?.includeSmithery && options.smitheryApiKey) {
    try {
      const smitheryServers = await fetchSmitheryServers(options.smitheryApiKey);
      servers.push(...smitheryServers);
    } catch (error) {
      errors.push(`Smithery: ${error}`);
    }
  }

  if (errors.length > 0 && servers.length === 0) {
    throw new Error(`Failed to fetch from all sources: ${errors.join(", ")}`);
  }

  // Remove duplicates by ID
  const seen = new Set<string>();
  return servers.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}
