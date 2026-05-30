import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ModuleSidebar } from "./ModuleSidebar";
import { sidebarModules } from "./data/sidebar-config";
import { useMcpServerByAgent } from "@/stores/mcpServerStore";
import { useCentralSkillsStore } from "@/stores/centralSkillsStore";
import type { ModuleType } from "./types";

export function MainSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 确定当前激活的模块
  const isMcpMode = pathname.startsWith("/mcp/");
  const activeModule: ModuleType = isMcpMode ? "mcp" : "skills";

  // 获取对应模块的 countByAgent
  const skillsByAgent = useCentralSkillsStore((s) => s.skillsByAgent);
  const mcpServersByAgent = useMcpServerByAgent();

  const currentModuleConfig =
    activeModule === "skills"
      ? sidebarModules.skills
      : sidebarModules.mcp;

  const currentCountByAgent =
    activeModule === "skills" ? skillsByAgent : mcpServersByAgent;

  const showAllPlatformsKey =
    activeModule === "skills"
      ? "skills-manage:show-all-platforms"
      : "mcp-manage:show-all-platforms";

  function handleModuleSwitch(module: ModuleType) {
    if (module === "skills") {
      navigate("/central");
    } else {
      navigate("/mcp/central");
    }
  }

  return (
    <div className="flex h-full">
      {/* 模块选择侧边栏 */}
      <div className="w-12 bg-sidebar-secondary border-r border-border flex flex-col items-center py-4 gap-1">
        {Object.values(sidebarModules).map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;

          return (
            <button
              key={module.id}
              onClick={() => handleModuleSwitch(module.id as ModuleType)}
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

        {/* 设置按钮 */}
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

      {/* 当前模块的侧边栏 */}
      <ModuleSidebar
        moduleConfig={currentModuleConfig}
        showAllPlatformsKey={showAllPlatformsKey}
        countByAgent={currentCountByAgent}
      />
    </div>
  );
}