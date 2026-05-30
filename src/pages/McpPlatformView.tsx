import { McpServerDialog } from "@/components/settings/McpServerDialog";
import { McpServerRow } from "@/components/settings/McpServerRow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMcpServerByAgent, useMcpServerStore } from "@/stores/mcpServerStore";
import { usePlatformStore } from "@/stores/platformStore";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export function McpPlatformView() {
  const { t } = useTranslation();
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { agents } = usePlatformStore();
  const { isLoading, loadMcpServers, uninstallMcpServerFromAgent, createServer, updateServer } = useMcpServerStore();
  const mcpServersByAgent = useMcpServerByAgent();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const agent = agents.find((a) => a.id === agentId);
  const platformMcpServers = mcpServersByAgent[agentId || ""] || [];

  useEffect(() => {
    loadMcpServers();
  }, [loadMcpServers]);

  function handleBack() {
    navigate("/mcp/central");
  }

  function handleUninstall(serverId: string) {
    if (agentId) {
      uninstallMcpServerFromAgent(serverId, agentId);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              {agent?.display_name || t("mcp.platform.unknown")}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {agent?.global_skills_dir || t("mcp.platform.noPath")}
            </p>
          </div>
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
        ) : platformMcpServers.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t("mcp.platform.empty")}</p>
              <Button
                className="mt-4"
                onClick={() => navigate("/mcp/central")}
              >
                {t("mcp.platform.browseCentral")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {platformMcpServers.map((server) => (
              <McpServerRow
                key={server.id}
                server={server}
                onInstall={() => { }}
                onDelete={() => handleUninstall(server.id)}
                showDeleteAsUninstall
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
    </div>
  );
}