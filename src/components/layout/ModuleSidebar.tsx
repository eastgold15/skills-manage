import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PlatformIcon } from "@/components/platform/PlatformIcon";
import { usePlatformStore } from "@/stores/platformStore";
import { cn } from "@/lib/utils";
import { isEnabledInstallTargetAgent } from "@/lib/agents";
import type { ModuleConfig } from "./types";

interface ModuleSidebarProps {
  moduleConfig: ModuleConfig;
  showAllPlatformsKey: string;
  countByAgent: Record<string, number>;
}

export function ModuleSidebar({
  moduleConfig,
  showAllPlatformsKey,
  countByAgent,
}: ModuleSidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { agents, isLoading } = usePlatformStore();

  const [expanded, setExpanded] = useState(true);
  const [showAllPlatforms, setShowAllPlatforms] = useState(() => {
    try {
      return window.localStorage.getItem(showAllPlatformsKey) === "true";
    } catch {
      return false;
    }
  });

  // 只根据当前模块的 count 来过滤平台
  const platformAgents = agents.filter(
    (a) =>
      isEnabledInstallTargetAgent(a) &&
      (showAllPlatforms || (countByAgent?.[a.id] ?? 0) > 0)
  );
  const lobsterAgents = platformAgents.filter((a) => a.category === "lobster");
  const codingAgents = platformAgents.filter((a) => a.category !== "lobster");

  function toggleShowAllPlatforms() {
    setShowAllPlatforms((previous) => {
      const next = !previous;
      try {
        window.localStorage.setItem(showAllPlatformsKey, String(next));
      } catch {
        // Ignore storage failures
      }
      return next;
    });
  }

  return (
    <nav
      className={cn(
        "flex flex-col shrink-0 h-full border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        expanded ? "w-52" : "w-14"
      )}
      aria-label={t("sidebar.mainNav")}
    >
      <div
        className={cn(
          "flex items-center border-b border-border",
          expanded ? "justify-between px-3 py-2" : "justify-center py-2"
        )}
      >
        {expanded && (
          <span className="text-sm font-bold tracking-tight text-sidebar-primary">
            {moduleConfig.id === "mcp"
              ? t("mcp.manage.title")
              : t("app.name")}
          </span>
        )}
        <button
          onClick={() => setExpanded((e) => !e)}
          className={cn(
            "p-1 rounded-md transition-colors cursor-pointer",
            "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
          aria-label={
            expanded
              ? t("sidebar.collapseSidebar")
              : t("sidebar.expandSidebar")
          }
        >
          {expanded ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
        {moduleConfig.navGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.title && expanded && (
              <div className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider px-2.5 pt-3 pb-1 first:pt-0">
                {t(group.title)}
              </div>
            )}
            {group.items.map((item) => {
              if ("items" in item) {
                return (
                  <div key={item.title}>
                    {expanded && (
                      <div className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider px-2.5 pt-2 pb-1">
                        {t(item.title)}
                      </div>
                    )}
                  </div>
                );
              }

              const Icon = item.icon;
              const isActive = pathname === item.url;

              return (
                <div key={item.url} className="relative">
                  <button
                    onClick={() => navigate(item.url)}
                    title={item.title ? t(item.title) : undefined}
                    disabled={item.disabled}
                    className={cn(
                      "flex items-center w-full rounded-md transition-colors cursor-pointer",
                      !isActive &&
                        "hover:bg-primary/15 hover:text-primary",
                      isActive && "bg-hover-bg text-white",
                      item.disabled && "opacity-50 cursor-not-allowed",
                      expanded
                        ? "gap-2.5 px-2.5 py-1.5 text-sm"
                        : "justify-center py-2 px-1.5"
                    )}
                  >
                    {Icon && <Icon className="size-4 shrink-0" />}
                    {expanded && (
                      <span className="truncate flex-1 text-left">
                        {t(item.title)}
                      </span>
                    )}
                  </button>
                  {isActive && (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-white"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        <div className="border-t border-sidebar-border/70 my-2" />

        {isLoading ? (
          <div
            className={cn(
              "flex items-center py-2 text-muted-foreground text-sm",
              expanded ? "gap-2 px-2.5" : "justify-center"
            )}
          >
            <Loader2 className="size-4 animate-spin shrink-0" />
            {expanded && <span>{t("sidebar.scanning")}</span>}
          </div>
        ) : (
          <>
            {lobsterAgents.length > 0 && (
              <>
                {expanded && (
                  <div className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider px-2.5 pt-2 pb-1">
                    {t("sidebar.categoryLobster")}
                  </div>
                )}
                {lobsterAgents.map((agent) => (
                  <AgentNavItem
                    key={agent.id}
                    agent={agent}
                    pathname={pathname}
                    navigate={navigate}
                    expanded={expanded}
                    count={countByAgent?.[agent.id]}
                    moduleId={moduleConfig.id}
                  />
                ))}
              </>
            )}

            {codingAgents.length > 0 && (
              <>
                {expanded && (
                  <div className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider px-2.5 pt-2 pb-1">
                    {t("sidebar.categoryCoding")}
                  </div>
                )}
                {codingAgents.map((agent) => (
                  <AgentNavItem
                    key={agent.id}
                    agent={agent}
                    pathname={pathname}
                    navigate={navigate}
                    expanded={expanded}
                    count={countByAgent?.[agent.id]}
                    moduleId={moduleConfig.id}
                  />
                ))}
              </>
            )}
          </>
        )}

        {!isLoading && (
          <div className={cn("pt-2", expanded ? "px-1" : "flex justify-center")}>
            <button
              onClick={toggleShowAllPlatforms}
              title={
                showAllPlatforms
                  ? t("sidebar.hideEmptyPlatforms")
                  : t("sidebar.showAllPlatforms")
              }
              className={cn(
                "cursor-pointer rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                expanded
                  ? "flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-left"
                  : "p-2"
              )}
            >
              {showAllPlatforms ? (
                <EyeOff className="size-4 shrink-0" />
              ) : (
                <Eye className="size-4 shrink-0" />
              )}
              {expanded && (
                <span className="truncate">
                  {showAllPlatforms
                    ? t("sidebar.hideEmptyPlatforms")
                    : t("sidebar.showAllPlatforms")}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

interface AgentNavItemProps {
  agent: {
    id: string;
    display_name: string;
  };
  pathname: string;
  navigate: (path: string) => void;
  expanded: boolean;
  count?: number;
  moduleId: string;
}

function AgentNavItem({
  agent,
  pathname,
  navigate,
  expanded,
  count,
  moduleId,
}: AgentNavItemProps) {
  // Skills 模块使用旧路由，MCP 模块使用新路由
  const isActive =
    (moduleId === "skills" && pathname === `/platform/${agent.id}`) ||
    (moduleId === "mcp" && pathname === `/mcp/platform/${agent.id}`);

  const targetPath =
    moduleId === "skills"
      ? `/platform/${agent.id}`
      : `/mcp/platform/${agent.id}`;

  return (
    <div className="relative">
      <button
        onClick={() => navigate(targetPath)}
        title={agent.display_name}
        className={cn(
          "flex items-center w-full rounded-md transition-colors cursor-pointer",
          !isActive && "hover:bg-primary/15 hover:text-primary",
          isActive && "bg-hover-bg text-white",
          expanded ? "gap-2.5 px-2.5 py-1.5 text-sm" : "justify-center py-2 px-1.5"
        )}
      >
        <PlatformIcon agentId={agent.id} className="size-4 shrink-0" />
        {expanded && (
          <>
            <span className="truncate flex-1 text-left">{agent.display_name}</span>
            {count !== undefined && count > 0 && (
              <span
                className={cn(
                  "text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full shrink-0",
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-muted/60 text-muted-foreground"
                )}
              >
                {count}
              </span>
            )}
          </>
        )}
      </button>
      {isActive && (
        <span
          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-white"
          aria-hidden="true"
        />
      )}
    </div>
  );
}