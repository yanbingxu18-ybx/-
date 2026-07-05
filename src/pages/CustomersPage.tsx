import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Customer } from '../types';
import { mockCustomers } from '../mock/data';
import { Modal } from '../components/Modal';

const customerTypes = [
  { value: '月库型', label: '月库型' },
  { value: '仓储型', label: '仓储型' },
];

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact: '',
    phone: '',
    address: '',
    customerType: '月库型' as '月库型' | '仓储型',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setCustomers(mockCustomers);
  }, []);

  const filteredCustomers = customers.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请填写客户名称';
    if (!formData.code.trim()) newErrors.code = '请填写客户编码';
    if (!formData.contact.trim()) newErrors.contact = '请填写联系人';
    if (!formData.phone.trim()) newErrors.phone = '请填写联系电话';

    const isCodeDuplicate = customers.some(
      (item) => item.code === formData.code && item.id !== editingCustomer?.id
    );
    if (isCodeDuplicate) newErrors.code = '客户编码已存在';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = new Date().toLocaleString('zh-CN');

    if (editingCustomer) {
      setCustomers(
        customers.map((item) =>
          item.id === editingCustomer.id
            ? { ...item, ...formData, updatedAt: now }
            : item
        )
      );
    } else {
      const newCustomer: Customer = {
        id: String(Date.now()),
        ...formData,
        createdAt: now,
        updatedAt: now,
      };
      setCustomers([newCustomer, ...customers]);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', contact: '', phone: '', address: '', customerType: '月库型' });
    setErrors({});
    setEditingCustomer(null);
  };

  const handleEdit = (item: Customer) => {
    setEditingCustomer(item);
    setFormData({
      name: item.name,
      code: item.code,
      contact: item.contact,
      phone: item.phone,
      address: item.address,
      customerType: item.customerType,
    });
    setShowModal(true);
  };

  const handleDelete = (item: Customer) => {
    if (confirm(`确定要删除客户 "${item.name}" 吗？`)) {
      setCustomers(customers.filter((c) => c.id !== item.id));
    }
  };

  const handleView = (item: Customer) => {
    setDetailCustomer(item);
    setShowDetail(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索客户名称、编码、联系人..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-80 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增客户
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">序号</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">客户名称</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">客户编码</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">客户类型</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">联系人</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">联系电话</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">地址</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedCustomers.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-500">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.code}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.customerType === '月库型'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {item.customerType}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.contact}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.phone}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.address}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(item)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedCustomers.length === 0 ? (
          <div className="py-12 text-center text-slate-500">暂无客户数据</div>
        ) : (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">共 {filteredCustomers.length} 条记录</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-slate-300 rounded-lg disabled:opacity-50"
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm border rounded-lg ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-slate-300 rounded-lg disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        title={editingCustomer ? '编辑客户' : '新增客户'}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">客户名称 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="请输入客户名称"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">客户编码 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg ${errors.code ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="请输入客户编码"
            />
            {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">客户类型 <span className="text-red-500">*</span></label>
            <select
              value={formData.customerType}
              onChange={(e) => setFormData({ ...formData, customerType: e.target.value as '月库型' | '仓储型' })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {customerTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              月库型：按月结算仓储费用；仓储型：按实际存储量结算仓储费用。
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">联系人 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg ${errors.contact ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="请输入联系人"
            />
            {errors.contact && <p className="mt-1 text-sm text-red-500">{errors.contact}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">联系电话 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="请输入联系电话"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">地址</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              placeholder="请输入地址"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg"
            >
              取消
            </button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              保存
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDetail}
        title="客户详情"
        onClose={() => setShowDetail(false)}
      >
        {detailCustomer && (
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">客户名称</span>
              <span className="font-medium">{detailCustomer.name}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">客户编码</span>
              <span className="font-medium">{detailCustomer.code}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">客户类型</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                detailCustomer.customerType === '月库型'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {detailCustomer.customerType}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">联系人</span>
              <span className="font-medium">{detailCustomer.contact}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">联系电话</span>
              <span className="font-medium">{detailCustomer.phone}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">地址</span>
              <span className="font-medium">{detailCustomer.address}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
