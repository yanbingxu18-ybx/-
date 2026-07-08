import { useState, useMemo } from 'react';
import { Plus, Eye, Settings, X } from 'lucide-react';
import { mockAbnormalSignRecords, mockCustomers, mockStores, mockGoods } from '../mock/data';
import { AbnormalSignRecord } from '../types';

interface QueryParams {
  customerId: string;
  storeId: string;
  orderNo: string;
  goodsKeyword: string;
  registerTimeStart: string;
  registerTimeEnd: string;
}

interface NewRecordForm {
  customerId: string;
  customerName: string;
  storeId: string;
  storeName: string;
  orderNo: string;
  goodsCode: string;
  goodsName: string;
  spec: string;
  outboundQuantity: number;
  signedQuantity: number;
  unit: string;
  reason: string;
}

export function AbnormalSignPage() {
  const [records, setRecords] = useState<AbnormalSignRecord[]>(mockAbnormalSignRecords);
  const [queryParams, setQueryParams] = useState<QueryParams>({
    customerId: '',
    storeId: '',
    orderNo: '',
    goodsKeyword: '',
    registerTimeStart: '',
    registerTimeEnd: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRecord, setDetailRecord] = useState<AbnormalSignRecord | null>(null);
  const [formData, setFormData] = useState<NewRecordForm>({
    customerId: '',
    customerName: '',
    storeId: '',
    storeName: '',
    orderNo: '',
    goodsCode: '',
    goodsName: '',
    spec: '',
    outboundQuantity: 0,
    signedQuantity: 0,
    unit: '',
    reason: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (queryParams.customerId && record.customerId !== queryParams.customerId) return false;
      if (queryParams.storeId && record.storeId !== queryParams.storeId) return false;
      if (queryParams.orderNo && !record.orderNo.includes(queryParams.orderNo)) return false;
      if (queryParams.goodsKeyword && !record.goodsCode.includes(queryParams.goodsKeyword) && !record.goodsName.includes(queryParams.goodsKeyword)) return false;
      if (queryParams.registerTimeStart && record.registeredAt < queryParams.registerTimeStart) return false;
      if (queryParams.registerTimeEnd && record.registeredAt > queryParams.registerTimeEnd) return false;
      return true;
    });
  }, [records, queryParams]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleQuery = () => {
    setCurrentPage(1);
  };

  const handleReset = () => {
    setQueryParams({
      customerId: '',
      storeId: '',
      orderNo: '',
      goodsKeyword: '',
      registerTimeStart: '',
      registerTimeEnd: '',
    });
    setCurrentPage(1);
  };

  const handleOpenNewModal = () => {
    setFormData({
      customerId: '',
      customerName: '',
      storeId: '',
      storeName: '',
      orderNo: '',
      goodsCode: '',
      goodsName: '',
      spec: '',
      outboundQuantity: 0,
      signedQuantity: 0,
      unit: '',
      reason: '',
    });
    setErrors({});
    setShowNewModal(true);
  };

  const handleCloseNewModal = () => {
    setShowNewModal(false);
  };

  const handleOpenDetailModal = (record: AbnormalSignRecord) => {
    setDetailRecord(record);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setDetailRecord(null);
  };

  const handleInputChange = (field: keyof NewRecordForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = mockCustomers.find(c => c.id === customerId);
    setFormData(prev => ({
      ...prev,
      customerId,
      customerName: customer?.name || '',
    }));
  };

  const handleStoreChange = (storeId: string) => {
    const store = mockStores.find(s => s.id === storeId);
    setFormData(prev => ({
      ...prev,
      storeId,
      storeName: store?.name || '',
    }));
  };

  const handleGoodsChange = (goodsCode: string) => {
    const goods = mockGoods.find(g => g.code === goodsCode);
    setFormData(prev => ({
      ...prev,
      goodsCode,
      goodsName: goods?.name || '',
      spec: goods?.spec || '',
      unit: goods?.unit || '',
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = '客户名称必填';
    if (!formData.storeId) newErrors.storeId = '仓库必填';
    if (!formData.orderNo) newErrors.orderNo = '出库单号必填';
    if (!formData.goodsCode) newErrors.goodsCode = '商品编码必填';
    if (!formData.goodsName) newErrors.goodsName = '商品名称必填';
    if (formData.outboundQuantity < 0) newErrors.outboundQuantity = '出库数量不能为负数';
    if (formData.signedQuantity < 0) newErrors.signedQuantity = '回单数量/签收数量不能为负数';
    if (!formData.unit) newErrors.unit = '数量单位必填';
    if (!formData.reason.trim()) newErrors.reason = '异常原因必填';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (formData.outboundQuantity === formData.signedQuantity) {
      if (!confirm('出库数量与回单数量/签收数量一致，请确认是否仍需登记异常签收记录。')) {
        return;
      }
    }

    const newRecord: AbnormalSignRecord = {
      id: String(Date.now()),
      customerId: formData.customerId,
      customerName: formData.customerName,
      storeId: formData.storeId,
      storeName: formData.storeName,
      orderNo: formData.orderNo,
      goodsCode: formData.goodsCode,
      goodsName: formData.goodsName,
      spec: formData.spec,
      outboundQuantity: formData.outboundQuantity,
      signedQuantity: formData.signedQuantity,
      unit: formData.unit,
      reason: formData.reason,
      registeredBy: '管理员',
      registeredAt: new Date().toISOString().split('T')[0],
    };

    setRecords(prev => [newRecord, ...prev]);
    setShowNewModal(false);
    setCurrentPage(1);
  };

  const handleColumnSettings = () => {
    alert('表格列设置功能');
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">客户名称</label>
            <select
              value={queryParams.customerId}
              onChange={(e) => setQueryParams(prev => ({ ...prev, customerId: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">请选择客户</option>
              {mockCustomers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">仓库</label>
            <select
              value={queryParams.storeId}
              onChange={(e) => setQueryParams(prev => ({ ...prev, storeId: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">请选择仓库</option>
              {mockStores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">出库单号</label>
            <input
              type="text"
              value={queryParams.orderNo}
              onChange={(e) => setQueryParams(prev => ({ ...prev, orderNo: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="请输入出库单号"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">商品</label>
            <input
              type="text"
              value={queryParams.goodsKeyword}
              onChange={(e) => setQueryParams(prev => ({ ...prev, goodsKeyword: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="请输入商品编码或名称"
            />
          </div>
          <div className="col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">登记时间范围</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={queryParams.registerTimeStart}
                onChange={(e) => setQueryParams(prev => ({ ...prev, registerTimeStart: e.target.value }))}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="flex items-center text-slate-400">至</span>
              <input
                type="date"
                value={queryParams.registerTimeEnd}
                onChange={(e) => setQueryParams(prev => ({ ...prev, registerTimeEnd: e.target.value }))}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="col-span-9 flex items-end justify-end gap-2">
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
            共 {filteredRecords.length} 条记录
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleOpenNewModal}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新增
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
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">客户名称</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">仓库</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">出库单号</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">商品编码</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">商品名称</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">规格型号</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">出库数量</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">回单数量/签收数量</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">数量单位</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">异常原因</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">登记人</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">登记时间</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-sm text-slate-700">{record.customerName}</td>
                    <td className="px-4 py-2 text-sm text-slate-700">{record.storeName}</td>
                    <td className="px-4 py-2 text-sm text-slate-700">{record.orderNo}</td>
                    <td className="px-4 py-2 text-sm text-slate-700">{record.goodsCode}</td>
                    <td className="px-4 py-2 text-sm text-slate-700">{record.goodsName}</td>
                    <td className="px-4 py-2 text-sm text-slate-700">{record.spec || '-'}</td>
                    <td className="px-4 py-2 text-sm text-right text-slate-700">{record.outboundQuantity}</td>
                    <td className="px-4 py-2 text-sm text-right text-slate-700">{record.signedQuantity}</td>
                    <td className="px-4 py-2 text-sm text-slate-700">{record.unit}</td>
                    <td className="px-4 py-2 text-sm text-slate-700 max-w-xs truncate">{record.reason}</td>
                    <td className="px-4 py-2 text-sm text-slate-700">{record.registeredBy}</td>
                    <td className="px-4 py-2 text-sm text-slate-700">{record.registeredAt}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleOpenDetailModal(record)}
                        className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        查看
                      </button>
                    </td>
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
            显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, filteredRecords.length)} 条，共 {filteredRecords.length} 条
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

      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">新增异常签收记录</h2>
              <button onClick={handleCloseNewModal} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">客户名称 <span className="text-red-500">*</span></label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.customerId ? 'border-red-500' : 'border-slate-200'}`}
                  >
                    <option value="">请选择客户</option>
                    {mockCustomers.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                  {errors.customerId && <p className="text-xs text-red-500 mt-1">{errors.customerId}</p>}
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">仓库 <span className="text-red-500">*</span></label>
                  <select
                    value={formData.storeId}
                    onChange={(e) => handleStoreChange(e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.storeId ? 'border-red-500' : 'border-slate-200'}`}
                  >
                    <option value="">请选择仓库</option>
                    {mockStores.map(store => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                  {errors.storeId && <p className="text-xs text-red-500 mt-1">{errors.storeId}</p>}
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">出库单号 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.orderNo}
                    onChange={(e) => handleInputChange('orderNo', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.orderNo ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="请输入出库单号"
                  />
                  {errors.orderNo && <p className="text-xs text-red-500 mt-1">{errors.orderNo}</p>}
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">商品编码 <span className="text-red-500">*</span></label>
                  <select
                    value={formData.goodsCode}
                    onChange={(e) => handleGoodsChange(e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.goodsCode ? 'border-red-500' : 'border-slate-200'}`}
                  >
                    <option value="">请选择商品</option>
                    {mockGoods.map(goods => (
                      <option key={goods.id} value={goods.code}>{goods.code} - {goods.name}</option>
                    ))}
                  </select>
                  {errors.goodsCode && <p className="text-xs text-red-500 mt-1">{errors.goodsCode}</p>}
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">商品名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.goodsName}
                    onChange={(e) => handleInputChange('goodsName', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.goodsName ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="请输入商品名称"
                  />
                  {errors.goodsName && <p className="text-xs text-red-500 mt-1">{errors.goodsName}</p>}
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1">规格型号</label>
                  <input
                    type="text"
                    value={formData.spec}
                    onChange={(e) => handleInputChange('spec', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="请输入规格型号"
                  />
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">出库数量 <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={formData.outboundQuantity || ''}
                    onChange={(e) => handleInputChange('outboundQuantity', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.outboundQuantity ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="请输入出库数量"
                  />
                  {errors.outboundQuantity && <p className="text-xs text-red-500 mt-1">{errors.outboundQuantity}</p>}
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">回单数量/签收数量 <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={formData.signedQuantity || ''}
                    onChange={(e) => handleInputChange('signedQuantity', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.signedQuantity ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="请输入回单数量"
                  />
                  {errors.signedQuantity && <p className="text-xs text-red-500 mt-1">{errors.signedQuantity}</p>}
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">数量单位 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.unit ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="请输入数量单位"
                  />
                  {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit}</p>}
                </div>
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-slate-700 mb-1">异常原因 <span className="text-red-500">*</span></label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${errors.reason ? 'border-red-500' : 'border-slate-200'}`}
                    rows={4}
                    placeholder="请输入异常原因"
                  />
                  {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button onClick={handleCloseNewModal} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                取消
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && detailRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">异常签收详情</h2>
              <button onClick={handleCloseDetailModal} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">客户名称</label>
                  <p className="text-sm text-slate-800">{detailRecord.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">仓库</label>
                  <p className="text-sm text-slate-800">{detailRecord.storeName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">出库单号</label>
                  <p className="text-sm text-slate-800">{detailRecord.orderNo}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">商品编码</label>
                  <p className="text-sm text-slate-800">{detailRecord.goodsCode}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">商品名称</label>
                  <p className="text-sm text-slate-800">{detailRecord.goodsName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">规格型号</label>
                  <p className="text-sm text-slate-800">{detailRecord.spec || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">出库数量</label>
                  <p className="text-sm text-slate-800">{detailRecord.outboundQuantity}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">回单数量/签收数量</label>
                  <p className="text-sm text-slate-800">{detailRecord.signedQuantity}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">数量单位</label>
                  <p className="text-sm text-slate-800">{detailRecord.unit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">登记人</label>
                  <p className="text-sm text-slate-800">{detailRecord.registeredBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">登记时间</label>
                  <p className="text-sm text-slate-800">{detailRecord.registeredAt}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-500 mb-1">异常原因</label>
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">{detailRecord.reason}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200">
              <button onClick={handleCloseDetailModal} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}