import { useState } from 'react';
import { Package, Warehouse, AlertTriangle, Users, ChevronDown, ChevronRight, Truck, FileText, BarChart3 } from 'lucide-react';
import { PageTab } from '../types';

interface SidebarProps {
  activeTab: PageTab;
  onTabChange: (tab: PageTab) => void;
}

const menuGroups: {
  label: string;
  items: { id: PageTab; label: string; icon: typeof Package }[];
}[] = [
  {
    label: '基础信息',
    items: [
      { id: 'goods', label: '货物管理', icon: Package },
      { id: 'stores', label: '仓库管理', icon: Warehouse },
      { id: 'customers', label: '客户管理', icon: Users },
    ],
  },
  {
    label: '仓储管理',
    items: [
      { id: 'inboundPlan', label: '入库计划', icon: Truck },
      { id: 'inboundOrder', label: '入库单管理', icon: FileText },
      { id: 'stockStat', label: '库存统计', icon: BarChart3 },
      { id: 'outboundPlan', label: '出库计划', icon: FileText },
      { id: 'outboundOrder', label: '出库单管理', icon: FileText },
    ],
  },
  {
    label: '规则管理',
    items: [
      { id: 'customerOutboundRule', label: '客户出库规则', icon: AlertTriangle },
    ],
  },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['基础信息', '仓储管理', '规则管理']));

  const toggleGroup = (label: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedGroups(newExpanded);
  };

  const isGroupActive = (group: typeof menuGroups[0]) => {
    return group.items.some((item) => item.id === activeTab);
  };

  return (
    <aside className="w-64 bg-slate-800 text-white min-h-screen flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        <h1 className="text-lg font-bold">五环顺通仓储系统</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.label);
            const isActive = isGroupActive(group);
            return (
              <li key={group.label}>
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive && !isExpanded
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  <span className="font-medium text-sm">{group.label}</span>
                </button>
                {isExpanded && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isItemActive = activeTab === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                              isItemActive
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{item.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">管理员</p>
            <p className="text-xs text-slate-400">admin@wht.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
