import { Home, Package, Warehouse, AlertTriangle, Users, Truck, BarChart3, Settings, HelpCircle } from 'lucide-react';
import { PageTab } from '../types';

interface SidebarProps {
  activeTab: PageTab;
  onTabChange: (tab: PageTab) => void;
}

const menuItems: { id: PageTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'goods', label: '货物管理', icon: Package },
  { id: 'stores', label: '仓库管理', icon: Warehouse },
  { id: 'customerOutboundRule', label: '客户出库规则', icon: AlertTriangle },
  { id: 'customers', label: '客户管理', icon: Users },
  { id: 'vehicles', label: '车辆管理', icon: Truck },
  { id: 'reports', label: '统计报表', icon: BarChart3 },
  { id: 'settings', label: '系统设置', icon: Settings },
  { id: 'help', label: '帮助中心', icon: HelpCircle },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-800 text-white min-h-screen flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        <h1 className="text-lg font-bold">五环顺通仓储系统</h1>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
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
