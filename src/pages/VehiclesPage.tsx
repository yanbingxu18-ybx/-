import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Vehicle } from '../types';
import { mockVehicles } from '../mock/data';
import { Modal } from '../components/Modal';

const statusColors: Record<string, string> = {
  '正常': 'bg-green-100 text-green-700',
  '维修': 'bg-yellow-100 text-yellow-700',
  '停用': 'bg-red-100 text-red-700',
};

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);

  const [formData, setFormData] = useState({
    plateNumber: '',
    driverName: '',
    driverPhone: '',
    vehicleType: '',
    capacity: 0,
    status: '正常' as '正常' | '维修' | '停用',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setVehicles(mockVehicles);
  }, []);

  const filteredVehicles = vehicles.filter(
    (item) =>
      item.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const paginatedVehicles = filteredVehicles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.plateNumber.trim()) newErrors.plateNumber = '请填写车牌号';
    if (!formData.driverName.trim()) newErrors.driverName = '请填写司机姓名';
    if (!formData.driverPhone.trim()) newErrors.driverPhone = '请填写司机电话';
    if (!formData.vehicleType.trim()) newErrors.vehicleType = '请填写车辆类型';
    if (!formData.capacity || formData.capacity <= 0) newErrors.capacity = '请输入有效载重量';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = new Date().toLocaleString('zh-CN');

    if (editingVehicle) {
      setVehicles(
        vehicles.map((item) =>
          item.id === editingVehicle.id
            ? { ...item, ...formData, updatedAt: now }
            : item
        )
      );
    } else {
      const newVehicle: Vehicle = {
        id: String(Date.now()),
        ...formData,
        createdAt: now,
        updatedAt: now,
      };
      setVehicles([newVehicle, ...vehicles]);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({ plateNumber: '', driverName: '', driverPhone: '', vehicleType: '', capacity: 0, status: '正常' });
    setErrors({});
    setEditingVehicle(null);
  };

  const handleEdit = (item: Vehicle) => {
    setEditingVehicle(item);
    setFormData({
      plateNumber: item.plateNumber,
      driverName: item.driverName,
      driverPhone: item.driverPhone,
      vehicleType: item.vehicleType,
      capacity: item.capacity,
      status: item.status,
    });
    setShowModal(true);
  };

  const handleDelete = (item: Vehicle) => {
    if (confirm(`确定要删除车辆 "${item.plateNumber}" 吗？`)) {
      setVehicles(vehicles.filter((v) => v.id !== item.id));
    }
  };

  const handleView = (item: Vehicle) => {
    setDetailVehicle(item);
    setShowDetail(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索车牌号、司机姓名..."
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
          新增车辆
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">序号</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">车牌号</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">司机姓名</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">司机电话</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">车辆类型</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">载重量(吨)</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">状态</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedVehicles.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-500">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.plateNumber}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.driverName}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.driverPhone}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.vehicleType}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.capacity}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </td>
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

        {paginatedVehicles.length === 0 ? (
          <div className="py-12 text-center text-slate-500">暂无车辆数据</div>
        ) : (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">共 {filteredVehicles.length} 条记录</span>
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
        title={editingVehicle ? '编辑车辆' : '新增车辆'}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">车牌号 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.plateNumber}
              onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg ${errors.plateNumber ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="请输入车牌号"
            />
            {errors.plateNumber && <p className="mt-1 text-sm text-red-500">{errors.plateNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">司机姓名 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.driverName}
              onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg ${errors.driverName ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="请输入司机姓名"
            />
            {errors.driverName && <p className="mt-1 text-sm text-red-500">{errors.driverName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">司机电话 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.driverPhone}
              onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg ${errors.driverPhone ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="请输入司机电话"
            />
            {errors.driverPhone && <p className="mt-1 text-sm text-red-500">{errors.driverPhone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">车辆类型 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg ${errors.vehicleType ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="如：冷藏车、冷冻车、常温货车"
            />
            {errors.vehicleType && <p className="mt-1 text-sm text-red-500">{errors.vehicleType}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">载重量(吨) <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              className={`w-full px-4 py-2 border rounded-lg ${errors.capacity ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="请输入载重量"
              min="1"
            />
            {errors.capacity && <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as '正常' | '维修' | '停用' })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="正常">正常</option>
              <option value="维修">维修</option>
              <option value="停用">停用</option>
            </select>
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
        title="车辆详情"
        onClose={() => setShowDetail(false)}
      >
        {detailVehicle && (
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">车牌号</span>
              <span className="font-medium">{detailVehicle.plateNumber}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">司机姓名</span>
              <span className="font-medium">{detailVehicle.driverName}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">司机电话</span>
              <span className="font-medium">{detailVehicle.driverPhone}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">车辆类型</span>
              <span className="font-medium">{detailVehicle.vehicleType}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">载重量(吨)</span>
              <span className="font-medium">{detailVehicle.capacity}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">状态</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[detailVehicle.status]}`}>
                {detailVehicle.status}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
