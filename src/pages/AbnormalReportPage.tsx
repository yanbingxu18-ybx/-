import { useState, useMemo } from 'react';
import { Check, X, Settings } from 'lucide-react';
import { mockAbnormalReports, mockCustomers, mockStores } from '../mock/data';
import { AbnormalReport } from '../types';

type TabType = 'outbound' | 'inbound';

interface QueryParams {
  orderNo: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  customerId: string;
  storeId: string;
  goods: string;
  auditStatus: '' | 'pending' | 'approved' | 'rejected';
}

const auditStatusOptions = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'approved', label: '通过' },
  { value: 'rejected', label: '不通过' },
];

const outboundColumns = [
  { key: 'customerName', label: '客户' },
  { key: 'storeName', label: '仓库' },
  { key: 'orderNo', label: '出库单号' },
  { key: 'orderTime', label: '出库时间' },
  { key: 'goodsCode', label: '商品编码' },
  { key: 'goodsName', label: '商品名称' },
  { key: 'spec', label: '规格型号' },
  { key: 'plannedQuantity', label: '计划出库数量' },
  { key: 'actualQuantity', label: '实际出库数量' },
  { key: 'unit', label: '单位' },
  { key: 'auditStatus', label: '审核结果' },
  { key: 'auditRemark', label: '审核备注' },
  { key: 'actions', label: '操作' },
];

const inboundColumns = [
  { key: 'customerName', label: '客户' },
  { key: 'storeName', label: '仓库' },
  { key: 'orderNo', label: '入库单号' },
  { key: 'orderTime', label: '入库时间' },
  { key: 'goodsCode', label: '商品编码' },
  { key: 'goodsName', label: '商品名称' },
  { key: 'spec', label: '规格型号' },
  { key: 'plannedQuantity', label: '计划入库数量' },
  { key: 'actualQuantity', label: '实际入库数量' },
  { key: 'unit', label: '单位' },
  { key: 'auditStatus', label: '审核结果' },
  { key: 'auditRemark', label: '审核备注' },
  { key: 'actions', label: '操作' },
];

export function AbnormalReportPage() {
  const [activeTab, setActiveTab] = useState<TabType>('outbound');
  const [queryParams, setQueryParams] = useState<QueryParams>({
    orderNo: '',
    dateRangeStart: '',
    dateRangeEnd: '',
    customerId: '',
    storeId: '',
    goods: '',
    auditStatus: '',
  });

  const [records, setRecords] = useState<AbnormalReport[]>(mockAbnormalReports);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    activeTab === 'outbound' 
      ? outboundColumns.map(col => col.key)
      : inboundColumns.map(col => col.key)
  );
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditRecord, setAuditRecord] = useState<AbnormalReport | null>(null);
  const [auditAction, setAuditAction] = useState<'approve' | 'reject' | null>(null);
  const [auditRemark, setAuditRemark] = useState('');
  const [auditError, setAuditError] = useState('');
  const [currentRole] = useState<'manager' | 'warehouse'>('manager');

  const columns = activeTab === 'outbound' ? outboundColumns : inboundColumns;

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (record.orderType !== activeTab) return false;
      if (queryParams.orderNo && !record.orderNo.includes(queryParams.orderNo)) return false;
      if (queryParams.dateRangeStart && record.orderTime < queryParams.dateRangeStart) return false;
      if (queryParams.dateRangeEnd && record.orderTime > queryParams.dateRangeEnd) return false;
      if (queryParams.customerId && record.customerId !== queryParams.customerId) return false;
      if (queryParams.storeId && record.storeId !== queryParams.storeId) return false;
      if (queryParams.goods && !record.goodsCode.includes(queryParams.goods) && !record.goodsName.includes(queryParams.goods)) return false;
      if (queryParams.auditStatus && record.auditStatus !== queryParams.auditStatus) return false;
      return true;
    });
  }, [records, queryParams, activeTab]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleQuery = () => {
    setCurrentPage(1);
  };

  const handleReset = () => {
    setQueryParams({
      orderNo: '',
      dateRangeStart: '',
      dateRangeEnd: '',
      customerId: '',
      storeId: '',
      goods: '',
      auditStatus: '',
    });
    setCurrentPage(1);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setVisibleColumns(tab === 'outbound' 
      ? outboundColumns.map(col => col.key)
      : inboundColumns.map(col => col.key)
    );
    setCurrentPage(1);
    setShowColumnSettings(false);
  };

  const handleColumnToggle = (column: string) => {
    setVisibleColumns(prev =>
      prev.includes(column) ? prev.filter(c => c !== column) : [...prev, column]
    );
  };

  const handleAudit = (record: AbnormalReport, action: 'approve' | 'reject') => {
    setAuditRecord(record);
    setAuditAction(action);
    setAuditRemark('');
    setAuditError('');
    setShowAuditModal(true);
  };

  const handleAuditConfirm = () => {
    if (!auditRecord || !auditAction) return;

    if (auditAction === 'reject' && !auditRemark.trim()) {
      setAuditError('请填写不通过原因');
      return;
    }

    setRecords(prev => prev.map(r => {
      if (r.id === auditRecord.id) {
        return {
          ...r,
          auditStatus: auditAction === 'approve' ? 'approved' : 'rejected',
          auditRemark: auditRemark,
        };
      }
      return r;
    }));

    setShowAuditModal(false);
    setAuditRecord(null);
    setAuditAction(null);
    setAuditRemark('');
    setAuditError('');
  };

  const handleAuditCancel = () => {
    setShowAuditModal(false);
    setAuditRecord(null);
    setAuditAction(null);
    setAuditRemark('');
    setAuditError('');
  };

  const getAuditStatusText = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending': return '待审核';
      case 'approved': return '通过';
      case 'rejected': return '不通过';
    }
  };

  const getAuditStatusClass = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
    }
  };

  const orderTypeText = activeTab === 'outbound' ? '出库' : '入库';

  return (
    <div className="p-6">
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => handleTabChange('outbound')}
          className={`px-6 py-3 text-lg font-medium transition-colors border-b-2 ${
            activeTab === 'outbound'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          出库异常上报
        </button>
        <button
          onClick={() => handleTabChange('inbound')}
          className={`px-6 py-3 text-lg font-medium transition-colors border-b-2 ${
            activeTab === 'inbound'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          入库异常上报
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">查询条件</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{orderTypeText}单号</label>
            <input
              type="text"
              value={queryParams.orderNo}
              onChange={e => setQueryParams({ ...queryParams, orderNo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`请输入${orderTypeText}单号`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{orderTypeText}时间范围</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={queryParams.dateRangeStart}
                onChange={e => setQueryParams({ ...queryParams, dateRangeStart: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="flex items-center text-gray-400">至</span>
              <input
                type="date"
                value={queryParams.dateRangeEnd}
                onChange={e => setQueryParams({ ...queryParams, dateRangeEnd: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">客户</label>
            <select
              value={queryParams.customerId}
              onChange={e => setQueryParams({ ...queryParams, customerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              {mockCustomers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">仓库</label>
            <select
              value={queryParams.storeId}
              onChange={e => setQueryParams({ ...queryParams, storeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              {mockStores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">商品</label>
            <input
              type="text"
              value={queryParams.goods}
              onChange={e => setQueryParams({ ...queryParams, goods: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="商品编码或名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">审核结果</label>
            <select
              value={queryParams.auditStatus}
              onChange={e => setQueryParams({ ...queryParams, auditStatus: e.target.value as '' | 'pending' | 'approved' | 'rejected' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {auditStatusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleQuery}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              查询
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{orderTypeText}异常上报列表</h2>
          <button
            onClick={() => setShowColumnSettings(!showColumnSettings)}
            className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:text-blue-500 transition-colors"
          >
            <Settings size={18} />
            列设置
          </button>
        </div>

        {showColumnSettings && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {columns.map(col => (
                <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.key)}
                    onChange={() => handleColumnToggle(col.key)}
                    className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{col.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {columns.filter(col => visibleColumns.includes(col.key)).map(col => (
                  <th key={col.key} className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map(record => (
                <tr key={record.id} className="hover:bg-gray-50">
                  {visibleColumns.includes('customerName') && (
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{record.customerName}</td>
                  )}
                  {visibleColumns.includes('storeName') && (
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{record.storeName}</td>
                  )}
                  {visibleColumns.includes('orderNo') && (
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{record.orderNo}</td>
                  )}
                  {visibleColumns.includes('orderTime') && (
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{record.orderTime}</td>
                  )}
                  {visibleColumns.includes('goodsCode') && (
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{record.goodsCode}</td>
                  )}
                  {visibleColumns.includes('goodsName') && (
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{record.goodsName}</td>
                  )}
                  {visibleColumns.includes('spec') && (
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{record.spec}</td>
                  )}
                  {visibleColumns.includes('plannedQuantity') && (
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{record.plannedQuantity}</td>
                  )}
                  {visibleColumns.includes('actualQuantity') && (
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{record.actualQuantity}</td>
                  )}
                  {visibleColumns.includes('unit') && (
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{record.unit}</td>
                  )}
                  {visibleColumns.includes('auditStatus') && (
                    <td className="px-4 py-2 border-b">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAuditStatusClass(record.auditStatus)}`}>
                        {getAuditStatusText(record.auditStatus)}
                      </span>
                    </td>
                  )}
                  {visibleColumns.includes('auditRemark') && (
                    <td className="px-4 py-2 text-sm text-gray-900 border-b">{record.auditRemark || '-'}</td>
                  )}
                  {visibleColumns.includes('actions') && (
                    <td className="px-4 py-2 border-b">
                      {currentRole === 'manager' && record.auditStatus === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAudit(record, 'approve')}
                            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                          >
                            <Check size={14} />
                            通过
                          </button>
                          <button
                            onClick={() => handleAudit(record, 'reject')}
                            className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                          >
                            <X size={14} />
                            不通过
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-600">共 {filteredRecords.length} 条记录</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span className="text-sm text-gray-600">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      {showAuditModal && auditRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {auditAction === 'approve' ? '审核通过' : '审核不通过'}
            </h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{orderTypeText}单号</label>
                <span className="text-sm text-gray-900">{auditRecord.orderNo}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">商品</label>
                <span className="text-sm text-gray-900">{auditRecord.goodsName} ({auditRecord.goodsCode})</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">计划{orderTypeText}数量</label>
                <span className="text-sm text-gray-900">{auditRecord.plannedQuantity} {auditRecord.unit}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">实际{orderTypeText}数量</label>
                <span className="text-sm text-gray-900">{auditRecord.actualQuantity} {auditRecord.unit}</span>
              </div>
              {auditAction === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">不通过原因 <span className="text-red-500">*</span></label>
                  <textarea
                    value={auditRemark}
                    onChange={e => {
                      setAuditRemark(e.target.value);
                      setAuditError('');
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${auditError ? 'border-red-500' : 'border-gray-300'}`}
                    rows={3}
                    placeholder="请填写不通过原因"
                  />
                  {auditError && (
                    <p className="text-red-500 text-sm mt-1">{auditError}</p>
                  )}
                </div>
              )}
              {auditAction === 'approve' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">审核备注（选填）</label>
                  <textarea
                    value={auditRemark}
                    onChange={e => setAuditRemark(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="请填写审核备注（选填）"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleAuditCancel}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAuditConfirm}
                className={`px-4 py-2 text-white rounded-md transition-colors ${
                  auditAction === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                确认{auditAction === 'approve' ? '通过' : '不通过'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}