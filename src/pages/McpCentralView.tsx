import { McpServerDialog } from "@/components/settings/McpServerDialog";
import { McpServerInstallDialog } from "@/components/settings/McpServerInstallDialog";
import { McpServerRow } from "@/components/settings/McpServerRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMcpServerStore } from "@/stores/mcpServerStore";
import { usePlatformStore } from "@/stores/platformStore";
import { Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function McpCentralView() {
  const { t } = useTranslation();
  const { servers: mcpServers, isLoading, loadMcpServers, deleteMcpServer, createServer, updateServer, batchInstallToAgents, batchUninstallFromAgents, installedAgentIds } = useMcpServerStore();
  const agents = usePlatformStore((s) => s.agents);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  useEffect(() => {
    loadMcpServers();
  }, [loadMcpServers]);

  function handleInstallClick(serverId: string) {
    setSelectedServerId(serverId);
    setIsInstallDialogOpen(true);
  }

  function handleDelete(id: string) {
    deleteMcpServer(id);
  }

  const selectedServer = mcpServers.find((s) => s.id === selectedServerId);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div>
          <h1 className="text-xl font-semibold">{t("mcp.sidebar.centralMcps")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("mcp.central.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadMcpServers()}
            disabled={isLoading}
          >
            <RefreshCw className="size-4 mr-2" />
            {t("common.refresh")}
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="size-4 mr-2" />
            {t("mcp.common.add")}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">{t("common.loading")}</div>
          </div>
        ) : mcpServers.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t("mcp.central.empty")}</p>
              <Button
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="size-4 mr-2" />
                {t("mcp.common.add")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {mcpServers.map((server) => (
              <McpServerRow
                key={server.id}
                server={server}
                onInstall={() => handleInstallClick(server.id)}
                onDelete={() => handleDelete(server.id)}
              />
            ))}
          </div>
        )}
      </div>

      <McpServerDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={async (data) => { await createServer(data); }}
        onEdit={async (id, data) => { await updateServer(id, data); }}
      />

      <McpServerInstallDialog
        open={isInstallDialogOpen}
        onOpenChange={setIsInstallDialogOpen}
        server={selectedServer || null}
        agents={agents}
        installedAgentIds={selectedServer ? (installedAgentIds[selectedServer.id] || []) : []}
        onInstall={batchInstallToAgents}
        onUninstall={batchUninstallFromAgents}
      />
    </div>
  );
}