import { Package, Warehouse, AlertTriangle, TrendingUp, Users, Truck } from 'lucide-react';
import { mockGoods, mockStores, mockCustomerOutboundRules, mockCustomers, mockVehicles } from '../mock/data';

export function HomePage() {
  const stats = [
    { label: '货物种类', value: mockGoods.length, icon: Package, color: 'bg-blue-500' },
    { label: '仓库数量', value: mockStores.length, icon: Warehouse, color: 'bg-green-500' },
    { label: '出库规则', value: mockCustomerOutboundRules.length, icon: AlertTriangle, color: 'bg-yellow-500' },
    { label: '客户数量', value: mockCustomers.length, icon: Users, color: 'bg-purple-500' },
    { label: '车辆总数', value: mockVehicles.length, icon: Truck, color: 'bg-orange-500' },
    { label: '今日入库', value: 12, icon: TrendingUp, color: 'bg-cyan-500' },
  ];

  const recentGoods = mockGoods.slice(0, 5);

  return (
    <div className="p-6">
      <div className="grid grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
              <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">最新货物</h3>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-500">
                  <th className="pb-3 font-medium">货物名称</th>
                  <th className="pb-3 font-medium">编码</th>
                  <th className="pb-3 font-medium">保质期</th>
                </tr>
              </thead>
              <tbody>
                {recentGoods.map((goods) => (
                  <tr key={goods.id} className="border-t border-slate-100">
                    <td className="py-3 font-medium text-slate-800">{goods.name}</td>
                    <td className="py-3 text-slate-600">{goods.code}</td>
                    <td className="py-3 text-slate-600">{goods.shelfLifeDays}天</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">仓库分布</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockStores.slice(0, 5).map((store) => (
                <div key={store.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      store.type === '冷冻' ? 'bg-blue-500' :
                      store.type === '冷藏' ? 'bg-green-500' : 'bg-slate-400'
                    }`}></div>
                    <span className="font-medium text-slate-800">{store.name}</span>
                  </div>
                  <span className="text-sm text-slate-500">{store.location}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
