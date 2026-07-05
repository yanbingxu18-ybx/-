import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { GoodsPage } from './pages/GoodsPage';
import { StoresPage } from './pages/StoresPage';
import { CustomerOutboundRulePage } from './pages/CustomerOutboundRulePage';
import { CustomersPage } from './pages/CustomersPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { PageTab } from './types';

const pageTitles: Record<PageTab, string> = {
  home: '首页',
  goods: '货物管理',
  stores: '仓库管理',
  customerOutboundRule: '客户出库规则',
  customers: '客户管理',
  vehicles: '车辆管理',
  reports: '统计报表',
  settings: '系统设置',
  help: '帮助中心',
};

function App() {
  const [activeTab, setActiveTab] = useState<PageTab>('home');

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'goods':
        return <GoodsPage />;
      case 'stores':
        return <StoresPage />;
      case 'customerOutboundRule':
        return <CustomerOutboundRulePage />;
      case 'customers':
        return <CustomersPage />;
      case 'vehicles':
        return <VehiclesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitles[activeTab]} />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
