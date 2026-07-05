import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { GoodsPage } from './pages/GoodsPage';
import { StoresPage } from './pages/StoresPage';
import { CustomerOutboundRulePage } from './pages/CustomerOutboundRulePage';
import { CustomersPage } from './pages/CustomersPage';
import { InboundPlanPage } from './pages/InboundPlanPage';
import { InboundOrderPage } from './pages/InboundOrderPage';
import { StockStatPage } from './pages/StockStatPage';
import { PageTab, InboundPlan } from './types';

const pageTitles: Record<PageTab, string> = {
  goods: '货物管理',
  stores: '仓库管理',
  customerOutboundRule: '客户出库规则',
  customers: '客户管理',
  inboundPlan: '入库计划',
  inboundOrder: '入库单管理',
  stockStat: '库存统计',
};

function App() {
  const [activeTab, setActiveTab] = useState<PageTab>('goods');
  const [createOrderFromPlan, setCreateOrderFromPlan] = useState<InboundPlan | null>(null);

  const handleGenerateOrder = (plan: InboundPlan) => {
    setCreateOrderFromPlan(plan);
    setActiveTab('inboundOrder');
  };

  const clearCreateOrderFromPlan = () => {
    setCreateOrderFromPlan(null);
  };

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
      case 'inboundPlan':
        return <InboundPlanPage onGenerateOrder={handleGenerateOrder} />;
      case 'inboundOrder':
        return <InboundOrderPage initialPlan={createOrderFromPlan} onPlanUsed={clearCreateOrderFromPlan} />;
      case 'stockStat':
        return <StockStatPage />;
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
