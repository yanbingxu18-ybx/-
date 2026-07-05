import { useState } from 'react';
import { Calendar, Download, Package, Warehouse, Users } from 'lucide-react';

export function ReportsPage() {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-06-30');

  const reportData = [
    { label: '入库总量', value: '12,580', unit: '件', icon: Package, color: 'bg-blue-500' },
    { label: '出库总量', value: '11,230', unit: '件', icon: Package, color: 'bg-green-500' },
    { label: '库存总量', value: '5,680', unit: '件', icon: Warehouse, color: 'bg-purple-500' },
    { label: '活跃客户', value: '256', unit: '家', icon: Users, color: 'bg-orange-500' },
  ];

  const monthlyData = [
    { month: '1月', inbound: 2000, outbound: 1800 },
    { month: '2月', inbound: 1800, outbound: 1900 },
    { month: '3月', inbound: 2500, outbound: 2200 },
    { month: '4月', inbound: 2200, outbound: 2100 },
    { month: '5月', inbound: 2300, outbound: 2100 },
    { month: '6月', inbound: 1780, outbound: 1130 },
  ];

  const maxValue = Math.max(...monthlyData.flatMap((d) => [d.inbound, d.outbound]));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <span className="text-slate-500">至</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            查询
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
          <Download className="w-4 h-4" />
          导出报表
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {reportData.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
              <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{item.value}</p>
              <p className="text-sm text-slate-500">{item.label} ({item.unit})</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">出入库趋势</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-600">入库</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-slate-600">出库</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-end justify-between h-48 gap-4">
              {monthlyData.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 items-end h-40">
                    <div
                      className="flex-1 bg-blue-500 rounded-t transition-all"
                      style={{ height: `${(item.inbound / maxValue) * 100}%` }}
                    ></div>
                    <div
                      className="flex-1 bg-green-500 rounded-t transition-all"
                      style={{ height: `${(item.outbound / maxValue) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-slate-600">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">仓库库存统计</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: '北京冷冻仓库', total: 1200, percent: 80, color: 'bg-blue-500' },
                { name: '上海冷藏仓库', total: 800, percent: 60, color: 'bg-green-500' },
                { name: '广州常温仓库', total: 1500, percent: 90, color: 'bg-slate-500' },
                { name: '深圳冷冻仓库', total: 900, percent: 70, color: 'bg-blue-500' },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="text-slate-800 font-medium">{item.total} 件 ({item.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">库存预警</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">货物名称</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">规格</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">库存数量</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">保质期</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">预警天数</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: '蒙牛纯牛奶', spec: '250ml*12盒', stock: 500, shelfLife: 180, alertDays: 150, status: '即将到期' },
                { name: '伊利酸奶', spec: '100g*8杯', stock: 200, shelfLife: 21, alertDays: 10, status: '紧急' },
                { name: '康师傅方便面', spec: '5连包', stock: 800, shelfLife: 180, alertDays: 120, status: '正常' },
              ].map((item) => (
                <tr key={item.name} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.spec}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.stock}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.shelfLife}天</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.alertDays}天</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === '紧急' ? 'bg-red-100 text-red-700' :
                      item.status === '即将到期' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
