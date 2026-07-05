import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, AlertTriangle } from 'lucide-react';
import { CustomerOutboundRule } from '../types';
import { mockCustomerOutboundRules, mockGoods, mockCustomers } from '../mock/data';
import { Modal } from '../components/Modal';

export function CustomerOutboundRulePage() {
  const [rules, setRules] = useState<CustomerOutboundRule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<CustomerOutboundRule | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailRule, setDetailRule] = useState<CustomerOutboundRule | null>(null);

  const [formData, setFormData] = useState({
    customerId: '',
    goodsId: '',
    alertDays: 0,
    remark: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const goodsWithShelfLife = mockGoods.filter((g) => g.shelfLifeDays > 0);

  useEffect(() => {
    setRules(mockCustomerOutboundRules);
  }, []);

  const filteredRules = rules.filter(
    (item) =>
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.goodsName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.goodsCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredRules.length / itemsPerPage);
  const paginatedRules = filteredRules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const selectedCustomer = mockCustomers.find((c) => c.id === formData.customerId);
  const selectedGoods = goodsWithShelfLife.find((g) => g.id === formData.goodsId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerId) newErrors.customerId = '请选择客户';
    if (!formData.goodsId) newErrors.goodsId = '请选择货物';
    if (!formData.alertDays || formData.alertDays <= 0) newErrors.alertDays = '请输入有效的提醒天数';
    if (formData.alertDays > 9999) newErrors.alertDays = '提醒天数不能超过9999';
    if (selectedGoods && formData.alertDays > selectedGoods.shelfLifeDays) {
      newErrors.alertDays = '提醒天数不能超过保质期';
    }

    // 唯一性规则：客户 + 货物
    const isDuplicate = rules.some(
      (item) =>
        item.customerId === formData.customerId &&
        item.goodsId === formData.goodsId &&
        item.id !== editingRule?.id
    );
    if (isDuplicate) newErrors.goodsId = '该客户已配置此货物的出库规则，同一客户+货物组合只能维护一条规则';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = new Date().toLocaleString('zh-CN');
    const customer = mockCustomers.find((c) => c.id === formData.customerId);
    const goods = goodsWithShelfLife.find((g) => g.id === formData.goodsId);

    if (editingRule) {
      setRules(
        rules.map((item) =>
          item.id === editingRule.id
            ? {
                ...item,
                customerId: formData.customerId,
                customerCode: customer?.code || '',
                customerName: customer?.name || '',
                goodsId: formData.goodsId,
                goodsCode: goods?.code || '',
                goodsName: goods?.name || '',
                shelfLifeDays: goods?.shelfLifeDays || 0,
                alertDays: formData.alertDays,
                remark: formData.remark,
                updatedAt: now,
              }
            : item
        )
      );
    } else if (customer && goods) {
      const newRule: CustomerOutboundRule = {
        id: String(Date.now()),
        customerId: formData.customerId,
        customerCode: customer.code,
        customerName: customer.name,
        goodsId: formData.goodsId,
        goodsCode: goods.code,
        goodsName: goods.name,
        shelfLifeDays: goods.shelfLifeDays,
        alertDays: formData.alertDays,
        remark: formData.remark,
        createdAt: now,
        updatedAt: now,
      };
      setRules([newRule, ...rules]);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({ customerId: '', goodsId: '', alertDays: 0, remark: '' });
    setErrors({});
    setEditingRule(null);
  };

  const handleEdit = (item: CustomerOutboundRule) => {
    setEditingRule(item);
    setFormData({
      customerId: item.customerId,
      goodsId: item.goodsId,
      alertDays: item.alertDays,
      remark: item.remark,
    });
    setShowModal(true);
  };

  const handleDelete = (item: CustomerOutboundRule) => {
    if (confirm(`确定要删除客户 "${item.customerName}" 对货物 "${item.goodsName}" 的出库规则吗？`)) {
      setRules(rules.filter((r) => r.id !== item.id));
    }
  };

  const handleView = (item: CustomerOutboundRule) => {
    setDetailRule(item);
    setShowDetail(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索客户名称/编码或货物名称/编码..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-96 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSearchTerm('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            重置
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新增规则
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">序号</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">客户编码</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">客户名称</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">货物编码</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">货物名称</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">保质期(天)</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">货龄提醒天数</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">备注</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRules.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-500">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.customerCode}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.customerName}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.goodsCode}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.goodsName}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.shelfLifeDays}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                    {item.alertDays}天
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.remark || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(item)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="查看"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

        {paginatedRules.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            {searchTerm ? '未找到匹配的规则' : '暂无客户出库规则'}
          </div>
        ) : (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              共 {filteredRules.length} 条记录，显示第 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredRules.length)} 条
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm border rounded-lg ${
                    page === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        title={editingRule ? '编辑客户出库规则' : '新增客户出库规则'}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">客户 <span className="text-red-500">*</span></label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              disabled={!!editingRule}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.customerId ? 'border-red-500' : 'border-slate-300'
              } ${editingRule ? 'bg-slate-100' : ''}`}
            >
              <option value="">请选择客户</option>
              {mockCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.code} - {customer.name} ({customer.customerType})
                </option>
              ))}
            </select>
            {errors.customerId && <p className="mt-1 text-sm text-red-500">{errors.customerId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">货物 <span className="text-red-500">*</span></label>
            <select
              value={formData.goodsId}
              onChange={(e) => setFormData({ ...formData, goodsId: e.target.value })}
              disabled={!!editingRule}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.goodsId ? 'border-red-500' : 'border-slate-300'
              } ${editingRule ? 'bg-slate-100' : ''}`}
            >
              <option value="">请选择货物</option>
              {goodsWithShelfLife.map((goods) => (
                <option key={goods.id} value={goods.id}>
                  {goods.code} - {goods.name}
                </option>
              ))}
            </select>
            {errors.goodsId && <p className="mt-1 text-sm text-red-500">{errors.goodsId}</p>}
          </div>

          {selectedCustomer && selectedGoods && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600 text-sm">客户类型</span>
                <p className="font-medium">{selectedCustomer.customerType}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-600 text-sm">保质期（天）</span>
                <p className="font-medium">{selectedGoods.shelfLifeDays}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">货龄提醒天数 <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={formData.alertDays}
              onChange={(e) => setFormData({ ...formData, alertDays: parseInt(e.target.value) || 0 })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.alertDays ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="请输入提醒天数"
              min="1"
              max="9999"
            />
            {errors.alertDays && <p className="mt-1 text-sm text-red-500">{errors.alertDays}</p>}
            <p className="mt-1 text-xs text-slate-500">
              当出库单创建时，系统校验：当前日期 &gt; 生产日期 + 货龄提醒天数，则强校验不允许出库。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">备注</label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入备注信息"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDetail}
        title="客户出库规则详情"
        onClose={() => setShowDetail(false)}
      >
        {detailRule && (
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">客户编码</span>
              <span className="font-medium">{detailRule.customerCode}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">客户名称</span>
              <span className="font-medium">{detailRule.customerName}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">货物编码</span>
              <span className="font-medium">{detailRule.goodsCode}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">货物名称</span>
              <span className="font-medium">{detailRule.goodsName}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">保质期（天）</span>
              <span className="font-medium">{detailRule.shelfLifeDays}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">货龄提醒天数</span>
              <span className="font-medium">{detailRule.alertDays}天</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">备注</span>
              <span className="font-medium">{detailRule.remark || '-'}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">创建时间</span>
              <span className="font-medium">{detailRule.createdAt}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">更新时间</span>
              <span className="font-medium">{detailRule.updatedAt}</span>
            </div>
          </div>
        )}
      </Modal>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">客户出库规则说明</h4>
            <p className="text-sm text-yellow-700 mt-1">
              <strong>唯一性规则：</strong>同一客户、同一货物组合维度只能维护一个货龄提醒天数。
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              <strong>校验逻辑：</strong>出库计划未维护生产日期时，系统按「客户+仓库+货物+是否良品+有可用库存」自动匹配最早生产日期。若当前日期 &gt; 生产日期 + 货龄提醒天数，则强校验不允许出库。
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              <strong>提示语：</strong>当前货物自动匹配的生产日期已超过客户出库规则允许货龄，不允许出库。请取消本次出库，或指定库存中存在的其他生产日期后重试。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
