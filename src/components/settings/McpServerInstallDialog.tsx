import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AgentWithStatus, McpServer } from "@/types";
import { isInstallTargetAgent } from "@/lib/agents";

interface McpServerInstallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  server: McpServer | null;
  agents: AgentWithStatus[];
  installedAgentIds: string[];
  onInstall: (serverId: string, agentIds: string[]) => Promise<void>;
  onUninstall: (serverId: string, agentIds: string[]) => Promise<void>;
}

export function McpServerInstallDialog({
  open,
  onOpenChange,
  server,
  agents,
  installedAgentIds,
  onInstall,
  onUninstall,
}: McpServerInstallDialogProps) {
  const { t } = useTranslation();
  const targetAgents = agents.filter(isInstallTargetAgent);

  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && server) {
      setSelectedAgentIds(new Set(installedAgentIds));
      setError(null);
    }
  }, [open, server?.id, installedAgentIds]);

  function handleCheckboxChange(agentId: string, checked: boolean) {
    setSelectedAgentIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(agentId);
      } else {
        next.delete(agentId);
      }
      return next;
    });
  }

  const installedCount = selectedAgentIds.size;
  const availableAgents = targetAgents.filter((a) => !installedAgentIds.includes(a.id));

  async function handleInstall() {
    if (!server) return;

    const toInstall = Array.from(selectedAgentIds).filter((id) => !installedAgentIds.includes(id));
    if (toInstall.length === 0) {
      toast.info(t("mcpServerInstallDialog.noAgentsSelected"));
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onInstall(server.id, toInstall);
      toast.success(t("mcpServerInstallDialog.installSuccess", { count: toInstall.length }));
      onOpenChange(false);
    } catch (err) {
      setError(String(err));
      toast.error(String(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUninstall() {
    if (!server) return;

    const toUninstall = Array.from(selectedAgentIds).filter((id) => installedAgentIds.includes(id));
    if (toUninstall.length === 0) {
      toast.info(t("mcpServerInstallDialog.noAgentsSelected"));
      onOpenChange(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onUninstall(server.id, toUninstall);
      toast.success(t("mcpServerInstallDialog.uninstallSuccess", { count: toUninstall.length }));
      onOpenChange(false);
    } catch (err) {
      setError(String(err));
      toast.error(String(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (!server) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("mcpServerInstallDialog.title", { name: server.name })}
          </DialogTitle>
          <DialogClose />
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            aria-label={t("common.close")}
          >
            <X className="size-4" />
          </button>
        </DialogHeader>

        <DialogBody className="space-y-4">
          <DialogDescription>
            {t("mcpServerInstallDialog.description")}
          </DialogDescription>

          {targetAgents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("mcpServerInstallDialog.noPlatforms")}
            </p>
          ) : (
            <>
              {installedAgentIds.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("mcpServerInstallDialog.installed")} ({installedAgentIds.length})
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {targetAgents
                      .filter((a) => installedAgentIds.includes(a.id))
                      .map((agent) => {
                        const isChecked = selectedAgentIds.has(agent.id);
                        return (
                          <div key={agent.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(agent.id, !!checked)
                              }
                              aria-label={agent.display_name}
                            />
                            <span className="text-sm text-foreground flex-1 cursor-pointer truncate">
                              {agent.display_name}
                            </span>
                            {!agent.is_detected && (
                              <span className="text-xs text-muted-foreground">
                                {t("mcpServerInstallDialog.notDetected")}
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {availableAgents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("mcpServerInstallDialog.available")} ({availableAgents.length})
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {availableAgents.map((agent) => {
                      const isChecked = selectedAgentIds.has(agent.id);
                      return (
                        <div key={agent.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(agent.id, !!checked)
                            }
                            aria-label={agent.display_name}
                          />
                          <span className="text-sm text-foreground flex-1 cursor-pointer truncate">
                            {agent.display_name}
                          </span>
                          {!agent.is_detected && (
                            <span className="text-xs text-muted-foreground">
                              {t("mcpServerInstallDialog.notDetected")}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {t("common.cancel")}
          </Button>

          {installedCount > 0 && (
            <Button
              variant="destructive"
              onClick={handleUninstall}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  {t("mcpServerInstallDialog.uninstalling")}
                </>
              ) : (
                t("mcpServerInstallDialog.uninstall", { count: installedCount })
              )}
            </Button>
          )}

          <Button onClick={handleInstall} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                {t("mcpServerInstallDialog.installing")}
              </>
            ) : (
              t("mcpServerInstallDialog.install")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}