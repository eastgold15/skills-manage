import { useLocation, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ModuleSidebar } from "./ModuleSidebar";
import { sidebarModules } from "./data/sidebar-config";
import { usePlatformStore } from "@/stores/platformStore";
import { useMcpServerByAgent } from "@/stores/mcpServerStore";

export function MainSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isMcpMode = pathname.startsWith("/mcp/");
  const skillsByAgent = usePlatformStore((s) => s.skillsByAgent);
  const mcpServersByAgentFull = useMcpServerByAgent();
  const mcpServersByAgent: Record<string, number> = {};
  for (const [agentId, servers] of Object.entries(mcpServersByAgentFull)) {
    mcpServersByAgent[agentId] = servers.length;
  }

  const activeModule = isMcpMode ? "mcp" : "skills";

  function handleModuleSwitch(module: "skills" | "mcp") {
    if (module === "skills") {
      navigate("/central");
    } else {
      navigate("/mcp/central");
    }
  }

  const currentModuleConfig =
    activeModule === "skills"
      ? sidebarModules.skills
      : sidebarModules.mcp;

  const showAllPlatformsKey =
    activeModule === "skills"
      ? "skills-manage:show-all-platforms"
      : "mcp-manage:show-all-platforms";

  return (
    <div className="flex h-full">
      <div className="w-12 bg-sidebar-secondary border-r border-border flex flex-col items-center py-4 gap-1">
        {Object.values(sidebarModules).map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;

          return (
            <button
              key={module.id}
              onClick={() => handleModuleSwitch(module.id as "skills" | "mcp")}
              className={cn(
                "p-2.5 rounded-lg transition-all cursor-pointer",
                isActive
                  ? "bg-hover-bg text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
              title={module.id === "mcp" ? t("mcp.manage.title") : t("app.name")}
            >
              <Icon className="size-5" />
            </button>
          );
        })}

        <div className="flex-1" />

        <button
          onClick={() => navigate("/settings")}
          className={cn(
            "p-2.5 rounded-lg transition-all cursor-pointer",
            pathname === "/settings"
              ? "bg-hover-bg text-white"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          )}
          title={t("sidebar.settings")}
        >
          <Settings className="size-5" />
        </button>
      </div>

      <ModuleSidebar
        moduleConfig={currentModuleConfig}
        showAllPlatformsKey={showAllPlatformsKey}
        skillsByAgent={skillsByAgent}
        mcpServersByAgent={mcpServersByAgent}
      />
    </div>
  );
}