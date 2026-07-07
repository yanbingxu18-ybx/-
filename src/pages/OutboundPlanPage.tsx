import { useState, useEffect } from 'react';
import { Plus, Edit2, Eye, XCircle, FileText, Upload, Download, Trash2, Copy } from 'lucide-react';
import { Modal } from '../components/Modal';
import { OutboundPlan, OutboundPlanItem } from '../types';
import { mockOutboundPlans, mockCustomers, mockGoods, mockStores } from '../mock/data';

export function OutboundPlanPage() {
  const [plans, setPlans] = useState<OutboundPlan[]>(mockOutboundPlans);
  const [filteredPlans, setFilteredPlans] = useState<OutboundPlan[]>(mockOutboundPlans);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showGenerateOrderModal, setShowGenerateOrderModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<OutboundPlan | null>(null);
  const [detailPlan, setDetailPlan] = useState<OutboundPlan | null>(null);
  const [closingPlan, setClosingPlan] = useState<OutboundPlan | null>(null);
  const [generateOrderPlan, setGenerateOrderPlan] = useState<OutboundPlan | null>(null);
  const [closeReason, setCloseReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filterData, setFilterData] = useState({
    planNo: '',
    customerId: '',
    storeId: '',
    deliveryArea: '',
    receivingArea: '',
    status: '',
  });

  const [formData, setFormData] = useState({
    planNo: '',
    businessType: '' as '整车' | '零担' | '城配' | '',
    customerOrderNo: '',
    department: '',
    customerId: '',
    customerCode: '',
    customerName: '',
    deliveryArea: '',
    receivingArea: '',
    requiredDepartureTime: '',
    requiredArrivalTime: '',
    outboundType: '' as '销售出库' | '退货出库' | '报废出库' | '',
    storeId: '',
    storeName: '',
    plannedDate: '',
    remark: '',
  });

  const [items, setItems] = useState<OutboundPlanItem[]>([]);

  const departments = ['销售一部', '销售二部', '配送部', '仓储部'];
  const fenceAreas = ['北京朝阳区', '北京海淀区', '北京西城区', '上海浦东新区', '上海徐汇区', '深圳南山区', '深圳福田区', '广州天河区'];

  const handleSearch = () => {
    let result = [...plans];
    if (filterData.planNo) {
      result = result.filter(p => p.planNo.includes(filterData.planNo));
    }
    if (filterData.customerId) {
      result = result.filter(p => p.customerId === filterData.customerId);
    }
    if (filterData.storeId) {
      result = result.filter(p => p.storeId === filterData.storeId);
    }
    if (filterData.deliveryArea) {
      result = result.filter(p => p.deliveryArea === filterData.deliveryArea);
    }
    if (filterData.receivingArea) {
      result = result.filter(p => p.receivingArea === filterData.receivingArea);
    }
    if (filterData.status) {
      result = result.filter(p => p.status === filterData.status);
    }
    setFilteredPlans(result);
  };

  const handleReset = () => {
    setFilterData({
      planNo: '',
      customerId: '',
      storeId: '',
      deliveryArea: '',
      receivingArea: '',
      status: '',
    });
    setFilteredPlans([...plans]);
  };

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        planNo: editingPlan.planNo,
        businessType: editingPlan.businessType,
        customerOrderNo: editingPlan.customerOrderNo,
        department: editingPlan.department,
        customerId: editingPlan.customerId,
        customerCode: editingPlan.customerCode,
        customerName: editingPlan.customerName,
        deliveryArea: editingPlan.deliveryArea,
        receivingArea: editingPlan.receivingArea,
        requiredDepartureTime: editingPlan.requiredDepartureTime,
        requiredArrivalTime: editingPlan.requiredArrivalTime,
        outboundType: editingPlan.outboundType,
        storeId: editingPlan.storeId,
        storeName: editingPlan.storeName,
        plannedDate: editingPlan.plannedDate,
        remark: editingPlan.remark,
      });
      setItems([...editingPlan.items]);
    }
  }, [editingPlan]);

  const generatePlanNo = (customerCode: string) => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const maxNo = plans
      .filter(p => p.planNo.startsWith(`CKJH${customerCode}${dateStr}`))
      .map(p => parseInt(p.planNo.slice(-4)))
      .reduce((max, curr) => Math.max(max, curr), 0);
    return `CKJH${customerCode}${dateStr}${String(maxNo + 1).padStart(4, '0')}`;
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
    }
  };

  const handleStoreChange = (storeId: string) => {
    const store = mockStores.find(s => s.id === storeId);
    if (store) {
      setFormData(prev => ({ ...prev, storeId, storeName: store.name }));
    }
  };

  const handleGoodsChange = (index: number, goodsId: string) => {
    const goods = mockGoods.find(g => g.id === goodsId);
    if (goods) {
      const updated = [...items];
      const unitWeight = goods.unitWeight || 0;
      const unitVolume = goods.unitVolume || 0;
      updated[index] = {
        ...updated[index],
        goodsId,
        goodsCode: goods.code,
        goodsName: goods.name,
        spec: goods.spec,
        plannedUnit: goods.unit,
        totalWeight: updated[index].plannedQuantity * unitWeight,
        totalVolume: updated[index].plannedQuantity * unitVolume,
      };
      setItems(updated);
    }
  };

  const handleProductionDateChange = (index: number, date: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], productionDate: date };
    if (date && updated[index].goodsId) {
      const goods = mockGoods.find(g => g.id === updated[index].goodsId);
      if (goods && goods.shelfLifeDays > 0) {
        const expiryDate = new Date(date);
        expiryDate.setDate(expiryDate.getDate() + goods.shelfLifeDays);
        updated[index] = { ...updated[index], expiryDate: expiryDate.toISOString().split('T')[0] };
      }
    }
    setItems(updated);
  };

  const addItem = () => {
    const newItem: OutboundPlanItem = {
      id: String(Date.now() + Math.random()),
      planId: '',
      goodsId: '',
      goodsCode: '',
      goodsName: '',
      spec: '',
      plannedQuantity: 0,
      plannedUnit: '',
      totalWeight: 0,
      totalVolume: 0,
      goodsType: '',
      salesPrice: 0,
      salesAmount: 0,
      remark: '',
      productionDate: '',
      expiryDate: '',
      isGoodQuality: true,
      rowSource: 'original',
    };
    setItems([...items, newItem]);
  };

  const copyItem = (index: number) => {
    const item = items[index];
    const newItem: OutboundPlanItem = {
      ...item,
      id: String(Date.now()),
      plannedQuantity: 0,
      salesAmount: 0,
      totalWeight: 0,
      totalVolume: 0,
      isGoodQuality: !item.isGoodQuality,
      rowSource: 'copied',
    };
    setItems([...items.slice(0, index + 1), newItem, ...items.slice(index + 1)]);
  };

  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OutboundPlanItem, value: string | number | boolean) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'plannedQuantity') {
      const goods = mockGoods.find(g => g.id === updated[index].goodsId);
      const unitWeight = goods?.unitWeight || 0;
      const unitVolume = goods?.unitVolume || 0;
      updated[index] = {
        ...updated[index],
        totalWeight: updated[index].plannedQuantity * unitWeight,
        totalVolume: updated[index].plannedQuantity * unitVolume,
        salesAmount: updated[index].plannedQuantity * updated[index].salesPrice,
      };
    } else if (field === 'salesPrice') {
      updated[index] = {
        ...updated[index],
        salesAmount: updated[index].plannedQuantity * updated[index].salesPrice,
      };
    }
    setItems(updated);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessType) newErrors.businessType = '请选择业务类型';
    if (!formData.department) newErrors.department = '请选择订单所属部门';
    if (!formData.customerId) newErrors.customerId = '请选择客户';
    if (!formData.deliveryArea) newErrors.deliveryArea = '请选择发货区域';
    if (!formData.receivingArea) newErrors.receivingArea = '请选择收货区域';
    if (!formData.requiredDepartureTime) newErrors.requiredDepartureTime = '请选择要求起运时间';
    if (!formData.requiredArrivalTime) newErrors.requiredArrivalTime = '请选择要求送达时间';
    if (!formData.outboundType) newErrors.outboundType = '请选择出库类型';
    if (!formData.storeId) newErrors.storeId = '请选择仓库';
    if (!formData.plannedDate) newErrors.plannedDate = '请选择计划出库日期';

    if (formData.requiredDepartureTime && formData.requiredArrivalTime) {
      if (new Date(formData.requiredArrivalTime) < new Date(formData.requiredDepartureTime)) {
        newErrors.requiredArrivalTime = '要求送达时间应不早于要求起运时间';
      }
    }

    items.forEach((item, index) => {
      if (!item.goodsId) newErrors[`itemGoods_${index}`] = `第${index + 1}行：请选择货物`;
      if (!item.plannedQuantity || item.plannedQuantity <= 0) newErrors[`itemQuantity_${index}`] = `第${index + 1}行：请输入计划出库数量`;
      if (!item.plannedUnit) newErrors[`itemUnit_${index}`] = `第${index + 1}行：请选择单位`;
    });

    if (items.length === 0) newErrors.items = '请至少添加一条明细';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const fenceValid = fenceAreas.includes(formData.deliveryArea) && fenceAreas.includes(formData.receivingArea);
    if (!fenceValid) {
      alert('发货区域或收货区域未配置电子围栏，请先创建电子围栏后再保存出库计划。');
      return;
    }

    const tmsSuccess = true;
    if (!tmsSuccess) {
      alert('TMS3.0订单创建失败，出库计划保存失败，请稍后重试或联系管理员处理。');
      return;
    }

    const plan: OutboundPlan = {
      id: editingPlan?.id || String(Date.now()),
      planNo: editingPlan?.planNo || formData.planNo,
      businessType: formData.businessType as '整车' | '零担' | '城配',
      customerOrderNo: formData.customerOrderNo,
      department: formData.department,
      customerId: formData.customerId,
      customerCode: formData.customerCode,
      customerName: formData.customerName,
      deliveryArea: formData.deliveryArea,
      receivingArea: formData.receivingArea,
      requiredDepartureTime: formData.requiredDepartureTime,
      requiredArrivalTime: formData.requiredArrivalTime,
      outboundType: formData.outboundType as '销售出库' | '退货出库' | '报废出库',
      storeId: formData.storeId,
      storeName: formData.storeName,
      plannedDate: formData.plannedDate,
      remark: formData.remark,
      status: editingPlan?.status || '待出库',
      closeReason: '',
      closeBy: '',
      closeTime: '',
      createdBy: editingPlan?.createdBy || '管理员',
      createdAt: editingPlan?.createdAt || new Date().toLocaleString(),
      updatedBy: editingPlan ? '管理员' : '',
      updatedAt: editingPlan ? new Date().toLocaleString() : '',
      items: items.map(item => ({ ...item, planId: editingPlan?.id || String(Date.now()) })),
    };

    if (editingPlan) {
      setPlans(plans.map(p => p.id === plan.id ? plan : p));
      setFilteredPlans(filteredPlans.map(p => p.id === plan.id ? plan : p));
    } else {
      setPlans([plan, ...plans]);
      setFilteredPlans([plan, ...filteredPlans]);
    }

    resetForm();
    setShowModal(false);
    alert('出库计划保存成功');
  };

  const resetForm = () => {
    setFormData({
      planNo: '',
      businessType: '',
      customerOrderNo: '',
      department: '',
      customerId: '',
      customerCode: '',
      customerName: '',
      deliveryArea: '',
      receivingArea: '',
      requiredDepartureTime: '',
      requiredArrivalTime: '',
      outboundType: '',
      storeId: '',
      storeName: '',
      plannedDate: '',
      remark: '',
    });
    setItems([]);
    setEditingPlan(null);
    setErrors({});
  };

  const handleAddPlan = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (plan: OutboundPlan) => {
    if (plan.status !== '待出库') return;
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleView = (plan: OutboundPlan) => {
    setDetailPlan(plan);
    setShowDetailModal(true);
  };

  const handleClose = (plan: OutboundPlan) => {
    if (plan.status !== '待出库') return;
    setClosingPlan(plan);
    setCloseReason('');
    setShowCloseModal(true);
  };

  const handleCloseConfirm = () => {
    if (!closeReason.trim()) {
      alert('请填写关闭原因');
      return;
    }
    if (!confirm('关闭后该出库计划不可编辑、不可生成出库单，是否确认关闭？')) return;

    setPlans(plans.map(p => p.id === closingPlan?.id ? {
      ...p,
      status: '已关闭',
      closeReason,
      closeBy: '管理员',
      closeTime: new Date().toLocaleString(),
    } : p));
    setFilteredPlans(filteredPlans.map(p => p.id === closingPlan?.id ? {
      ...p,
      status: '已关闭',
      closeReason,
      closeBy: '管理员',
      closeTime: new Date().toLocaleString(),
    } : p));

    setShowCloseModal(false);
    setClosingPlan(null);
    setCloseReason('');
    alert('出库计划已关闭');
  };

  const handleGenerateOrder = (plan: OutboundPlan) => {
    if (plan.status !== '待出库') return;
    setGenerateOrderPlan(plan);
    setShowGenerateOrderModal(true);
  };

  const handleGenerateOrderConfirm = () => {
    const hasStock = generateOrderPlan?.items.some(item => {
      const stock = mockGoods.find(g => g.id === item.goodsId);
      return stock && stock.shelfLifeDays > 0;
    });

    if (!hasStock) {
      alert('当前出库计划所有明细均无可用库存，不允许生成出库单。');
      return;
    }

    setPlans(plans.map(p => p.id === generateOrderPlan?.id ? {
      ...p,
      status: '已生成出库单',
    } : p));
    setFilteredPlans(filteredPlans.map(p => p.id === generateOrderPlan?.id ? {
      ...p,
      status: '已生成出库单',
    } : p));

    setShowGenerateOrderModal(false);
    setGenerateOrderPlan(null);
    alert('出库单已生成');
  };

  const handleExport = () => {
    const headers = ['出库计划单号', '客户名称', '客户订单号', '业务类型', '出库类型', '仓库', '发货区域', '收货区域', '计划出库日期', '要求起运时间', '要求送达时间', '状态', '创建人', '创建日期'];
    const rows = plans.map(p => [
      p.planNo, p.customerName, p.customerOrderNo, p.businessType, p.outboundType,
      p.storeName, p.deliveryArea, p.receivingArea, p.plannedDate,
      p.requiredDepartureTime, p.requiredArrivalTime, p.status, p.createdBy, p.createdAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `出库计划_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case '待出库': return 'bg-blue-100 text-blue-700';
      case '已生成出库单': return 'bg-green-100 text-green-700';
      case '已关闭': return 'bg-gray-100 text-gray-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">出库计划</h2>
        <div className="flex gap-3">
          <button onClick={handleAddPlan} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            新增出库计划
          </button>
          <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Upload className="w-4 h-4" />
            导入
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            导出
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">出库计划单号</label>
            <input type="text" value={filterData.planNo} onChange={(e) => setFilterData(prev => ({ ...prev, planNo: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入单号" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">客户名称</label>
            <select value={filterData.customerId} onChange={(e) => setFilterData(prev => ({ ...prev, customerId: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">请选择客户</option>
              {mockCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">仓库</label>
            <select value={filterData.storeId} onChange={(e) => setFilterData(prev => ({ ...prev, storeId: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">请选择仓库</option>
              {mockStores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">发货区域</label>
            <select value={filterData.deliveryArea} onChange={(e) => setFilterData(prev => ({ ...prev, deliveryArea: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">请选择区域</option>
              {fenceAreas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">收货区域</label>
            <select value={filterData.receivingArea} onChange={(e) => setFilterData(prev => ({ ...prev, receivingArea: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">请选择区域</option>
              {fenceAreas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
            <select value={filterData.status} onChange={(e) => setFilterData(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">全部</option>
              <option value="待出库">待出库</option>
              <option value="已生成出库单">已生成出库单</option>
              <option value="已关闭">已关闭</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            重置
          </button>
          <button onClick={handleSearch} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            查询
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">出库计划单号</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">客户名称</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">客户订单号</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">业务类型</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">出库类型</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">仓库</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">发货区域</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">收货区域</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">计划出库日期</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPlans.map(plan => (
              <tr key={plan.id}>
                <td className="px-4 py-3 text-sm text-slate-700">{plan.planNo}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{plan.customerName}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{plan.customerOrderNo}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{plan.businessType}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{plan.outboundType}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{plan.storeName}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{plan.deliveryArea}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{plan.receivingArea}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{plan.plannedDate}</td>
                <td className="px-4 py-3"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(plan.status)}`}>{plan.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => handleView(plan)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    {plan.status === '待出库' && (
                      <>
                        <button onClick={() => handleEdit(plan)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleClose(plan)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded">
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleGenerateOrder(plan)} className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded">
                          <FileText className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingPlan ? '编辑出库计划' : '新增出库计划'} width="900px" allowHorizontalScroll={true}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">出库计划单号</label>
              <input type="text" value={formData.planNo} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 cursor-not-allowed" placeholder="系统自动生成" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">业务类型 <span className="text-red-500">*</span></label>
              <select value={formData.businessType} onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value as any }))} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.businessType ? 'border-red-500' : 'border-slate-300'}`}>
                <option value="">请选择业务类型</option>
                <option value="整车">整车</option>
                <option value="零担">零担</option>
                <option value="城配">城配</option>
              </select>
              {errors.businessType && <p className="text-xs text-red-500 mt-1">{errors.businessType}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">客户订单号</label>
              <input type="text" value={formData.customerOrderNo} onChange={(e) => setFormData(prev => ({ ...prev, customerOrderNo: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="客户侧订单编号" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">订单所属部门 <span className="text-red-500">*</span></label>
              <select value={formData.department} onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.department ? 'border-red-500' : 'border-slate-300'}`}>
                <option value="">请选择部门</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">客户 <span className="text-red-500">*</span></label>
              <select value={formData.customerId} onChange={(e) => handleCustomerChange(e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.customerId ? 'border-red-500' : 'border-slate-300'}`}>
                <option value="">请选择客户</option>
                {mockCustomers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
              {errors.customerId && <p className="text-xs text-red-500 mt-1">{errors.customerId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">发货区域 <span className="text-red-500">*</span></label>
              <select value={formData.deliveryArea} onChange={(e) => setFormData(prev => ({ ...prev, deliveryArea: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.deliveryArea ? 'border-red-500' : 'border-slate-300'}`}>
                <option value="">请选择发货区域</option>
                {fenceAreas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.deliveryArea && <p className="text-xs text-red-500 mt-1">{errors.deliveryArea}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">收货区域 <span className="text-red-500">*</span></label>
              <select value={formData.receivingArea} onChange={(e) => setFormData(prev => ({ ...prev, receivingArea: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.receivingArea ? 'border-red-500' : 'border-slate-300'}`}>
                <option value="">请选择收货区域</option>
                {fenceAreas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.receivingArea && <p className="text-xs text-red-500 mt-1">{errors.receivingArea}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">要求起运时间 <span className="text-red-500">*</span></label>
              <input type="datetime-local" value={formData.requiredDepartureTime.replace(' ', 'T')} onChange={(e) => setFormData(prev => ({ ...prev, requiredDepartureTime: e.target.value.replace('T', ' ') }))} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.requiredDepartureTime ? 'border-red-500' : 'border-slate-300'}`} />
              {errors.requiredDepartureTime && <p className="text-xs text-red-500 mt-1">{errors.requiredDepartureTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">要求送达时间 <span className="text-red-500">*</span></label>
              <input type="datetime-local" value={formData.requiredArrivalTime.replace(' ', 'T')} onChange={(e) => setFormData(prev => ({ ...prev, requiredArrivalTime: e.target.value.replace('T', ' ') }))} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.requiredArrivalTime ? 'border-red-500' : 'border-slate-300'}`} />
              {errors.requiredArrivalTime && <p className="text-xs text-red-500 mt-1">{errors.requiredArrivalTime}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">出库类型 <span className="text-red-500">*</span></label>
              <select value={formData.outboundType} onChange={(e) => setFormData(prev => ({ ...prev, outboundType: e.target.value as any }))} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.outboundType ? 'border-red-500' : 'border-slate-300'}`}>
                <option value="">请选择出库类型</option>
                <option value="销售出库">销售出库</option>
                <option value="退货出库">退货出库</option>
                <option value="报废出库">报废出库</option>
              </select>
              {errors.outboundType && <p className="text-xs text-red-500 mt-1">{errors.outboundType}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">仓库 <span className="text-red-500">*</span></label>
              <select value={formData.storeId} onChange={(e) => handleStoreChange(e.target.value)} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.storeId ? 'border-red-500' : 'border-slate-300'}`}>
                <option value="">请选择仓库</option>
                {mockStores.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
              {errors.storeId && <p className="text-xs text-red-500 mt-1">{errors.storeId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">计划出库日期 <span className="text-red-500">*</span></label>
              <input type="date" value={formData.plannedDate} onChange={(e) => setFormData(prev => ({ ...prev, plannedDate: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.plannedDate ? 'border-red-500' : 'border-slate-300'}`} />
              {errors.plannedDate && <p className="text-xs text-red-500 mt-1">{errors.plannedDate}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">订单备注</label>
              <textarea value={formData.remark} onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} placeholder="订单级备注" />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">出库计划明细</h3>
              <button onClick={addItem} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                新增明细
              </button>
            </div>
            {errors.items && <p className="text-xs text-red-500 mb-2">{errors.items}</p>}
            <div className="border border-slate-200 rounded-lg overflow-hidden min-w-max">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">商品编码</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">商品名称</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">规格型号</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">计划出库数量</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">单位</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">货物销售单价</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">货物销售金额</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">总重量（kg）</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">总体积（m³）</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">生产日期</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">有效期至</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">是否良品</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">备注</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-slate-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <select value={item.goodsId} onChange={(e) => handleGoodsChange(index, e.target.value)} className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`itemGoods_${index}`] ? 'border-red-500' : 'border-slate-200'}`}>
                          <option value="">请选择</option>
                          {mockGoods.map(g => <option key={g.id} value={g.id}>{g.code}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-700">{item.goodsName}</td>
                      <td className="px-3 py-2 text-sm text-slate-700">{item.spec}</td>
                      <td className="px-3 py-2">
                        <input type="number" min="0" value={item.plannedQuantity || ''} onChange={(e) => updateItem(index, 'plannedQuantity', parseInt(e.target.value) || 0)} className={`w-full px-2 py-1 text-sm text-right border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`itemQuantity_${index}`] ? 'border-red-500' : 'border-slate-200'}`} />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={item.plannedUnit} onChange={(e) => updateItem(index, 'plannedUnit', e.target.value)} className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`itemUnit_${index}`] ? 'border-red-500' : 'border-slate-200'}`} />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min="0" step="0.01" value={item.salesPrice || ''} onChange={(e) => updateItem(index, 'salesPrice', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 text-sm text-right border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </td>
                      <td className="px-3 py-2 text-sm text-right text-slate-700">{item.salesAmount}</td>
                      <td className="px-3 py-2">
                        <input type="number" min="0" step="0.01" value={item.totalWeight || ''} onChange={(e) => updateItem(index, 'totalWeight', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 text-sm text-right border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min="0" step="0.01" value={item.totalVolume || ''} onChange={(e) => updateItem(index, 'totalVolume', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 text-sm text-right border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="date" value={item.productionDate} onChange={(e) => handleProductionDateChange(index, e.target.value)} className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-700">{item.expiryDate || '-'}</td>
                      <td className="px-3 py-2">
                        <select value={String(item.isGoodQuality)} onChange={(e) => updateItem(index, 'isGoodQuality', e.target.value === 'true')} className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="true">是</option>
                          <option value="false">否</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={item.remark} onChange={(e) => updateItem(index, 'remark', e.target.value)} className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => copyItem(index)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteItem(index)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              保存
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setDetailPlan(null); }} title="出库计划详情" width="900px">
        {detailPlan && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm text-slate-500">出库计划单号：</span><span className="text-sm font-medium">{detailPlan.planNo}</span></div>
              <div><span className="text-sm text-slate-500">业务类型：</span><span className="text-sm">{detailPlan.businessType}</span></div>
              <div><span className="text-sm text-slate-500">客户订单号：</span><span className="text-sm">{detailPlan.customerOrderNo}</span></div>
              <div><span className="text-sm text-slate-500">订单所属部门：</span><span className="text-sm">{detailPlan.department}</span></div>
              <div><span className="text-sm text-slate-500">客户名称：</span><span className="text-sm">{detailPlan.customerName}</span></div>
              <div><span className="text-sm text-slate-500">出库类型：</span><span className="text-sm">{detailPlan.outboundType}</span></div>
              <div><span className="text-sm text-slate-500">发货区域：</span><span className="text-sm">{detailPlan.deliveryArea}</span></div>
              <div><span className="text-sm text-slate-500">收货区域：</span><span className="text-sm">{detailPlan.receivingArea}</span></div>
              <div><span className="text-sm text-slate-500">要求起运时间：</span><span className="text-sm">{detailPlan.requiredDepartureTime}</span></div>
              <div><span className="text-sm text-slate-500">要求送达时间：</span><span className="text-sm">{detailPlan.requiredArrivalTime}</span></div>
              <div><span className="text-sm text-slate-500">仓库：</span><span className="text-sm">{detailPlan.storeName}</span></div>
              <div><span className="text-sm text-slate-500">计划出库日期：</span><span className="text-sm">{detailPlan.plannedDate}</span></div>
              <div><span className="text-sm text-slate-500">状态：</span><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(detailPlan.status)}`}>{detailPlan.status}</span></div>
              <div><span className="text-sm text-slate-500">创建人：</span><span className="text-sm">{detailPlan.createdBy}</span></div>
              {detailPlan.closeReason && <div className="col-span-2"><span className="text-sm text-slate-500">关闭原因：</span><span className="text-sm">{detailPlan.closeReason}</span></div>}
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">出库计划明细</h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">商品编码</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">商品名称</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">规格型号</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">计划出库数量</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">单位</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">货物销售单价</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">货物销售金额</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">总重量（kg）</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">总体积（m³）</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">生产日期</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">有效期至</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">是否良品</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailPlan.items.map(item => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 text-sm text-slate-700">{item.goodsCode}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.goodsName}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.spec}</td>
                        <td className="px-3 py-2 text-sm text-right text-slate-700">{item.plannedQuantity}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.plannedUnit}</td>
                        <td className="px-3 py-2 text-sm text-right text-slate-700">{item.salesPrice}</td>
                        <td className="px-3 py-2 text-sm text-right text-slate-700">{item.salesAmount}</td>
                        <td className="px-3 py-2 text-sm text-right text-slate-700">{item.totalWeight}</td>
                        <td className="px-3 py-2 text-sm text-right text-slate-700">{item.totalVolume}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.productionDate || '-'}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.expiryDate || '-'}</td>
                        <td className="px-3 py-2"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.isGoodQuality ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.isGoodQuality ? '是' : '否'}</span></td>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showCloseModal} onClose={() => { setShowCloseModal(false); setClosingPlan(null); }} title="关闭出库计划">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">确定要关闭出库计划 <span className="font-medium">{closingPlan?.planNo}</span> 吗？</p>
          <p className="text-sm text-slate-500">关闭后该出库计划不可编辑、不可生成出库单。</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">关闭原因 <span className="text-red-500">*</span></label>
            <textarea value={closeReason} onChange={(e) => setCloseReason(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="请输入关闭原因" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowCloseModal(false); setClosingPlan(null); }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button onClick={handleCloseConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              确认关闭
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showGenerateOrderModal} onClose={() => { setShowGenerateOrderModal(false); setGenerateOrderPlan(null); }} title="生成出库单">
        {generateOrderPlan && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">确定要基于出库计划 <span className="font-medium">{generateOrderPlan.planNo}</span> 生成出库单吗？</p>
            <div className="border border-slate-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">出库计划明细：</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">商品名称</th>
                    <th className="text-right">计划出库数量</th>
                    <th className="text-left">单位</th>
                  </tr>
                </thead>
                <tbody>
                  {generateOrderPlan.items.map(item => (
                    <tr key={item.id} className="border-t">
                      <td>{item.goodsName}</td>
                      <td className="text-right">{item.plannedQuantity}</td>
                      <td>{item.plannedUnit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowGenerateOrderModal(false); setGenerateOrderPlan(null); }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                取消
              </button>
              <button onClick={handleGenerateOrderConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                确认生成
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="导入出库计划">
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">下载导入模板</h4>
            <button onClick={() => { alert('导入模板已下载'); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              下载模板
            </button>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-sm font-medium text-slate-800 mb-2">上传文件</h4>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">点击或拖拽文件到此处上传</p>
              <p className="text-xs text-slate-400 mt-1">支持 .xlsx, .xls, .csv 格式</p>
            </div>
            <button onClick={() => { alert('文件上传成功，正在解析...'); setShowImportModal(false); }} className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              开始导入
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}