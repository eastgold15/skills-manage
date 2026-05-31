import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Loader2,
  Download,
  Check,
  ChevronDown,
  Grid3X3,
  List,
  Package,
  Shield,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useMcpMarketplaceStore } from "@/stores/mcpMarketplaceStore";
import { useMcpServerStore } from "@/stores/mcpServerStore";
import {
  CURATED_MCP_SERVERS,
  MCP_CLIENT_PLATFORM_NAMES,
  MCP_SERVER_TAGS,
  type McpMarketplaceServer,
  type McpClientPlatform,
  type McpServerTag,
} from "@/data/mcpSources";
import { fetchOfficialRegistryServers } from "@/lib/mcpRegistry";
import { cn } from "@/lib/utils";

// ─── Simple Badge Component ───────────────────────────────────────────────────

function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-muted text-muted-foreground",
    outline: "border border-border bg-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── Components ───────────────────────────────────────────────────────────────

function TagBadge({
  tag,
  isSelected,
  onClick,
}: {
  tag: McpServerTag;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
        isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {tag}
    </button>
  );
}

function ServerCard({
  server,
  onInstall,
  isInstalling,
}: {
  server: McpMarketplaceServer;
  onInstall: (server: McpMarketplaceServer) => void;
  isInstalling: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Card className="group hover:border-primary/40 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            {server.iconUrl ? (
              <img
                src={server.iconUrl}
                alt={server.name}
                className="w-10 h-10 rounded-md object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-base">{server.name}</CardTitle>
              <CardDescription className="text-xs">{server.publisher}</CardDescription>
            </div>
          </div>
          {server.requiresAuth && (
            <Badge variant="secondary" className="shrink-0">
              <Shield className="w-3 h-3 mr-1" />
              Auth
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {server.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-3">
          {server.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{server.source}</span>
            {server.popularity && (
              <span>· {server.popularity.toLocaleString()} uses</span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => onInstall(server)}
            disabled={isInstalling}
          >
            {isInstalling ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Download className="w-4 h-4 mr-1" />
            )}
            {t("common.install")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ServerListItem({
  server,
  onInstall,
  isInstalling,
}: {
  server: McpMarketplaceServer;
  onInstall: (server: McpMarketplaceServer) => void;
  isInstalling: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/40 transition-colors">
      {server.iconUrl ? (
        <img
          src={server.iconUrl}
          alt={server.name}
          className="w-12 h-12 rounded-md object-cover shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <Package className="w-6 h-6 text-primary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium truncate">{server.name}</h3>
          {server.requiresAuth && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Auth
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {server.description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {server.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          <span className="text-xs text-muted-foreground capitalize">
            · {server.source}
          </span>
        </div>
      </div>
      <Button
        size="sm"
        onClick={() => onInstall(server)}
        disabled={isInstalling}
      >
        {isInstalling ? (
          <Loader2 className="w-4 h-4 animate-spin mr-1" />
        ) : (
          <Download className="w-4 h-4 mr-1" />
        )}
        {t("common.install")}
      </Button>
    </div>
  );
}

// ─── Install Dialog ───────────────────────────────────────────────────────────

function InstallDialog({
  server,
  isOpen,
  onClose,
  onInstall,
}: {
  server: McpMarketplaceServer | null;
  isOpen: boolean;
  onClose: () => void;
  onInstall: (server: McpMarketplaceServer, platforms: McpClientPlatform[]) => void;
}) {
  const { t } = useTranslation();
  const [selectedPlatforms, setSelectedPlatforms] = useState<McpClientPlatform[]>([]);

  // Map agents to supported platforms
  const supportedPlatforms: McpClientPlatform[] = ["claude-desktop", "vscode", "cursor", "claude-code"];

  useEffect(() => {
    if (isOpen && server) {
      // Pre-select platforms that have configs
      const available = server.clientConfigs.map((c) => c.platform);
      setSelectedPlatforms(available);
    }
  }, [isOpen, server]);

  if (!server) return null;

  const togglePlatform = (platform: McpClientPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleInstall = () => {
    onInstall(server, selectedPlatforms);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("mcp.marketplace.installTitle", { name: server.name })}</DialogTitle>
          <DialogDescription>{server.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {server.prerequisites && server.prerequisites.length > 0 && (
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <AlertCircle className="w-4 h-4" />
                {t("mcp.marketplace.prerequisites")}
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {server.prerequisites.map((prereq, i) => (
                  <li key={i}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}

          {server.requiresAuth && server.authInstructions && (
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Shield className="w-4 h-4" />
                {t("mcp.marketplace.authentication")}
              </div>
              <p className="text-sm text-muted-foreground">{server.authInstructions}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-2">
              {t("mcp.marketplace.selectPlatforms")}
            </h4>
            <div className="space-y-2">
              {supportedPlatforms.map((platform) => {
                const hasConfig = server.clientConfigs.some((c) => c.platform === platform);
                const isSelected = selectedPlatforms.includes(platform);

                return (
                  <button
                    key={platform}
                    onClick={() => hasConfig && togglePlatform(platform)}
                    disabled={!hasConfig}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-md border transition-colors",
                      !hasConfig && "opacity-50 cursor-not-allowed",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <span className="font-medium">
                      {MCP_CLIENT_PLATFORM_NAMES[platform]}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleInstall}
              disabled={selectedPlatforms.length === 0}
            >
              {t("mcp.marketplace.installToPlatforms", { count: selectedPlatforms.length })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export function McpMarketplaceView() {
  const { t } = useTranslation();

  // Store
  const {
    filteredServers,
    sources,
    selectedSource,
    selectedTags,
    searchQuery,
    viewMode,
    isLoading,
    setSelectedSource,
    toggleTag,
    clearTags,
    setSearchQuery,
    setViewMode,
    initialize,
  } = useMcpMarketplaceStore();

  const createServer = useMcpServerStore((s) => s.createServer);

  // Local state
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<McpMarketplaceServer | null>(null);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle install
  const handleInstallClick = (server: McpMarketplaceServer) => {
    setSelectedServer(server);
    setIsInstallDialogOpen(true);
  };

  const handleInstall = async (server: McpMarketplaceServer, platforms: McpClientPlatform[]) => {
    setInstallingId(server.id);
    try {
      // Get config for first selected platform
      const platform = platforms[0];
      const config = server.clientConfigs.find((c) => c.platform === platform);

      if (!config) {
        throw new Error(`No config found for platform ${platform}`);
      }

      // Create server in store
      await createServer({
        name: server.name,
        command: config.command || "npx",
        args: (config.args || []).join(" "),
        env: config.env ? JSON.stringify(config.env, null, 2) : "",
        cwd: config.cwd || "",
      });

      toast.success(t("mcp.marketplace.installSuccess", { name: server.name }));
    } catch (err) {
      toast.error(String(err));
    } finally {
      setInstallingId(null);
    }
  };

  // Refresh from official registry
  const handleRefresh = async () => {
    try {
      const servers = await fetchOfficialRegistryServers();
      // Merge with curated servers
      const merged = [...CURATED_MCP_SERVERS];
      servers.forEach((s) => {
        if (!merged.find((m) => m.id === s.id)) {
          merged.push(s);
        }
      });
      // Update store
      useMcpMarketplaceStore.setState({ servers: merged });
      toast.success(t("mcp.marketplace.refreshSuccess"));
    } catch (err) {
      toast.error(t("mcp.marketplace.refreshError"));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div>
          <h1 className="text-xl font-semibold">{t("mcp.marketplace.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("mcp.marketplace.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4 mr-2", isLoading && "animate-spin")} />
            {t("common.refresh")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-border space-y-4">
        {/* Search and Source */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t("mcp.marketplace.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Source Select */}
          <div className="relative">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="h-9 pl-3 pr-8 rounded-md border border-input bg-background text-sm cursor-pointer appearance-none min-w-[140px]"
            >
              {sources.map((source) => (
                <option key={source.slug} value={source.slug}>
                  {source.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>

          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              onClick={() => setViewMode("list")}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {MCP_SERVER_TAGS.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              isSelected={selectedTags.includes(tag)}
              onClick={() => toggleTag(tag)}
            />
          ))}
          {selectedTags.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearTags}>
              {t("common.clear")}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {filteredServers.length === 0 ? (
            <div className="text-center py-12">
              <Package className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {t("mcp.marketplace.noResults")}
              </h3>
              <p className="text-muted-foreground">
                {t("mcp.marketplace.tryDifferentSearch")}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServers.map((server) => (
                <ServerCard
                  key={server.id}
                  server={server}
                  onInstall={handleInstallClick}
                  isInstalling={installingId === server.id}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredServers.map((server) => (
                <ServerListItem
                  key={server.id}
                  server={server}
                  onInstall={handleInstallClick}
                  isInstalling={installingId === server.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Install Dialog */}
      <InstallDialog
        server={selectedServer}
        isOpen={isInstallDialogOpen}
        onClose={() => setIsInstallDialogOpen(false)}
        onInstall={handleInstall}
      />
    </div>
  );
}
