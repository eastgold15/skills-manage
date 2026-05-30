export type NavLink = {
  title: string;
  url: string;
  icon?: React.ElementType;
  badge?: number;
  disabled?: boolean;
};

export type NavCollapsible = {
  title: string;
  icon?: React.ElementType;
  items: NavLink[];
  disabled?: boolean;
};

export type NavItem = NavLink | NavCollapsible;

export type NavGroup = {
  title?: string;
  items: NavItem[];
};

export type ModuleType = 'skills' | 'mcp';

export type ModuleConfig = {
  id: ModuleType;
  name: string;
  icon: React.ElementType;
  navGroups: NavGroup[];
};

export type SidebarModules = {
  skills: ModuleConfig;
  mcp: ModuleConfig;
};