import { useState, useEffect } from 'react';
import { Plus, Edit2, Eye, XCircle, FileText, Upload, Download, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import { InboundPlan, InboundPlanItem, Customer } from '../types';
import { mockInboundPlans, mockCustomers, mockGoods, mockStores } from '../mock/data';

export function InboundPlanPage() {
  const [plans, setPlans] = useState<InboundPlan[]>(mockInboundPlans);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showGenerateOrderModal, setShowGenerateOrderModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InboundPlan | null>(null);
  const [detailPlan, setDetailPlan] = useState<InboundPlan | null>(null);
  const [closePlan, setClosePlan] = useState<InboundPlan | null>(null);
  const [generateOrderPlan, setGenerateOrderPlan] = useState<InboundPlan | null>(null);
  const [closeReason, setCloseReason] = useState('');
  const [searchParams, setSearchParams] = useState({
    planNo: '',
    customerName: '',
    plannedDateStart: '',
    plannedDateEnd: '',
    inboundType: '',
    storeName: '',
    temperatureZone: '',
    status: '',
  });
  const [formData, setFormData] = useState({
    planNo: '',
    customerId: '',
    customerCode: '',
    customerName: '',
    plannedDate: '',
    inboundType: '正常入库' as '正常入库' | '退货入库' | '拒收入库',
    storeId: '',
    storeName: '',
    plateNumber: '',
    temperatureZone: '冷藏' as '冷藏' | '常温' | '冷冻' | '混装',
  });
  const [items, setItems] = useState<InboundPlanItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);

  useEffect(() => {
    setCustomerOptions(mockCustomers.filter(c => c.customerType === '仓储型'));
  }, []);

  const filteredPlans = plans.filter(plan => {
    if (searchParams.planNo && !plan.planNo.includes(searchParams.planNo)) return false;
    if (searchParams.customerName && !plan.customerName.includes(searchParams.customerName)) return false;
    if (searchParams.plannedDateStart && plan.plannedDate < searchParams.plannedDateStart) return false;
    if (searchParams.plannedDateEnd && plan.plannedDate > searchParams.plannedDateEnd) return false;
    if (searchParams.inboundType && plan.inboundType !== searchParams.inboundType) return false;
    if (searchParams.storeName && !plan.storeName.includes(searchParams.storeName)) return false;
    if (searchParams.temperatureZone && plan.temperatureZone !== searchParams.temperatureZone) return false;
    if (searchParams.status && plan.status !== searchParams.status) return false;
    return true;
  });

  const generatePlanNo = (customerCode: string) => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const existingToday = plans.filter(p => p.planNo.includes(dateStr) && p.planNo.includes(customerCode));
    const seq = String(existingToday.length + 1).padStart(4, '0');
    return `RKJH${customerCode}${dateStr}${seq}`;
  };

  const calculateExpiryDate = (productionDate: string, shelfLifeDays: number) => {
    if (!productionDate || shelfLifeDays <= 0) return '';
    const date = new Date(productionDate);
    date.setDate(date.getDate() + shelfLifeDays);
    return date.toISOString().slice(0, 10);
  };

  const resetForm = () => {
    setFormData({
      planNo: '',
      customerId: '',
      customerCode: '',
      customerName: '',
      plannedDate: '',
      inboundType: '正常入库',
      storeId: '',
      storeName: '',
      plateNumber: '',
      temperatureZone: '冷藏',
    });
    setItems([]);
    setErrors({});
    setEditingPlan(null);
  };

  const handleAddPlan = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (plan: InboundPlan) => {
    if (plan.status !== '待入库') return;
    setEditingPlan(plan);
    setFormData({
      planNo: plan.planNo,
      customerId: plan.customerId,
      customerCode: plan.customerCode,
      customerName: plan.customerName,
      plannedDate: plan.plannedDate,
      inboundType: plan.inboundType,
      storeId: plan.storeId,
      storeName: plan.storeName,
      plateNumber: plan.plateNumber,
      temperatureZone: plan.temperatureZone,
    });
    setItems([...plan.items]);
    setShowModal(true);
  };

  const handleView = (plan: InboundPlan) => {
    setDetailPlan(plan);
    setShowDetailModal(true);
  };

  const handleClose = (plan: InboundPlan) => {
    if (plan.status !== '待入库') return;
    setClosePlan(plan);
    setCloseReason('');
    setShowCloseModal(true);
  };

  const handleGenerateOrder = (plan: InboundPlan) => {
    if (plan.status !== '待入库') return;
    setGenerateOrderPlan(plan);
    setShowGenerateOrderModal(true);
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = mockCustomers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId,
        customerCode: customer.code,
        customerName: customer.name,
        planNo: generatePlanNo(customer.code),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        customerId: '',
        customerCode: '',
        customerName: '',
        planNo: '',
      }));
    }
  };

  const handleStoreChange = (storeId: string) => {
    const store = mockStores.find(s => s.id === storeId);
    if (store) {
      setFormData(prev => ({
        ...prev,
        storeId,
        storeName: store.name,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        storeId: '',
        storeName: '',
      }));
    }
  };

  const addItem = () => {
    setItems([...items, {
      id: String(Date.now()),
      planId: editingPlan?.id || '',
      goodsId: '',
      goodsCode: '',
      goodsName: '',
      spec: '',
      plannedQuantity: 0,
      plannedUnit: '',
      productionDate: '',
      expiryDate: '',
      remark: '',
    }]);
  };

  const updateItem = (index: number, field: keyof InboundPlanItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'goodsId' && typeof value === 'string') {
      const goods = mockGoods.find(g => g.id === value);
      if (goods) {
        updated[index] = {
          ...updated[index],
          goodsCode: goods.code,
          goodsName: goods.name,
          spec: goods.spec,
          plannedUnit: goods.unit,
        };
      }
    }
    
    if (field === 'productionDate' && typeof value === 'string') {
      const goods = mockGoods.find(g => g.id === updated[index].goodsId);
      if (goods) {
        updated[index] = {
          ...updated[index],
          expiryDate: calculateExpiryDate(value, goods.shelfLifeDays),
        };
      }
    }
    
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerId) newErrors.customerId = '请选择客户';
    if (!formData.plannedDate) newErrors.plannedDate = '请选择计划到货日期';
    if (!formData.storeId) newErrors.storeId = '请选择仓库';
    if (!formData.inboundType) newErrors.inboundType = '请选择入库类型';
    if (!formData.temperatureZone) newErrors.temperatureZone = '请选择温层';
    
    items.forEach((item, index) => {
      if (!item.goodsId) newErrors[`itemGoods_${index}`] = `第${index + 1}行：请选择货物`;
      if (!item.plannedQuantity || item.plannedQuantity <= 0) newErrors[`itemQuantity_${index}`] = `第${index + 1}行：请输入计划入库数量`;
      if (!item.plannedUnit) newErrors[`itemUnit_${index}`] = `第${index + 1}行：请选择单位`;
      
      const goods = mockGoods.find(g => g.id === item.goodsId);
      if (goods && goods.shelfLifeDays > 0 && !item.productionDate) {
        newErrors[`itemDate_${index}`] = `第${index + 1}行：${goods.name}维护了保质期，生产日期必填`;
      }
    });
    
    if (items.length === 0) newErrors.items = '请至少添加一条明细';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    
    if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? {
        ...p,
        ...formData,
        items,
        updatedBy: '当前用户',
        updatedAt: now,
      } : p));
    } else {
      const newPlan: InboundPlan = {
        id: String(Date.now()),
        ...formData,
        status: '待入库',
        closeReason: '',
        closeBy: '',
        closeTime: '',
        createdBy: '当前用户',
        createdAt: now,
        updatedBy: '',
        updatedAt: '',
        items: items.map(item => ({ ...item, planId: String(Date.now()) })),
      };
      setPlans([newPlan, ...plans]);
    }
    
    setShowModal(false);
    resetForm();
  };

  const handleClosePlan = () => {
    if (!closeReason.trim()) {
      alert('请填写关单原因');
      return;
    }
    
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    setPlans(plans.map(p => p.id === closePlan?.id ? {
      ...p,
      status: '已关闭',
      closeReason,
      closeBy: '当前用户',
      closeTime: now,
      updatedBy: '当前用户',
      updatedAt: now,
    } : p));
    
    setShowCloseModal(false);
    setClosePlan(null);
    setCloseReason('');
  };

  const handleGenerateOrderConfirm = () => {
    setPlans(plans.map(p => p.id === generateOrderPlan?.id ? {
      ...p,
      status: '已生成入库单',
    } : p));
    
    setShowGenerateOrderModal(false);
    setGenerateOrderPlan(null);
    alert('入库单已生成');
  };

  const handleCustomerSelectError = (customer: Customer) => {
    if (customer.customerType !== '仓储型') {
      alert('月库型客户不适用入库计划，请直接创建入库单。');
      return true;
    }
    return false;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '待入库': return 'bg-blue-100 text-blue-700';
      case '已生成入库单': return 'bg-green-100 text-green-700';
      case '已关闭': return 'bg-gray-100 text-gray-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">入库计划管理</h2>
        <div className="flex gap-3">
          <button onClick={handleAddPlan} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            新增入库计划
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Upload className="w-4 h-4" />
            导入
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            导出
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <FileText className="w-4 h-4" />
            下载模板
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">入库计划单号</label>
            <input
              type="text"
              value={searchParams.planNo}
              onChange={(e) => setSearchParams(prev => ({ ...prev, planNo: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入单号"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">客户名称</label>
            <input
              type="text"
              value={searchParams.customerName}
              onChange={(e) => setSearchParams(prev => ({ ...prev, customerName: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入客户名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">计划到货日期</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={searchParams.plannedDateStart}
                onChange={(e) => setSearchParams(prev => ({ ...prev, plannedDateStart: e.target.value }))}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="self-center text-slate-500">-</span>
              <input
                type="date"
                value={searchParams.plannedDateEnd}
                onChange={(e) => setSearchParams(prev => ({ ...prev, plannedDateEnd: e.target.value }))}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">入库类型</label>
            <select
              value={searchParams.inboundType}
              onChange={(e) => setSearchParams(prev => ({ ...prev, inboundType: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              <option value="正常入库">正常入库</option>
              <option value="退货入库">退货入库</option>
              <option value="拒收入库">拒收入库</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">仓库</label>
            <input
              type="text"
              value={searchParams.storeName}
              onChange={(e) => setSearchParams(prev => ({ ...prev, storeName: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入仓库名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">温层</label>
            <select
              value={searchParams.temperatureZone}
              onChange={(e) => setSearchParams(prev => ({ ...prev, temperatureZone: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              <option value="冷藏">冷藏</option>
              <option value="常温">常温</option>
              <option value="冷冻">冷冻</option>
              <option value="混装">混装</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
            <select
              value={searchParams.status}
              onChange={(e) => setSearchParams(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              <option value="待入库">待入库</option>
              <option value="已生成入库单">已生成入库单</option>
              <option value="已关闭">已关闭</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setSearchParams({ planNo: '', customerName: '', plannedDateStart: '', plannedDateEnd: '', inboundType: '', storeName: '', temperatureZone: '', status: '' })}
              className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">入库计划单号</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">客户名称</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">计划到货日期</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">入库类型</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">仓库</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">车牌号</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">温层</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">创建人</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">创建时间</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredPlans.map((plan) => (
              <tr key={plan.id}>
                <td className="px-4 py-3 text-sm text-slate-800">{plan.planNo}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{plan.customerName}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{plan.plannedDate}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{plan.inboundType}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{plan.storeName}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{plan.plateNumber || '-'}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{plan.temperatureZone}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                    {plan.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-800">{plan.createdBy}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{plan.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(plan)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="查看"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(plan)}
                      disabled={plan.status !== '待入库'}
                      className={`p-1.5 rounded transition-colors ${plan.status === '待入库' ? 'text-slate-500 hover:text-green-600 hover:bg-green-50' : 'text-slate-300 cursor-not-allowed'}`}
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleGenerateOrder(plan)}
                      disabled={plan.status !== '待入库'}
                      className={`p-1.5 rounded transition-colors ${plan.status === '待入库' ? 'text-slate-500 hover:text-purple-600 hover:bg-purple-50' : 'text-slate-300 cursor-not-allowed'}`}
                      title="生成入库单"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleClose(plan)}
                      disabled={plan.status !== '待入库'}
                      className={`p-1.5 rounded transition-colors ${plan.status === '待入库' ? 'text-slate-500 hover:text-red-600 hover:bg-red-50' : 'text-slate-300 cursor-not-allowed'}`}
                      title="关单"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPlans.length === 0 && (
          <div className="py-12 text-center text-slate-500">暂无数据</div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingPlan ? '编辑入库计划' : '新增入库计划'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">入库计划单号</label>
              <input
                type="text"
                value={formData.planNo}
                readOnly
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">客户名称 <span className="text-red-500">*</span></label>
              <select
                value={formData.customerId}
                onChange={(e) => {
                  const customer = mockCustomers.find(c => c.id === e.target.value);
                  if (customer && handleCustomerSelectError(customer)) {
                    return;
                  }
                  handleCustomerChange(e.target.value);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.customerId ? 'border-red-500' : 'border-slate-300'}`}
              >
                <option value="">请选择客户（仅仓储型）</option>
                {customerOptions.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
              {errors.customerId && <p className="text-xs text-red-500 mt-1">{errors.customerId}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">计划到货日期 <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formData.plannedDate}
                onChange={(e) => setFormData(prev => ({ ...prev, plannedDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.plannedDate ? 'border-red-500' : 'border-slate-300'}`}
              />
              {errors.plannedDate && <p className="text-xs text-red-500 mt-1">{errors.plannedDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">入库类型 <span className="text-red-500">*</span></label>
              <select
                value={formData.inboundType}
                onChange={(e) => setFormData(prev => ({ ...prev, inboundType: e.target.value as '正常入库' | '退货入库' | '拒收入库' }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.inboundType ? 'border-red-500' : 'border-slate-300'}`}
              >
                <option value="正常入库">正常入库</option>
                <option value="退货入库">退货入库</option>
                <option value="拒收入库">拒收入库</option>
              </select>
              {errors.inboundType && <p className="text-xs text-red-500 mt-1">{errors.inboundType}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">仓库 <span className="text-red-500">*</span></label>
              <select
                value={formData.storeId}
                onChange={(e) => handleStoreChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.storeId ? 'border-red-500' : 'border-slate-300'}`}
              >
                <option value="">请选择仓库</option>
                {mockStores.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
              {errors.storeId && <p className="text-xs text-red-500 mt-1">{errors.storeId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">车牌号</label>
              <input
                type="text"
                value={formData.plateNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="选填"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">温层 <span className="text-red-500">*</span></label>
            <select
              value={formData.temperatureZone}
              onChange={(e) => setFormData(prev => ({ ...prev, temperatureZone: e.target.value as '冷藏' | '常温' | '冷冻' | '混装' }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.temperatureZone ? 'border-red-500' : 'border-slate-300'}`}
            >
              <option value="冷藏">冷藏</option>
              <option value="常温">常温</option>
              <option value="冷冻">冷冻</option>
              <option value="混装">混装</option>
            </select>
            {errors.temperatureZone && <p className="text-xs text-red-500 mt-1">{errors.temperatureZone}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700">入库计划明细 <span className="text-red-500">*</span></label>
              <button
                onClick={addItem}
                className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加明细
              </button>
            </div>
            {errors.items && <p className="text-xs text-red-500 mb-2">{errors.items}</p>}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">序号</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">货物编码/名称</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">规格型号</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">计划入库数量</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">计划入库单位</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">生产日期</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">有效期至</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">备注</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => {
                    const goods = mockGoods.find(g => g.id === item.goodsId);
                    return (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-xs text-slate-500">{index + 1}</td>
                        <td className="px-3 py-2">
                          <select
                            value={item.goodsId}
                            onChange={(e) => updateItem(index, 'goodsId', e.target.value)}
                            className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`itemGoods_${index}`] ? 'border-red-500' : 'border-slate-200'}`}
                          >
                            <option value="">请选择货物</option>
                            {mockGoods.map(g => (
                              <option key={g.id} value={g.id}>{g.code} - {g.name}</option>
                            ))}
                          </select>
                          {errors[`itemGoods_${index}`] && <p className="text-xs text-red-500">{errors[`itemGoods_${index}`]}</p>}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">{item.spec}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.plannedQuantity}
                            onChange={(e) => updateItem(index, 'plannedQuantity', parseInt(e.target.value) || 0)}
                            className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`itemQuantity_${index}`] ? 'border-red-500' : 'border-slate-200'}`}
                            min="1"
                          />
                          {errors[`itemQuantity_${index}`] && <p className="text-xs text-red-500">{errors[`itemQuantity_${index}`]}</p>}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.plannedUnit}
                            onChange={(e) => updateItem(index, 'plannedUnit', e.target.value)}
                            className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`itemUnit_${index}`] ? 'border-red-500' : 'border-slate-200'}`}
                          />
                          {errors[`itemUnit_${index}`] && <p className="text-xs text-red-500">{errors[`itemUnit_${index}`]}</p>}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            value={item.productionDate}
                            onChange={(e) => updateItem(index, 'productionDate', e.target.value)}
                            className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`itemDate_${index}`] ? 'border-red-500' : 'border-slate-200'}`}
                          />
                          {errors[`itemDate_${index}`] && <p className="text-xs text-red-500">{errors[`itemDate_${index}`]}</p>}
                          {goods && goods.shelfLifeDays > 0 && !errors[`itemDate_${index}`] && (
                            <p className="text-xs text-blue-500">必填（保质期{goods.shelfLifeDays}天）</p>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600 bg-slate-50">{item.expiryDate || '-'}</td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.remark}
                            onChange={(e) => updateItem(index, 'remark', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => removeItem(index)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => { setShowModal(false); resetForm(); }}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editingPlan ? '保存' : '创建'}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="入库计划详情"
        width="800px"
      >
        {detailPlan && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">入库计划单号</p>
                <p className="text-sm font-medium text-slate-800">{detailPlan.planNo}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">客户名称</p>
                <p className="text-sm font-medium text-slate-800">{detailPlan.customerName} ({detailPlan.customerCode})</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">计划到货日期</p>
                <p className="text-sm font-medium text-slate-800">{detailPlan.plannedDate}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">入库类型</p>
                <p className="text-sm font-medium text-slate-800">{detailPlan.inboundType}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">仓库</p>
                <p className="text-sm font-medium text-slate-800">{detailPlan.storeName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">车牌号</p>
                <p className="text-sm font-medium text-slate-800">{detailPlan.plateNumber || '-'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">温层</p>
                <p className="text-sm font-medium text-slate-800">{detailPlan.temperatureZone}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">状态</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(detailPlan.status)}`}>
                  {detailPlan.status}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">创建人</p>
                <p className="text-sm font-medium text-slate-800">{detailPlan.createdBy}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">创建时间</p>
                <p className="text-sm font-medium text-slate-800">{detailPlan.createdAt}</p>
              </div>
            </div>

            {detailPlan.status === '已关闭' && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs text-red-600">关单原因</p>
                <p className="text-sm font-medium text-red-800">{detailPlan.closeReason}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">入库计划明细</label>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">序号</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">货物编码</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">货物名称</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">规格型号</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">计划入库数量</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">计划入库单位</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">生产日期</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">有效期至</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailPlan.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-xs text-slate-500">{index + 1}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{item.goodsCode}</td>
                        <td className="px-3 py-2 text-xs text-slate-800">{item.goodsName}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{item.spec}</td>
                        <td className="px-3 py-2 text-xs text-slate-800">{item.plannedQuantity}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{item.plannedUnit}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{item.productionDate || '-'}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{item.expiryDate || '-'}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{item.remark || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showCloseModal}
        onClose={() => { setShowCloseModal(false); setClosePlan(null); }}
        title="关单确认"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">确定要关闭入库计划 <span className="font-medium">{closePlan?.planNo}</span> 吗？</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">关单原因 <span className="text-red-500">*</span></label>
            <textarea
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="请输入关单原因"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setShowCloseModal(false); setClosePlan(null); }}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleClosePlan}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              确认关单
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showGenerateOrderModal}
        onClose={() => { setShowGenerateOrderModal(false); setGenerateOrderPlan(null); }}
        title="生成入库单"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">确定要基于入库计划 <span className="font-medium">{generateOrderPlan?.planNo}</span> 生成入库单吗？</p>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600">提示</p>
            <p className="text-sm text-blue-800">生成入库单后，该计划将不再允许编辑和关单。</p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setShowGenerateOrderModal(false); setGenerateOrderPlan(null); }}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleGenerateOrderConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              确认生成
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
