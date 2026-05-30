import { useTranslation } from "react-i18next";
import type { NavGroup as NavGroupType } from "./types";

interface NavGroupProps extends NavGroupType {
  isExpanded?: boolean;
}

export function NavGroup({ title, items, isExpanded = true }: NavGroupProps) {
  const { t } = useTranslation();

  if (!items.length) return null;

  return (
    <div className="px-1.5">
      {title && isExpanded && (
        <div className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider px-2.5 pt-4 pb-1.5 first:pt-0">
          {t(title)}
        </div>
      )}
      <div className="space-y-0.5">
        {items.map((item) => {
          if ("items" in item) {
            return (
              <div
                key={item.title}
                className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider px-2.5 pt-3 pb-1"
              >
                {t(item.title)}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}