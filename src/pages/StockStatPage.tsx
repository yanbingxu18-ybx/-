import { useState, useMemo } from 'react';
import { Search, RefreshCw, Download } from 'lucide-react';
import { mockStockStats, mockCustomers, mockGoods, mockStores } from '../mock/data';

export function StockStatPage() {
  const [searchParams, setSearchParams] = useState({
    customerId: '',
    storeId: '',
    goodsId: '',
    productionDateStart: '',
    productionDateEnd: '',
    isGoodQuality: '',
  });

  const filteredStats = useMemo(() => {
    return mockStockStats.filter(stat => {
      if (searchParams.customerId && stat.customerId !== searchParams.customerId) return false;
      if (searchParams.storeId && stat.storeId !== searchParams.storeId) return false;
      if (searchParams.goodsId && stat.goodsId !== searchParams.goodsId) return false;
      if (searchParams.isGoodQuality !== '' && stat.isGoodQuality !== (searchParams.isGoodQuality === 'true')) return false;
      if (searchParams.productionDateStart && stat.productionDate < searchParams.productionDateStart) return false;
      if (searchParams.productionDateEnd && stat.productionDate > searchParams.productionDateEnd) return false;
      return true;
    });
  }, [searchParams]);

  const handleSearch = () => {
  };

  const handleReset = () => {
    setSearchParams({
      customerId: '',
      storeId: '',
      goodsId: '',
      productionDateStart: '',
      productionDateEnd: '',
      isGoodQuality: '',
    });
  };

  const handleExport = () => {
    const headers = ['客户', '仓库名称', '货物编码', '货物名称', '规格型号', '库存数量', '库存单位', '是否良品', '生产日期', '有效期至', '货物效期'];
    const rows = filteredStats.map(stat => [
      stat.customerName,
      stat.storeName,
      stat.goodsCode,
      stat.goodsName,
      stat.spec,
      stat.stockQuantity,
      stat.stockUnit,
      stat.isGoodQuality ? '是' : '否',
      stat.productionDate || '-',
      stat.expiryDate || '-',
      stat.goodsShelfLife,
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `库存统计_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">库存统计</h2>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">客户</label>
            <select
              value={searchParams.customerId}
              onChange={(e) => setSearchParams(prev => ({ ...prev, customerId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择客户</option>
              {mockCustomers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">仓库</label>
            <select
              value={searchParams.storeId}
              onChange={(e) => setSearchParams(prev => ({ ...prev, storeId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择仓库</option>
              {mockStores.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">货物</label>
            <select
              value={searchParams.goodsId}
              onChange={(e) => setSearchParams(prev => ({ ...prev, goodsId: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择货物</option>
              {mockGoods.map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">是否良品</label>
            <select
              value={searchParams.isGoodQuality}
              onChange={(e) => setSearchParams(prev => ({ ...prev, isGoodQuality: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              <option value="true">是</option>
              <option value="false">否</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">生产日期范围</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={searchParams.productionDateStart}
                onChange={(e) => setSearchParams(prev => ({ ...prev, productionDateStart: e.target.value }))}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="flex items-center text-slate-400">至</span>
              <input
                type="date"
                value={searchParams.productionDateEnd}
                onChange={(e) => setSearchParams(prev => ({ ...prev, productionDateEnd: e.target.value }))}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            重置
          </button>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            查询
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">客户</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">仓库名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">货物编码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">货物名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">规格型号</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">库存数量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">库存单位</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">是否良品</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">生产日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">有效期至</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">货物效期</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStats.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-slate-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                filteredStats.map(stat => (
                  <tr key={stat.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">{stat.customerName}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{stat.storeName}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{stat.goodsCode}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{stat.goodsName}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{stat.spec}</td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${stat.stockQuantity === 0 ? 'text-slate-400' : 'text-slate-700'}`}>
                      {stat.stockQuantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{stat.stockUnit}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stat.isGoodQuality ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {stat.isGoodQuality ? '是' : '否'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{stat.productionDate || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{stat.expiryDate || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{stat.goodsShelfLife}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-t border-slate-100">
          <p className="text-sm text-slate-600">共 {filteredStats.length} 条记录</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              上一页
            </button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              1
            </button>
            <button className="px-3 py-1 text-sm text-slate-600 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}