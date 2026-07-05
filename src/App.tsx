import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { GoodsPage } from './pages/GoodsPage';
import { StoresPage } from './pages/StoresPage';
import { CustomerOutboundRulePage } from './pages/CustomerOutboundRulePage';
import { CustomersPage } from './pages/CustomersPage';
import { PageTab } from './types';

const pageTitles: Record<PageTab, string> = {
  goods: '货物管理',
  stores: '仓库管理',
  customerOutboundRule: '客户出库规则',
  customers: '客户管理',
};

function App() {
  const [activeTab, setActiveTab] = useState<PageTab>('goods');

  const renderPage = () => {
    switch (activeTab) {
      case 'goods':
        return <GoodsPage />;
      case 'stores':
        return <StoresPage />;
      case 'customerOutboundRule':
        return <CustomerOutboundRulePage />;
      case 'customers':
        return <CustomersPage />;
      default:
        return <GoodsPage />;
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
