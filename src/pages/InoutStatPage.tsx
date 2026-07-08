import { useState, useMemo } from 'react';
import { Download, Settings } from 'lucide-react';
import { mockOutboundOrders, mockInboundOrders, mockCustomers, mockStores } from '../mock/data';

type TabType = 'outbound' | 'inbound';

interface OutboundStatItem {
  customerName: string;
  storeName: string;
  orderNo: string;
  outboundType: string;
  actualDate: string;
  goodsCode: string;
  goodsName: string;
  spec: string;
  actualQuantity: number;
  actualUnit: string;
  productionDate: string;
  expiryDate: string;
  isGoodQuality: boolean;
}

interface InboundStatItem {
  customerName: string;
  storeName: string;
  orderNo: string;
  inboundType: string;
  actualDate: string;
  goodsCode: string;
  goodsName: string;
  spec: string;
  actualQuantity: number;
  actualUnit: string;
  productionDate: string;
  expiryDate: string;
  isGoodQuality: boolean;
}

interface QueryParams {
  orderNo: string;
  createTimeStart: string;
  createTimeEnd: string;
  customerId: string;
  storeId: string;
  goodsKeyword: string;
  isGoodQuality: '' | 'true' | 'false';
  productionDateStart: string;
  productionDateEnd: string;
}

export function InoutStatPage() {
  const [activeTab, setActiveTab] = useState<TabType>('outbound');
  const [outboundQuery, setOutboundQuery] = useState<QueryParams>({
    orderNo: '',
    createTimeStart: '',
    createTimeEnd: '',
    customerId: '',
    storeId: '',
    goodsKeyword: '',
    isGoodQuality: '',
    productionDateStart: '',
    productionDateEnd: '',
  });
  const [inboundQuery, setInboundQuery] = useState<QueryParams>({
    orderNo: '',
    createTimeStart: '',
    createTimeEnd: '',
    customerId: '',
    storeId: '',
    goodsKeyword: '',
    isGoodQuality: '',
    productionDateStart: '',
    productionDateEnd: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const currentQuery = activeTab === 'outbound' ? outboundQuery : inboundQuery;
  const setCurrentQuery = activeTab === 'outbound' ? setOutboundQuery : setInboundQuery;

  const outboundStatData = useMemo((): OutboundStatItem[] => {
    const data: OutboundStatItem[] = [];
    mockOutboundOrders
      .filter(order => order.status === '已出库')
      .forEach(order => {
        order.items.forEach(item => {
          data.push({
            customerName: order.customerName,
            storeName: order.storeName,
            orderNo: order.orderNo,
            outboundType: order.planId ? '销售出库' : '销售出库',
            actualDate: order.actualDate,
            goodsCode: item.goodsCode,
            goodsName: item.goodsName,
            spec: item.spec,
            actualQuantity: item.actualQuantity,
            actualUnit: item.actualUnit,
            productionDate: item.productionDate,
            expiryDate: item.expiryDate,
            isGoodQuality: item.isGoodQuality,
          });
        });
      });
    return data;
  }, []);

  const inboundStatData = useMemo((): InboundStatItem[] => {
    const data: InboundStatItem[] = [];
    mockInboundOrders
      .filter(order => order.status === '已生效')
      .forEach(order => {
        order.items.forEach(item => {
          data.push({
            customerName: order.customerName,
            storeName: order.storeName,
            orderNo: order.orderNo,
            inboundType: order.inboundType,
            actualDate: order.actualDate,
            goodsCode: item.goodsCode,
            goodsName: item.goodsName,
            spec: item.spec,
            actualQuantity: item.actualQuantity,
            actualUnit: item.actualUnit,
            productionDate: item.productionDate,
            expiryDate: item.expiryDate,
            isGoodQuality: item.isGoodQuality,
          });
        });
      });
    return data;
  }, []);

  const filteredOutboundData = useMemo(() => {
    return outboundStatData.filter(item => {
      if (currentQuery.orderNo && !item.orderNo.includes(currentQuery.orderNo)) return false;
      if (currentQuery.customerId && !item.customerName.includes(mockCustomers.find(c => c.id === currentQuery.customerId)?.name || '')) return false;
      if (currentQuery.storeId && !item.storeName.includes(mockStores.find(s => s.id === currentQuery.storeId)?.name || '')) return false;
      if (currentQuery.goodsKeyword && !item.goodsCode.includes(currentQuery.goodsKeyword) && !item.goodsName.includes(currentQuery.goodsKeyword)) return false;
      if (currentQuery.isGoodQuality !== '' && String(item.isGoodQuality) !== currentQuery.isGoodQuality) return false;
      if (currentQuery.productionDateStart && item.productionDate < currentQuery.productionDateStart) return false;
      if (currentQuery.productionDateEnd && item.productionDate > currentQuery.productionDateEnd) return false;
      return true;
    });
  }, [outboundStatData, currentQuery]);

  const filteredInboundData = useMemo(() => {
    return inboundStatData.filter(item => {
      if (currentQuery.orderNo && !item.orderNo.includes(currentQuery.orderNo)) return false;
      if (currentQuery.customerId && !item.customerName.includes(mockCustomers.find(c => c.id === currentQuery.customerId)?.name || '')) return false;
      if (currentQuery.storeId && !item.storeName.includes(mockStores.find(s => s.id === currentQuery.storeId)?.name || '')) return false;
      if (currentQuery.goodsKeyword && !item.goodsCode.includes(currentQuery.goodsKeyword) && !item.goodsName.includes(currentQuery.goodsKeyword)) return false;
      if (currentQuery.isGoodQuality !== '' && String(item.isGoodQuality) !== currentQuery.isGoodQuality) return false;
      if (currentQuery.productionDateStart && item.productionDate < currentQuery.productionDateStart) return false;
      if (currentQuery.productionDateEnd && item.productionDate > currentQuery.productionDateEnd) return false;
      return true;
    });
  }, [inboundStatData, currentQuery]);

  const currentData = activeTab === 'outbound' ? filteredOutboundData : filteredInboundData;
  const totalPages = Math.ceil(currentData.length / pageSize);
  const paginatedData = currentData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleQuery = () => {
    setCurrentPage(1);
  };

  const handleReset = () => {
    setCurrentQuery({
      orderNo: '',
      createTimeStart: '',
      createTimeEnd: '',
      customerId: '',
      storeId: '',
      goodsKeyword: '',
      isGoodQuality: '',
      productionDateStart: '',
      productionDateEnd: '',
    });
    setCurrentPage(1);
  };

  const handleExport = () => {
    alert(`导出${activeTab === 'outbound' ? '出库' : '入库'}统计数据成功，共${currentData.length}条记录`);
  };

  const handleColumnSettings = () => {
    alert('表格列设置功能');
  };

  const handleInputChange = (field: keyof QueryParams, value: string) => {
    setCurrentQuery(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('outbound')}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'outbound' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            出库统计
            {activeTab === 'outbound' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('inbound')}
            className={`px-6 py-3 text-sm font-medium transition-colors relative ${
              activeTab === 'inbound' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            入库统计
            {activeTab === 'inbound' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {activeTab === 'outbound' ? '出库单号' : '入库单号'}
            </label>
            <input
              type="text"
              value={currentQuery.orderNo}
              onChange={(e) => handleInputChange('orderNo', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={`请输入${activeTab === 'outbound' ? '出库' : '入库'}单号`}
            />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">创建时间范围</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={currentQuery.createTimeStart}
                onChange={(e) => handleInputChange('createTimeStart', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="flex items-center text-slate-400">至</span>
              <input
                type="date"
                value={currentQuery.createTimeEnd}
                onChange={(e) => handleInputChange('createTimeEnd', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">客户</label>
            <select
              value={currentQuery.customerId}
              onChange={(e) => handleInputChange('customerId', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">请选择客户</option>
              {mockCustomers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {activeTab === 'outbound' ? '出库仓库' : '入库仓库'}
            </label>
            <select
              value={currentQuery.storeId}
              onChange={(e) => handleInputChange('storeId', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">请选择仓库</option>
              {mockStores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">货物</label>
            <input
              type="text"
              value={currentQuery.goodsKeyword}
              onChange={(e) => handleInputChange('goodsKeyword', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="请输入商品编码或名称"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">是否良品</label>
            <select
              value={currentQuery.isGoodQuality}
              onChange={(e) => handleInputChange('isGoodQuality', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">全部</option>
              <option value="true">是</option>
              <option value="false">否</option>
            </select>
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">生产日期范围</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={currentQuery.productionDateStart}
                onChange={(e) => handleInputChange('productionDateStart', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="flex items-center text-slate-400">至</span>
              <input
                type="date"
                value={currentQuery.productionDateEnd}
                onChange={(e) => handleInputChange('productionDateEnd', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="col-span-3 flex items-end gap-2">
            <button
              onClick={handleQuery}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              查询
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-300 transition-colors"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <span className="text-sm font-medium text-slate-700">
            共 {currentData.length} 条记录
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              导出
            </button>
            <button
              onClick={handleColumnSettings}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              表格列设置
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {activeTab === 'outbound' ? (
                  <>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">客户名称</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">仓库</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">出库单号</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">出库类型</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">实际出库日期</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">商品编码</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">商品名称</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">规格型号</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">实际出库数量</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">实际出库数量单位</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">生产日期</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">有效期至</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">是否良品</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">客户名称</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">仓库</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">入库单号</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">入库类型</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">实际入库日期</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">商品编码</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">商品名称</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">规格型号</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">实际入库数量</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">实际入库数量单位</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">生产日期</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">有效期至</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">是否良品</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    {activeTab === 'outbound' ? (
                      <>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as OutboundStatItem).customerName}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as OutboundStatItem).storeName}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as OutboundStatItem).orderNo}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as OutboundStatItem).outboundType}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as OutboundStatItem).actualDate || '-'}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as OutboundStatItem).goodsCode}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as OutboundStatItem).goodsName}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as OutboundStatItem).spec}</td>
                        <td className="px-4 py-2 text-sm text-right text-slate-700">{(item as OutboundStatItem).actualQuantity}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as OutboundStatItem).actualUnit}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as OutboundStatItem).productionDate || '-'}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as OutboundStatItem).expiryDate || '-'}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as OutboundStatItem).isGoodQuality ? '是' : '否'}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as InboundStatItem).customerName}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as InboundStatItem).storeName}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as InboundStatItem).orderNo}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as InboundStatItem).inboundType}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as InboundStatItem).actualDate || '-'}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as InboundStatItem).goodsCode}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as InboundStatItem).goodsName}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as InboundStatItem).spec}</td>
                        <td className="px-4 py-2 text-sm text-right text-slate-700">{(item as InboundStatItem).actualQuantity}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as InboundStatItem).actualUnit}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as InboundStatItem).productionDate || '-'}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as InboundStatItem).expiryDate || '-'}</td>
                        <td className="px-4 py-2 text-sm text-slate-700">{(item as InboundStatItem).isGoodQuality ? '是' : '否'}</td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-slate-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
          <span className="text-sm text-slate-600">
            显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, currentData.length)} 条，共 {currentData.length} 条
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm rounded-lg ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}