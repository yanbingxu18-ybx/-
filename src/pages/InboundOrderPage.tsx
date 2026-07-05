import { useState, useEffect } from 'react';
import { Plus, Edit2, Eye, Trash2, Copy, Upload, ImageIcon } from 'lucide-react';
import { Modal } from '../components/Modal';
import { InboundOrder, InboundOrderItem, Customer, InboundPlan } from '../types';
import { mockInboundOrders, mockCustomers, mockGoods, mockStores, mockInboundPlans } from '../mock/data';

export function InboundOrderPage() {
  const [orders, setOrders] = useState<InboundOrder[]>(mockInboundOrders);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSelectPlanModal, setShowSelectPlanModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<InboundOrder | null>(null);
  const [detailOrder, setDetailOrder] = useState<InboundOrder | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<InboundPlan | null>(null);
  const [customerTypeMode, setCustomerTypeMode] = useState<'warehouse' | 'monthly'>('warehouse');
  const [searchParams, setSearchParams] = useState({
    orderNo: '',
    planNo: '',
    customerName: '',
    storeName: '',
    actualDateStart: '',
    actualDateEnd: '',
    inboundType: '',
    temperatureZone: '',
    status: '',
  });
  const [formData, setFormData] = useState({
    orderNo: '',
    planId: '',
    planNo: '',
    customerId: '',
    customerCode: '',
    customerName: '',
    customerType: '仓储型' as '月库型' | '仓储型',
    storeId: '',
    storeName: '',
    plateNumber: '',
    plannedDate: '',
    actualDate: '',
    inboundType: '正常入库' as '正常入库' | '退货入库' | '拒收入库',
    temperatureZone: '冷藏' as '冷藏' | '常温' | '冷冻' | '混装',
    attachment: '',
  });
  const [items, setItems] = useState<InboundOrderItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warehouseCustomers, setWarehouseCustomers] = useState<Customer[]>([]);
  const [monthlyCustomers, setMonthlyCustomers] = useState<Customer[]>([]);
  const [availablePlans, setAvailablePlans] = useState<InboundPlan[]>([]);

  useEffect(() => {
    setWarehouseCustomers(mockCustomers.filter(c => c.customerType === '仓储型'));
    setMonthlyCustomers(mockCustomers.filter(c => c.customerType === '月库型'));
    setAvailablePlans(mockInboundPlans.filter(p => p.status === '待入库'));
  }, []);

  const filteredOrders = orders.filter(order => {
    if (searchParams.orderNo && !order.orderNo.includes(searchParams.orderNo)) return false;
    if (searchParams.planNo && !order.planNo.includes(searchParams.planNo)) return false;
    if (searchParams.customerName && !order.customerName.includes(searchParams.customerName)) return false;
    if (searchParams.storeName && !order.storeName.includes(searchParams.storeName)) return false;
    if (searchParams.actualDateStart && order.actualDate < searchParams.actualDateStart) return false;
    if (searchParams.actualDateEnd && order.actualDate > searchParams.actualDateEnd) return false;
    if (searchParams.inboundType && order.inboundType !== searchParams.inboundType) return false;
    if (searchParams.temperatureZone && order.temperatureZone !== searchParams.temperatureZone) return false;
    if (searchParams.status && order.status !== searchParams.status) return false;
    return true;
  });

  const generateOrderNo = (customerCode: string) => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const existingToday = orders.filter(o => o.orderNo.includes(dateStr) && o.orderNo.includes(customerCode));
    const seq = String(existingToday.length + 1).padStart(4, '0');
    return `RKD${customerCode}${dateStr}${seq}`;
  };

  const calculateExpiryDate = (productionDate: string, shelfLifeDays: number) => {
    if (!productionDate || shelfLifeDays <= 0) return '';
    const date = new Date(productionDate);
    date.setDate(date.getDate() + shelfLifeDays);
    return date.toISOString().slice(0, 10);
  };

  const resetForm = () => {
    setFormData({
      orderNo: '',
      planId: '',
      planNo: '',
      customerId: '',
      customerCode: '',
      customerName: '',
      customerType: '仓储型',
      storeId: '',
      storeName: '',
      plateNumber: '',
      plannedDate: '',
      actualDate: '',
      inboundType: '正常入库',
      temperatureZone: '冷藏',
      attachment: '',
    });
    setItems([]);
    setErrors({});
    setEditingOrder(null);
    setSelectedPlan(null);
  };

  const handleAddOrder = () => {
    resetForm();
    setCustomerTypeMode('warehouse');
    setShowModal(true);
  };

  const handleAddMonthlyOrder = () => {
    resetForm();
    setCustomerTypeMode('monthly');
    setFormData(prev => ({ ...prev, customerType: '月库型' }));
    setShowModal(true);
  };

  const handleEdit = (order: InboundOrder) => {
    if (order.status !== '暂存') return;
    setEditingOrder(order);
    setCustomerTypeMode(order.customerType === '仓储型' ? 'warehouse' : 'monthly');
    setFormData({
      orderNo: order.orderNo,
      planId: order.planId,
      planNo: order.planNo,
      customerId: order.customerId,
      customerCode: order.customerCode,
      customerName: order.customerName,
      customerType: order.customerType,
      storeId: order.storeId,
      storeName: order.storeName,
      plateNumber: order.plateNumber,
      plannedDate: order.plannedDate,
      actualDate: order.actualDate,
      inboundType: order.inboundType,
      temperatureZone: order.temperatureZone,
      attachment: order.attachment,
    });
    setItems([...order.items]);
    setShowModal(true);
  };

  const handleView = (order: InboundOrder) => {
    setDetailOrder(order);
    setShowDetailModal(true);
  };

  const handleDelete = (order: InboundOrder) => {
    if (order.status !== '暂存') return;
    if (confirm(`确定要删除入库单 ${order.orderNo} 吗？`)) {
      setOrders(orders.filter(o => o.id !== order.id));
    }
  };

  const handleSelectPlan = () => {
    setShowSelectPlanModal(true);
  };

  const handlePlanSelected = (plan: InboundPlan) => {
    setSelectedPlan(plan);
    setFormData(prev => ({
      ...prev,
      planId: plan.id,
      planNo: plan.planNo,
      customerId: plan.customerId,
      customerCode: plan.customerCode,
      customerName: plan.customerName,
      customerType: '仓储型',
      storeId: plan.storeId,
      storeName: plan.storeName,
      plateNumber: plan.plateNumber,
      plannedDate: plan.plannedDate,
      inboundType: plan.inboundType,
      temperatureZone: plan.temperatureZone,
      orderNo: generateOrderNo(plan.customerCode),
    }));
    setItems(plan.items.map(item => ({
      id: String(Date.now() + Math.random()),
      orderId: '',
      goodsId: item.goodsId,
      goodsCode: item.goodsCode,
      goodsName: item.goodsName,
      spec: item.spec,
      plannedQuantity: item.plannedQuantity,
      plannedUnit: item.plannedUnit,
      actualQuantity: item.plannedQuantity,
      actualUnit: item.plannedUnit,
      productionDate: item.productionDate,
      expiryDate: item.expiryDate,
      isGoodQuality: true,
      remark: '',
      isAbnormal: false,
    })));
    setShowSelectPlanModal(false);
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = mockCustomers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerId,
        customerCode: customer.code,
        customerName: customer.name,
        customerType: customer.customerType,
        orderNo: generateOrderNo(customer.code),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        customerId: '',
        customerCode: '',
        customerName: '',
        customerType: '仓储型',
        orderNo: '',
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
      orderId: editingOrder?.id || '',
      goodsId: '',
      goodsCode: '',
      goodsName: '',
      spec: '',
      plannedQuantity: 0,
      plannedUnit: '',
      actualQuantity: 0,
      actualUnit: '',
      productionDate: '',
      expiryDate: '',
      isGoodQuality: true,
      remark: '',
      isAbnormal: false,
    }]);
  };

  const copyItem = (index: number) => {
    const item = items[index];
    const newItem: InboundOrderItem = {
      ...item,
      id: String(Date.now()),
      actualQuantity: 0,
      isGoodQuality: !item.isGoodQuality,
    };
    setItems([...items.slice(0, index + 1), newItem, ...items.slice(index + 1)]);
  };

  const updateItem = (index: number, field: keyof InboundOrderItem, value: string | number | boolean) => {
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
          actualUnit: goods.unit,
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
    
    if (field === 'actualQuantity' || field === 'actualUnit') {
      const planQty = updated[index].plannedQuantity;
      const planUnit = updated[index].plannedUnit;
      const actualQty = updated[index].actualQuantity;
      const actualUnit = updated[index].actualUnit;
      
      if (formData.customerType === '仓储型' && planQty > 0 && planUnit) {
        updated[index] = {
          ...updated[index],
          isAbnormal: planQty !== actualQty || planUnit !== actualUnit,
        };
      }
    }
    
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const validateForm = (isDraft: boolean) => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerId) newErrors.customerId = '请选择客户';
    if (!formData.storeId) newErrors.storeId = '请选择仓库';
    if (!formData.actualDate) newErrors.actualDate = '请选择实际入库日期';
    if (!formData.inboundType) newErrors.inboundType = '请选择入库类型';
    if (!formData.temperatureZone) newErrors.temperatureZone = '请选择温层';
    
    if (formData.temperatureZone !== '常温' && !formData.attachment) {
      newErrors.attachment = '非温层常温时，附件（温度照片）必填';
    }
    
    items.forEach((item, index) => {
      if (!item.goodsId) newErrors[`itemGoods_${index}`] = `第${index + 1}行：请选择货物`;
      if (!item.actualQuantity || item.actualQuantity <= 0) newErrors[`itemQuantity_${index}`] = `第${index + 1}行：请输入实际入库数量`;
      if (!item.actualUnit) newErrors[`itemUnit_${index}`] = `第${index + 1}行：请选择单位`;
      
      const goods = mockGoods.find(g => g.id === item.goodsId);
      if (goods && goods.shelfLifeDays > 0 && !item.productionDate) {
        newErrors[`itemDate_${index}`] = `第${index + 1}行：${goods.name}维护了保质期，生产日期必填`;
      }
      
      if (!isDraft && item.isAbnormal && !item.remark.trim()) {
        newErrors[`itemRemark_${index}`] = `第${index + 1}行：实际入库数量/单位与计划不一致，请填写异常原因`;
      }
    });
    
    if (items.length === 0) newErrors.items = '请至少添加一条明细';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
    if (!validateForm(true)) return;
    
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    
    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? {
        ...o,
        ...formData,
        items,
        status: '暂存',
        updatedBy: '当前用户',
        updatedAt: now,
      } : o));
    } else {
      const newOrder: InboundOrder = {
        id: String(Date.now()),
        ...formData,
        status: '暂存',
        createdBy: '当前用户',
        createdAt: now,
        updatedBy: '',
        updatedAt: '',
        items: items.map(item => ({ ...item, orderId: String(Date.now()) })),
      };
      setOrders([newOrder, ...orders]);
    }
    
    setShowModal(false);
    resetForm();
    alert('入库单已暂存');
  };

  const handleSaveEffective = () => {
    if (!validateForm(false)) return;
    
    const now = new Date().toLocaleString('zh-CN', { hour12: false });
    
    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? {
        ...o,
        ...formData,
        items,
        status: '已生效',
        updatedBy: '当前用户',
        updatedAt: now,
      } : o));
    } else {
      const newOrder: InboundOrder = {
        id: String(Date.now()),
        ...formData,
        status: '已生效',
        createdBy: '当前用户',
        createdAt: now,
        updatedBy: '',
        updatedAt: '',
        items: items.map(item => ({ ...item, orderId: String(Date.now()) })),
      };
      setOrders([newOrder, ...orders]);
    }
    
    if (selectedPlan) {
      setAvailablePlans(availablePlans.filter(p => p.id !== selectedPlan.id));
    }
    
    setShowModal(false);
    resetForm();
    alert('入库单已生效，库存已增加');
  };

  const handleAttachmentUpload = () => {
    setFormData(prev => ({ ...prev, attachment: `temperature_photo_${Date.now()}.jpg` }));
    alert('图片上传成功');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '暂存': return 'bg-yellow-100 text-yellow-700';
      case '已生效': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">入库单管理</h2>
        <div className="flex gap-3">
          <button
            onClick={handleAddOrder}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            仓储型入库单
          </button>
          <button
            onClick={handleAddMonthlyOrder}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            月库型入库单
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">入库单号</label>
            <input
              type="text"
              value={searchParams.orderNo}
              onChange={(e) => setSearchParams(prev => ({ ...prev, orderNo: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入单号"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">关联入库计划单号</label>
            <input
              type="text"
              value={searchParams.planNo}
              onChange={(e) => setSearchParams(prev => ({ ...prev, planNo: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入计划单号"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">客户</label>
            <input
              type="text"
              value={searchParams.customerName}
              onChange={(e) => setSearchParams(prev => ({ ...prev, customerName: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入客户名称"
            />
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
            <label className="block text-sm font-medium text-slate-700 mb-1">实际入库日期</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={searchParams.actualDateStart}
                onChange={(e) => setSearchParams(prev => ({ ...prev, actualDateStart: e.target.value }))}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="self-center text-slate-500">-</span>
              <input
                type="date"
                value={searchParams.actualDateEnd}
                onChange={(e) => setSearchParams(prev => ({ ...prev, actualDateEnd: e.target.value }))}
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
              <option value="暂存">暂存</option>
              <option value="已生效">已生效</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setSearchParams({ orderNo: '', planNo: '', customerName: '', storeName: '', actualDateStart: '', actualDateEnd: '', inboundType: '', temperatureZone: '', status: '' })}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            重置
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">入库单号</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">关联入库计划单号</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">客户</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">仓库</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">实际入库日期</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">入库类型</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">温层</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">创建人</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">创建时间</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3 text-sm text-slate-800">{order.orderNo}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{order.planNo || '-'}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{order.customerName}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{order.storeName}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{order.actualDate}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{order.inboundType}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{order.temperatureZone}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-800">{order.createdBy}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{order.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleView(order)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="查看"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(order)}
                      disabled={order.status !== '暂存'}
                      className={`p-1.5 rounded transition-colors ${order.status === '暂存' ? 'text-slate-500 hover:text-green-600 hover:bg-green-50' : 'text-slate-300 cursor-not-allowed'}`}
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(order)}
                      disabled={order.status !== '暂存'}
                      className={`p-1.5 rounded transition-colors ${order.status === '暂存' ? 'text-slate-500 hover:text-red-600 hover:bg-red-50' : 'text-slate-300 cursor-not-allowed'}`}
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="py-12 text-center text-slate-500">暂无数据</div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingOrder ? '编辑入库单' : (customerTypeMode === 'warehouse' ? '创建仓储型入库单' : '创建月库型入库单')}
        width="900px"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">入库单号</label>
              <input
                type="text"
                value={formData.orderNo}
                readOnly
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">客户类型</label>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${formData.customerType === '仓储型' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {formData.customerType}
              </span>
            </div>
          </div>

          {customerTypeMode === 'warehouse' && !editingOrder && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <button
                onClick={handleSelectPlan}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                {selectedPlan ? `已选择计划: ${selectedPlan.planNo}` : '选择入库计划生成入库单'}
              </button>
              {selectedPlan && (
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <span className="text-slate-600">客户: {selectedPlan.customerName}</span>
                  <span className="text-slate-600">仓库: {selectedPlan.storeName}</span>
                  <span className="text-slate-600">计划日期: {selectedPlan.plannedDate}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">客户 <span className="text-red-500">*</span></label>
              <select
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                disabled={customerTypeMode === 'warehouse' && selectedPlan !== null}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.customerId ? 'border-red-500' : 'border-slate-300'} ${customerTypeMode === 'warehouse' && selectedPlan ? 'bg-slate-100' : ''}`}
              >
                <option value="">请选择客户</option>
                {(customerTypeMode === 'warehouse' ? warehouseCustomers : monthlyCustomers).map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
              {errors.customerId && <p className="text-xs text-red-500 mt-1">{errors.customerId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">仓库 <span className="text-red-500">*</span></label>
              <select
                value={formData.storeId}
                onChange={(e) => handleStoreChange(e.target.value)}
                disabled={customerTypeMode === 'warehouse' && selectedPlan !== null}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.storeId ? 'border-red-500' : 'border-slate-300'} ${customerTypeMode === 'warehouse' && selectedPlan ? 'bg-slate-100' : ''}`}
              >
                <option value="">请选择仓库</option>
                {mockStores.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
              {errors.storeId && <p className="text-xs text-red-500 mt-1">{errors.storeId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">车牌号</label>
              <input
                type="text"
                value={formData.plateNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                disabled={customerTypeMode === 'warehouse' && selectedPlan !== null}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${customerTypeMode === 'warehouse' && selectedPlan ? 'bg-slate-100' : 'border-slate-300'}`}
                placeholder="选填"
              />
            </div>
            <div>
              {customerTypeMode === 'warehouse' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">计划入库日期</label>
                  <input
                    type="date"
                    value={formData.plannedDate}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {customerTypeMode === 'monthly' && (
                <div></div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">实际入库日期 <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={formData.actualDate}
                onChange={(e) => setFormData(prev => ({ ...prev, actualDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.actualDate ? 'border-red-500' : 'border-slate-300'}`}
              />
              {errors.actualDate && <p className="text-xs text-red-500 mt-1">{errors.actualDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">入库类型 <span className="text-red-500">*</span></label>
              <select
                value={formData.inboundType}
                onChange={(e) => setFormData(prev => ({ ...prev, inboundType: e.target.value as '正常入库' | '退货入库' | '拒收入库' }))}
                disabled={customerTypeMode === 'warehouse' && selectedPlan !== null}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.inboundType ? 'border-red-500' : 'border-slate-300'} ${customerTypeMode === 'warehouse' && selectedPlan ? 'bg-slate-100' : ''}`}
              >
                <option value="正常入库">正常入库</option>
                <option value="退货入库">退货入库</option>
                <option value="拒收入库">拒收入库</option>
              </select>
              {errors.inboundType && <p className="text-xs text-red-500 mt-1">{errors.inboundType}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">温层 <span className="text-red-500">*</span></label>
              <select
                value={formData.temperatureZone}
                onChange={(e) => setFormData(prev => ({ ...prev, temperatureZone: e.target.value as '冷藏' | '常温' | '冷冻' | '混装' }))}
                disabled={customerTypeMode === 'warehouse' && selectedPlan !== null}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.temperatureZone ? 'border-red-500' : 'border-slate-300'} ${customerTypeMode === 'warehouse' && selectedPlan ? 'bg-slate-100' : ''}`}
              >
                <option value="冷藏">冷藏</option>
                <option value="常温">常温</option>
                <option value="冷冻">冷冻</option>
                <option value="混装">混装</option>
              </select>
              {errors.temperatureZone && <p className="text-xs text-red-500 mt-1">{errors.temperatureZone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">附件（温度照片）</label>
            <div className="flex items-center gap-3">
              {formData.attachment ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm">{formData.attachment}</span>
                </div>
              ) : (
                <button
                  onClick={handleAttachmentUpload}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  上传图片
                </button>
              )}
              {formData.temperatureZone !== '常温' && !formData.attachment && (
                <span className="text-xs text-red-500">非常温温层必填</span>
              )}
              {errors.attachment && <p className="text-xs text-red-500">{errors.attachment}</p>}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-700">入库明细 <span className="text-red-500">*</span></label>
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
                    {customerTypeMode === 'warehouse' && (
                      <>
                        <th className="px-3 py-2 text-xs font-medium text-slate-600">计划数量</th>
                        <th className="px-3 py-2 text-xs font-medium text-slate-600">计划单位</th>
                      </>
                    )}
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">实际数量</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">实际单位</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">生产日期</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">有效期至</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-600">是否良品</th>
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
                        {customerTypeMode === 'warehouse' && (
                          <>
                            <td className="px-3 py-2 text-xs text-slate-600">{item.plannedQuantity}</td>
                            <td className="px-3 py-2 text-xs text-slate-600">{item.plannedUnit}</td>
                          </>
                        )}
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.actualQuantity}
                            onChange={(e) => updateItem(index, 'actualQuantity', parseInt(e.target.value) || 0)}
                            className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`itemQuantity_${index}`] ? 'border-red-500' : 'border-slate-200'} ${item.isAbnormal ? 'bg-red-50' : ''}`}
                            min="1"
                          />
                          {errors[`itemQuantity_${index}`] && <p className="text-xs text-red-500">{errors[`itemQuantity_${index}`]}</p>}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.actualUnit}
                            onChange={(e) => updateItem(index, 'actualUnit', e.target.value)}
                            className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`itemUnit_${index}`] ? 'border-red-500' : 'border-slate-200'} ${item.isAbnormal ? 'bg-red-50' : ''}`}
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
                          <select
                            value={String(item.isGoodQuality)}
                            onChange={(e) => updateItem(index, 'isGoodQuality', e.target.value === 'true')}
                            className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="true">是</option>
                            <option value="false">否</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.remark}
                            onChange={(e) => updateItem(index, 'remark', e.target.value)}
                            className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`itemRemark_${index}`] ? 'border-red-500' : 'border-slate-200'} ${item.isAbnormal ? 'bg-red-50' : ''}`}
                            placeholder={item.isAbnormal ? '异常入库，备注必填' : ''}
                          />
                          {errors[`itemRemark_${index}`] && <p className="text-xs text-red-500">{errors[`itemRemark_${index}`]}</p>}
                          {item.isAbnormal && !errors[`itemRemark_${index}`] && (
                            <p className="text-xs text-orange-500">实际与计划不一致</p>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <button
                              onClick={() => copyItem(index)}
                              className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                              title="复制行"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeItem(index)}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                              title="删除行"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
            onClick={handleSaveDraft}
            className="px-4 py-2 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors"
          >
            暂存
          </button>
          <button
            onClick={handleSaveEffective}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存生效
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="入库单详情"
        width="900px"
      >
        {detailOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">入库单号</p>
                <p className="text-sm font-medium text-slate-800">{detailOrder.orderNo}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">关联入库计划单号</p>
                <p className="text-sm font-medium text-slate-800">{detailOrder.planNo || '-'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">客户名称</p>
                <p className="text-sm font-medium text-slate-800">{detailOrder.customerName} ({detailOrder.customerCode})</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">客户类型</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${detailOrder.customerType === '仓储型' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {detailOrder.customerType}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">仓库</p>
                <p className="text-sm font-medium text-slate-800">{detailOrder.storeName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">车牌号</p>
                <p className="text-sm font-medium text-slate-800">{detailOrder.plateNumber || '-'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">计划入库日期</p>
                <p className="text-sm font-medium text-slate-800">{detailOrder.plannedDate || '-'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">实际入库日期</p>
                <p className="text-sm font-medium text-slate-800">{detailOrder.actualDate}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">入库类型</p>
                <p className="text-sm font-medium text-slate-800">{detailOrder.inboundType}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">温层</p>
                <p className="text-sm font-medium text-slate-800">{detailOrder.temperatureZone}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">附件</p>
                <p className="text-sm font-medium text-slate-800">{detailOrder.attachment || '-'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">状态</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(detailOrder.status)}`}>
                  {detailOrder.status}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">入库明细</label>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">序号</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">货物编码</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">货物名称</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">规格型号</th>
                      {detailOrder.customerType === '仓储型' && (
                        <>
                          <th className="px-3 py-2 text-xs font-medium text-slate-600">计划数量</th>
                          <th className="px-3 py-2 text-xs font-medium text-slate-600">计划单位</th>
                        </>
                      )}
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">实际数量</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">实际单位</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">生产日期</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">有效期至</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">是否良品</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-600">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detailOrder.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-xs text-slate-500">{index + 1}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{item.goodsCode}</td>
                        <td className="px-3 py-2 text-xs text-slate-800">{item.goodsName}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{item.spec}</td>
                        {detailOrder.customerType === '仓储型' && (
                          <>
                            <td className="px-3 py-2 text-xs text-slate-600">{item.plannedQuantity}</td>
                            <td className="px-3 py-2 text-xs text-slate-600">{item.plannedUnit}</td>
                          </>
                        )}
                        <td className="px-3 py-2 text-xs text-slate-800">{item.actualQuantity}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{item.actualUnit}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{item.productionDate || '-'}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{item.expiryDate || '-'}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.isGoodQuality ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.isGoodQuality ? '是' : '否'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {item.isAbnormal ? (
                            <span className="text-red-600">{item.remark}</span>
                          ) : (
                            item.remark || '-'
                          )}
                        </td>
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
        isOpen={showSelectPlanModal}
        onClose={() => setShowSelectPlanModal(false)}
        title="选择入库计划"
        width="700px"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-xs font-medium text-slate-600">入库计划单号</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-600">客户名称</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-600">计划到货日期</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-600">仓库</th>
                  <th className="px-4 py-2 text-xs font-medium text-slate-600">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {availablePlans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-4 py-2 text-sm text-slate-800">{plan.planNo}</td>
                    <td className="px-4 py-2 text-sm text-slate-800">{plan.customerName}</td>
                    <td className="px-4 py-2 text-sm text-slate-800">{plan.plannedDate}</td>
                    <td className="px-4 py-2 text-sm text-slate-800">{plan.storeName}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handlePlanSelected(plan)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        选择
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {availablePlans.length === 0 && (
              <div className="py-8 text-center text-slate-500">暂无待入库的入库计划</div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
