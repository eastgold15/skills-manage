import { Pencil, Trash2, Download, Server } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { InlineConfirmAction } from "@/components/ui/inline-confirm-action";
import { McpServer } from "@/types";
import { AgentWithStatus } from "@/types";

interface McpServerRowProps {
  server: McpServer;
  installedAgentIds: string[];
  agents: AgentWithStatus[];
  onEdit: (server: McpServer) => void;
  onDelete: (id: string) => void;
  onInstall: (server: McpServer) => void;
  isDeleting: boolean;
}

export function McpServerRow({
  server,
  installedAgentIds,
  agents,
  onEdit,
  onDelete,
  onInstall,
  isDeleting,
}: McpServerRowProps) {
  const { t } = useTranslation();
  const installedAgents = agents.filter((a) => installedAgentIds.includes(a.id));

  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-border/50 last:border-0">
      <Server className="size-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{server.name}</div>
        <div className="text-xs text-muted-foreground truncate mt-0.5 font-mono">
          {server.command} {server.args.join(" ")}
        </div>
        {installedAgents.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {installedAgents.slice(0, 3).map((agent) => (
              <span
                key={agent.id}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                {agent.display_name}
              </span>
            ))}
            {installedAgents.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{installedAgents.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onInstall(server)}
          aria-label={t("mcpServer.installToPlatform", { name: server.name })}
        >
          <Download className="size-3.5" />
          <span className="hidden sm:inline">
            {installedAgentIds.length > 0 ? t("mcpServer.reinstall") : t("mcpServer.install")}
          </span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(server)}
          aria-label={t("mcpServer.edit", { name: server.name })}
        >
          <Pencil className="size-3.5" />
        </Button>
        <InlineConfirmAction
          onConfirm={() => {
            onDelete(server.id);
            toast.success(t("mcpServer.deleteSuccess", { name: server.name }));
          }}
          isLoading={isDeleting}
          idleAriaLabel={t("mcpServer.deleteLabel", { name: server.name })}
          idleTitle={t("mcpServer.deleteLabel", { name: server.name })}
          confirmLabel={t("common.confirmDelete")}
          icon={<Trash2 className="size-3.5" />}
        />
      </div>
    </div>
  );
}