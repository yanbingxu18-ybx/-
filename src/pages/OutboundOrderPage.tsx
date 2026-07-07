import { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal';
import { OutboundOrder, OutboundOrderItem, OutboundPlan } from '../types';
import { mockOutboundOrders, mockCustomers, mockStores, mockGoods, mockStockStats, mockCustomerOutboundRules } from '../mock/data';

const calculateExpiryDate = (productionDate: string, shelfLifeDays: number): string => {
  if (!productionDate) return '';
  const date = new Date(productionDate);
  date.setDate(date.getDate() + shelfLifeDays);
  return date.toISOString().split('T')[0];
};

interface GenerateOrderData {
  plan: OutboundPlan | null;
}

export function OutboundOrderPage({ generateData, onCloseModal }: { generateData?: GenerateOrderData; onCloseModal?: () => void }) {
  const [orders, setOrders] = useState<OutboundOrder[]>(mockOutboundOrders);
  const [filteredOrders, setFilteredOrders] = useState<OutboundOrder[]>(mockOutboundOrders);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OutboundOrder | null>(null);
  const [detailOrder, setDetailOrder] = useState<OutboundOrder | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<OutboundOrder | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [filterData, setFilterData] = useState({
    orderNo: '',
    planNo: '',
    customerId: '',
    storeId: '',
    plannedDateStart: '',
    plannedDateEnd: '',
    actualDateStart: '',
    actualDateEnd: '',
    status: '',
    isAbnormalSigned: '',
  });

  const [formData, setFormData] = useState({
    orderNo: '',
    planId: '',
    planNo: '',
    customerId: '',
    customerCode: '',
    customerName: '',
    storeId: '',
    storeName: '',
    plannedDate: '',
    actualDate: '',
    remark: '',
  });

  const [items, setItems] = useState<OutboundOrderItem[]>([]);

  useEffect(() => {
    if (generateData?.plan) {
      const plan = generateData.plan;
      const existingOrder = orders.find(o => o.planId === plan.id && o.status === '暂存');
      if (existingOrder) {
        setEditingOrder(existingOrder);
        setFormData({
          orderNo: existingOrder.orderNo,
          planId: existingOrder.planId,
          planNo: existingOrder.planNo,
          customerId: existingOrder.customerId,
          customerCode: existingOrder.customerCode,
          customerName: existingOrder.customerName,
          storeId: existingOrder.storeId,
          storeName: existingOrder.storeName,
          plannedDate: existingOrder.plannedDate,
          actualDate: existingOrder.actualDate,
          remark: existingOrder.remark,
        });
        setItems([...existingOrder.items]);
      } else {
        generateOrderFromPlan(plan);
      }
      setShowModal(true);
    }
  }, [generateData]);

  const generateOrderNo = (customerCode: string) => {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const maxNo = orders
      .filter(o => o.orderNo.startsWith(`CKD${customerCode}${dateStr}`))
      .map(o => parseInt(o.orderNo.slice(-4)))
      .reduce((max, curr) => Math.max(max, curr), 0);
    return `CKD${customerCode}${dateStr}${String(maxNo + 1).padStart(4, '0')}`;
  };

  const generateOrderFromPlan = (plan: OutboundPlan) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const newItems: OutboundOrderItem[] = plan.items.map(item => {
      let productionDate = item.productionDate;
      let expiryDate = item.expiryDate;
      let actualQuantity = item.plannedQuantity;

      const stockBatches = mockStockStats
        .filter(stat => stat.customerId === plan.customerId && stat.storeId === plan.storeId && stat.goodsId === item.goodsId && stat.stockQuantity > 0)
        .sort((a, b) => new Date(a.productionDate).getTime() - new Date(b.productionDate).getTime());

      if (!productionDate) {
        if (stockBatches.length > 0) {
          productionDate = stockBatches[0].productionDate;
        }
      }

      if (productionDate) {
        const rule = mockCustomerOutboundRules.find(r => r.customerId === plan.customerId && r.goodsId === item.goodsId);
        if (rule) {
          const productionDateObj = new Date(productionDate);
          const alertDate = new Date(productionDateObj);
          alertDate.setDate(alertDate.getDate() + rule.alertDays);
          const alertDateStr = alertDate.toISOString().split('T')[0];

          if (todayStr > alertDateStr) {
            const otherBatches = stockBatches.filter(b => b.productionDate !== productionDate);
            if (otherBatches.length > 0) {
              productionDate = otherBatches[0].productionDate;
            } else {
              actualQuantity = 0;
            }
          }
        }

        if (!expiryDate) {
          const goods = mockGoods.find(g => g.id === item.goodsId);
          if (goods) {
            expiryDate = calculateExpiryDate(productionDate, goods.shelfLifeDays);
          }
        }
      }

      return {
        id: String(Date.now() + Math.random()),
        orderId: '',
        goodsId: item.goodsId,
        goodsCode: item.goodsCode,
        goodsName: item.goodsName,
        spec: item.spec,
        plannedQuantity: item.plannedQuantity,
        plannedUnit: item.plannedUnit,
        actualQuantity,
        actualUnit: item.plannedUnit,
        productionDate,
        expiryDate,
        isGoodQuality: item.isGoodQuality,
        actualSignedQuantity: 0,
        remark: '',
      };
    });

    setFormData({
      orderNo: generateOrderNo(plan.customerCode),
      planId: plan.id,
      planNo: plan.planNo,
      customerId: plan.customerId,
      customerCode: plan.customerCode,
      customerName: plan.customerName,
      storeId: plan.storeId,
      storeName: plan.storeName,
      plannedDate: plan.plannedDate,
      actualDate: '',
      remark: '',
    });
    setItems(newItems);
    setEditingOrder(null);
  };

  const handleSearch = () => {
    let result = [...orders];
    if (filterData.orderNo) result = result.filter(o => o.orderNo.includes(filterData.orderNo));
    if (filterData.planNo) result = result.filter(o => o.planNo.includes(filterData.planNo));
    if (filterData.customerId) result = result.filter(o => o.customerId === filterData.customerId);
    if (filterData.storeId) result = result.filter(o => o.storeId === filterData.storeId);
    if (filterData.plannedDateStart) result = result.filter(o => o.plannedDate >= filterData.plannedDateStart);
    if (filterData.plannedDateEnd) result = result.filter(o => o.plannedDate <= filterData.plannedDateEnd);
    if (filterData.actualDateStart) result = result.filter(o => o.actualDate >= filterData.actualDateStart);
    if (filterData.actualDateEnd) result = result.filter(o => o.actualDate <= filterData.actualDateEnd);
    if (filterData.status) result = result.filter(o => o.status === filterData.status);
    if (filterData.isAbnormalSigned === '是') {
      result = result.filter(o => o.items.some(i => i.actualQuantity !== i.actualSignedQuantity));
    } else if (filterData.isAbnormalSigned === '否') {
      result = result.filter(o => o.items.every(i => i.actualQuantity === i.actualSignedQuantity));
    }
    setFilteredOrders(result);
  };

  const handleReset = () => {
    setFilterData({
      orderNo: '',
      planNo: '',
      customerId: '',
      storeId: '',
      plannedDateStart: '',
      plannedDateEnd: '',
      actualDateStart: '',
      actualDateEnd: '',
      status: '',
      isAbnormalSigned: '',
    });
    setFilteredOrders([...orders]);
  };

  const updateItem = (index: number, field: keyof OutboundOrderItem, value: string | number | boolean) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'productionDate') {
      const goods = mockGoods.find(g => g.id === updated[index].goodsId);
      if (goods && value) {
        updated[index].expiryDate = calculateExpiryDate(value as string, goods.shelfLifeDays);
      } else {
        updated[index].expiryDate = '';
      }
    }
    
    setItems(updated);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const hasNonZeroActual = items.some(i => i.actualQuantity > 0);
    if (!hasNonZeroActual) {
      alert('当前出库单所有明细实际出库数量均为0，不允许保存为已出库。');
      return false;
    }
    items.forEach((item, index) => {
      if (item.actualQuantity < 0) {
        newErrors[`itemQuantity_${index}`] = '实际出库数量不能为负数';
      }
      if (item.actualQuantity > item.plannedQuantity) {
        newErrors[`itemQuantity_${index}`] = `实际出库数量(${item.actualQuantity})超过了计划出库数量(${item.plannedQuantity})，请调整后再保存`;
      }
      if (item.actualQuantity < item.plannedQuantity && item.actualUnit === item.plannedUnit && !item.remark.trim()) {
        newErrors[`itemRemark_${index}`] = '实际出库数量与计划出库数量不一致，请填写备注原因说明异常出库情况';
      }
      const goods = mockGoods.find(g => g.id === item.goodsId);
      if (goods && goods.shelfLifeDays > 0 && !item.productionDate) {
        newErrors[`itemRule_${index}`] = `商品【${item.goodsName}】已维护保质期，必须填写生产日期`;
      }
      if (item.productionDate) {
        const rule = mockCustomerOutboundRules.find(r => r.customerId === formData.customerId && r.goodsId === item.goodsId);
        if (rule) {
          const productionDateObj = new Date(item.productionDate);
          const alertDate = new Date(productionDateObj);
          alertDate.setDate(alertDate.getDate() + rule.alertDays);
          const alertDateStr = alertDate.toISOString().split('T')[0];

          if (todayStr > alertDateStr) {
            newErrors[`itemRule_${index}`] = `商品【${item.goodsName}】已超过货龄提醒天数(${rule.alertDays}天)，不允许出库。请更换其他批次或取消本次出库`;
          }
        }

        const stockStat = mockStockStats.find(
          s => s.customerId === formData.customerId &&
               s.storeId === formData.storeId &&
               s.goodsId === item.goodsId &&
               s.productionDate === item.productionDate &&
               s.isGoodQuality === item.isGoodQuality
        );

        if (!stockStat || stockStat.stockQuantity < item.actualQuantity) {
          const availableStock = stockStat ? stockStat.stockQuantity : 0;
          newErrors[`itemStock_${index}`] = `商品【${item.goodsName}】库存不足，当前库存(${availableStock})，实际出库数量(${item.actualQuantity})，超出${item.actualQuantity - availableStock}`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const order: OutboundOrder = {
      id: editingOrder?.id || String(Date.now()),
      orderNo: editingOrder?.orderNo || formData.orderNo,
      planId: formData.planId,
      planNo: formData.planNo,
      customerId: formData.customerId,
      customerCode: formData.customerCode,
      customerName: formData.customerName,
      storeId: formData.storeId,
      storeName: formData.storeName,
      plannedDate: formData.plannedDate,
      actualDate: formData.actualDate,
      remark: formData.remark,
      status: '已出库',
      createdBy: editingOrder?.createdBy || '管理员',
      createdAt: editingOrder?.createdAt || new Date().toLocaleString(),
      updatedBy: '管理员',
      updatedAt: new Date().toLocaleString(),
      items: items.map(item => ({ ...item, orderId: editingOrder?.id || String(Date.now()) })),
    };

    if (editingOrder) {
      setOrders(orders.map(o => o.id === order.id ? order : o));
      setFilteredOrders(filteredOrders.map(o => o.id === order.id ? order : o));
    } else {
      setOrders([order, ...orders]);
      setFilteredOrders([order, ...filteredOrders]);
    }

    resetForm();
    setShowModal(false);
    alert('出库单已保存为已出库');
  };

  const handleSaveDraft = () => {
    const order: OutboundOrder = {
      id: editingOrder?.id || String(Date.now()),
      orderNo: editingOrder?.orderNo || formData.orderNo,
      planId: formData.planId,
      planNo: formData.planNo,
      customerId: formData.customerId,
      customerCode: formData.customerCode,
      customerName: formData.customerName,
      storeId: formData.storeId,
      storeName: formData.storeName,
      plannedDate: formData.plannedDate,
      actualDate: '',
      remark: formData.remark,
      status: '暂存',
      createdBy: editingOrder?.createdBy || '管理员',
      createdAt: editingOrder?.createdAt || new Date().toLocaleString(),
      updatedBy: '管理员',
      updatedAt: new Date().toLocaleString(),
      items: items.map(item => ({ ...item, orderId: editingOrder?.id || String(Date.now()) })),
    };

    if (editingOrder) {
      setOrders(orders.map(o => o.id === order.id ? order : o));
      setFilteredOrders(filteredOrders.map(o => o.id === order.id ? order : o));
    } else {
      setOrders([order, ...orders]);
      setFilteredOrders([order, ...filteredOrders]);
    }

    resetForm();
    setShowModal(false);
    alert('出库单已暂存');
  };

  const requestDelete = (order: OutboundOrder) => {
    setDeletingOrder(order);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setOrders(orders.filter(o => o.id !== deletingOrder?.id));
    setFilteredOrders(filteredOrders.filter(o => o.id !== deletingOrder?.id));
    setShowDeleteModal(false);
    setDeletingOrder(null);
    alert('暂存出库单已删除，出库计划已释放');
  };

  const resetForm = () => {
    setFormData({
      orderNo: '',
      planId: '',
      planNo: '',
      customerId: '',
      customerCode: '',
      customerName: '',
      storeId: '',
      storeName: '',
      plannedDate: '',
      actualDate: '',
      remark: '',
    });
    setItems([]);
    setEditingOrder(null);
    setErrors({});
  };

  const handleEdit = (order: OutboundOrder) => {
    if (order.status !== '暂存') return;
    setEditingOrder(order);
    setFormData({
      orderNo: order.orderNo,
      planId: order.planId,
      planNo: order.planNo,
      customerId: order.customerId,
      customerCode: order.customerCode,
      customerName: order.customerName,
      storeId: order.storeId,
      storeName: order.storeName,
      plannedDate: order.plannedDate,
      actualDate: order.actualDate,
      remark: order.remark,
    });
    setItems([...order.items]);
    setShowModal(true);
  };

  const handleView = (order: OutboundOrder) => {
    setDetailOrder(order);
    setShowDetailModal(true);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case '暂存': return 'bg-yellow-100 text-yellow-700';
      case '已出库': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const isAbnormalSigned = (order: OutboundOrder) => {
    return order.items.some(i => i.actualSignedQuantity > 0 && i.actualQuantity !== i.actualSignedQuantity);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">出库单管理</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">出库单号</label>
            <input type="text" value={filterData.orderNo} onChange={(e) => setFilterData(prev => ({ ...prev, orderNo: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入单号" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">出库计划单号</label>
            <input type="text" value={filterData.planNo} onChange={(e) => setFilterData(prev => ({ ...prev, planNo: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="请输入计划单号" />
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
            <label className="block text-sm font-medium text-slate-700 mb-1">计划出库日期</label>
            <div className="flex gap-2">
              <input type="date" value={filterData.plannedDateStart} onChange={(e) => setFilterData(prev => ({ ...prev, plannedDateStart: e.target.value }))} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span className="flex items-center text-slate-400">~</span>
              <input type="date" value={filterData.plannedDateEnd} onChange={(e) => setFilterData(prev => ({ ...prev, plannedDateEnd: e.target.value }))} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">实际出库日期</label>
            <div className="flex gap-2">
              <input type="date" value={filterData.actualDateStart} onChange={(e) => setFilterData(prev => ({ ...prev, actualDateStart: e.target.value }))} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span className="flex items-center text-slate-400">~</span>
              <input type="date" value={filterData.actualDateEnd} onChange={(e) => setFilterData(prev => ({ ...prev, actualDateEnd: e.target.value }))} className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
            <select value={filterData.status} onChange={(e) => setFilterData(prev => ({ ...prev, status: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">全部</option>
              <option value="暂存">暂存</option>
              <option value="已出库">已出库</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">是否异常签收</label>
            <select value={filterData.isAbnormalSigned} onChange={(e) => setFilterData(prev => ({ ...prev, isAbnormalSigned: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">全部</option>
              <option value="是">是</option>
              <option value="否">否</option>
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
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">出库单号</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">出库计划单号</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">客户名称</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">仓库</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">计划出库日期</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">实际出库日期</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">是否异常签收</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td className="px-4 py-3 text-sm text-slate-700">{order.orderNo}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{order.planNo}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{order.customerName}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{order.storeName}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{order.plannedDate}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{order.actualDate || '-'}</td>
                <td className="px-4 py-3"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>{order.status}</span></td>
                <td className="px-4 py-3"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isAbnormalSigned(order) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{isAbnormalSigned(order) ? '是' : '否'}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => handleView(order)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    {order.status === '暂存' && (
                      <>
                        <button onClick={() => handleEdit(order)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => requestDelete(order)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
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

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); onCloseModal?.(); }} title={editingOrder ? '编辑出库单' : '新增出库单'} width="900px" allowHorizontalScroll={true}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">出库单号</label>
              <input type="text" value={formData.orderNo} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">出库计划单号</label>
              <input type="text" value={formData.planNo} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">客户名称</label>
              <input type="text" value={formData.customerName} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">仓库</label>
              <input type="text" value={formData.storeName} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">计划出库日期</label>
              <input type="date" value={formData.plannedDate} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">实际出库日期</label>
              <input type="date" value={formData.actualDate} onChange={(e) => setFormData(prev => ({ ...prev, actualDate: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
              <textarea value={formData.remark} onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
            </div>
          </div>

          {errors.allZero && <p className="text-xs text-red-500">{errors.allZero}</p>}

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">出库单明细</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden min-w-max">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">商品编码</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">商品名称</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">规格型号</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">计划出库数量</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">计划单位</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">实际出库数量</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">实际单位</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">生产日期</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">有效期至</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">是否良品</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">实际签收数量</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">备注</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-sm text-slate-700">{item.goodsCode}</td>
                      <td className="px-3 py-2 text-sm text-slate-700">{item.goodsName}</td>
                      <td className="px-3 py-2 text-sm text-slate-700">{item.spec}</td>
                      <td className="px-3 py-2 text-sm text-right text-slate-700">{item.plannedQuantity}</td>
                      <td className="px-3 py-2 text-sm text-slate-700">{item.plannedUnit}</td>
                      <td className="px-3 py-2">
                        <input type="number" min="0" value={item.actualQuantity || ''} onChange={(e) => updateItem(index, 'actualQuantity', parseInt(e.target.value) || 0)} className={`w-full px-2 py-1 text-sm text-right border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`itemQuantity_${index}`] || errors[`itemStock_${index}`] ? 'border-red-500' : 'border-slate-200'}`} />
                        {errors[`itemQuantity_${index}`] && <p className="text-xs text-red-500 mt-1">{errors[`itemQuantity_${index}`]}</p>}
                        {errors[`itemStock_${index}`] && <p className="text-xs text-red-500 mt-1">{errors[`itemStock_${index}`]}</p>}
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={item.actualUnit} onChange={(e) => updateItem(index, 'actualUnit', e.target.value)} className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="date" value={item.productionDate} onChange={(e) => updateItem(index, 'productionDate', e.target.value)} className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        {errors[`itemRule_${index}`] && <p className="text-xs text-red-500 mt-1">{errors[`itemRule_${index}`]}</p>}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-700">{item.expiryDate || '-'}</td>
                      <td className="px-3 py-2">
                        <select value={String(item.isGoodQuality)} onChange={(e) => updateItem(index, 'isGoodQuality', e.target.value === 'true')} className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="true">是</option>
                          <option value="false">否</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min="0" value={item.actualSignedQuantity || ''} readOnly className="w-full px-2 py-1 text-sm text-right border border-slate-200 rounded bg-slate-50 cursor-not-allowed" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="text" value={item.remark} onChange={(e) => updateItem(index, 'remark', e.target.value)} className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors[`itemRemark_${index}`] ? 'border-red-500' : 'border-slate-200'}`} />
                        {errors[`itemRemark_${index}`] && <p className="text-xs text-red-500 mt-1">{errors[`itemRemark_${index}`]}</p>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={handleSaveDraft} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              暂存
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              保存为已出库
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletingOrder(null); }} title="确认删除">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">确定要删除出库单 <span className="font-medium">{deletingOrder?.orderNo}</span> 吗？</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowDeleteModal(false); setDeletingOrder(null); }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              确认
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setDetailOrder(null); }} title="出库单详情" width="900px">
        {detailOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm text-slate-500">出库单号：</span><span className="text-sm font-medium">{detailOrder.orderNo}</span></div>
              <div><span className="text-sm text-slate-500">出库计划单号：</span><span className="text-sm">{detailOrder.planNo}</span></div>
              <div><span className="text-sm text-slate-500">客户名称：</span><span className="text-sm">{detailOrder.customerName}</span></div>
              <div><span className="text-sm text-slate-500">仓库：</span><span className="text-sm">{detailOrder.storeName}</span></div>
              <div><span className="text-sm text-slate-500">计划出库日期：</span><span className="text-sm">{detailOrder.plannedDate}</span></div>
              <div><span className="text-sm text-slate-500">实际出库日期：</span><span className="text-sm">{detailOrder.actualDate || '-'}</span></div>
              <div><span className="text-sm text-slate-500">状态：</span><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(detailOrder.status)}`}>{detailOrder.status}</span></div>
              <div><span className="text-sm text-slate-500">是否异常签收：</span><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isAbnormalSigned(detailOrder) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{isAbnormalSigned(detailOrder) ? '是' : '否'}</span></div>
              {detailOrder.remark && <div className="col-span-2"><span className="text-sm text-slate-500">备注：</span><span className="text-sm">{detailOrder.remark}</span></div>}
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">出库单明细</h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">商品编码</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">商品名称</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">规格型号</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">计划出库数量</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">计划单位</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">实际出库数量</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">实际单位</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">生产日期</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">有效期至</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">是否良品</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">实际签收数量</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailOrder.items.map(item => (
                      <tr key={item.id} className="border-t border-slate-100">
                        <td className="px-3 py-2 text-sm text-slate-700">{item.goodsCode}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.goodsName}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.spec}</td>
                        <td className="px-3 py-2 text-sm text-right text-slate-700">{item.plannedQuantity}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.plannedUnit}</td>
                        <td className="px-3 py-2 text-sm text-right text-slate-700">{item.actualQuantity}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.actualUnit}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.productionDate || '-'}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.expiryDate || '-'}</td>
                        <td className="px-3 py-2"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.isGoodQuality ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.isGoodQuality ? '是' : '否'}</span></td>
                        <td className="px-3 py-2 text-sm text-right text-slate-700">{item.actualSignedQuantity || '-'}</td>
                        <td className="px-3 py-2 text-sm text-slate-700">{item.remark || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}