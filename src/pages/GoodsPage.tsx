import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Download, Upload, Settings, X, AlertCircle } from 'lucide-react';
import { Goods, GoodsShelfLifeDetail } from '../types';
import { mockGoods } from '../mock/data';
import { Modal } from '../components/Modal';

const units = ['件', '箱', '瓶', '盒', '袋', '公斤', '吨'];

export function GoodsPage() {
  const [goods, setGoods] = useState<Goods[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingGoods, setEditingGoods] = useState<Goods | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailGoods, setDetailGoods] = useState<Goods | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    spec: '',
    unit: '件',
    unitWeight: 0,
    unitVolume: 0,
    shelfLifeDays: 0,
  });

  const [shelfLifeDetails, setShelfLifeDetails] = useState<GoodsShelfLifeDetail[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setGoods(mockGoods);
  }, []);

  const filteredGoods = goods.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.spec.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredGoods.length / itemsPerPage);
  const paginatedGoods = filteredGoods.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请填写货物名称';
    if (!formData.code.trim()) newErrors.code = '请填写货物编码';
    if (formData.code.length > 20) newErrors.code = '货物编码最多20个字符';
    if (formData.name.length > 50) newErrors.name = '货物名称最多50个字符';
    if (formData.spec.length > 100) newErrors.spec = '规格最多100个字符';
    if (formData.shelfLifeDays < 0 || formData.shelfLifeDays > 9999) newErrors.shelfLifeDays = '保质期需为0-9999的整数';
    
    const isCodeDuplicate = goods.some(
      (item) => item.code === formData.code && item.id !== editingGoods?.id
    );
    if (isCodeDuplicate) newErrors.code = '货物编码已存在';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = new Date().toLocaleString('zh-CN');
    
    if (editingGoods) {
      setGoods(
        goods.map((item) =>
          item.id === editingGoods.id
            ? { ...item, ...formData, shelfLifeDetails, updatedAt: now }
            : item
        )
      );
    } else {
      const newGoods: Goods = {
        id: String(Date.now()),
        ...formData,
        shelfLifeDetails,
        createdAt: now,
        updatedAt: now,
      };
      setGoods([newGoods, ...goods]);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', spec: '', unit: '件', unitWeight: 0, unitVolume: 0, shelfLifeDays: 0 });
    setShelfLifeDetails([]);
    setErrors({});
    setEditingGoods(null);
  };

  const handleEdit = (item: Goods) => {
    setEditingGoods(item);
    setFormData({
      name: item.name,
      code: item.code,
      spec: item.spec,
      unit: item.unit,
      unitWeight: item.unitWeight || 0,
      unitVolume: item.unitVolume || 0,
      shelfLifeDays: item.shelfLifeDays,
    });
    setShelfLifeDetails(item.shelfLifeDetails || []);
    setShowModal(true);
  };

  const handleDelete = (item: Goods) => {
    if (confirm(`确定要删除货物 "${item.name}" 吗？`)) {
      setGoods(goods.filter((g) => g.id !== item.id));
    }
  };

  const handleView = (item: Goods) => {
    setDetailGoods(item);
    setShowDetail(true);
  };

  const addShelfLifeDetail = () => {
    setShelfLifeDetails([
      ...shelfLifeDetails,
      {
        id: String(Date.now()),
        goodsId: editingGoods?.id || '',
        shelfLifeDays: 0,
      },
    ]);
  };

  const updateShelfLifeDetail = (index: number, value: number) => {
    const updated = [...shelfLifeDetails];
    updated[index] = { ...updated[index], shelfLifeDays: value };
    setShelfLifeDetails(updated);
  };

  const removeShelfLifeDetail = (index: number) => {
    setShelfLifeDetails(shelfLifeDetails.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索货物名称、编码、规格..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-80 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" />
            导出
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <Upload className="w-4 h-4" />
            导入
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <Settings className="w-4 h-4" />
            列设置
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新增货物
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">序号</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">货物名称</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">货物编码</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">规格</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">单位</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">单位重量（kg）</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">单位体积（m³）</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">保质期(天)</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">效期明细</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedGoods.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-500">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.code}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.spec || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.unit}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.unitWeight || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.unitVolume || '-'}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.shelfLifeDays}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.shelfLifeDetails && item.shelfLifeDetails.length > 0
                    ? `${item.shelfLifeDetails.length}条`
                    : '-'}
                </td>
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

        {paginatedGoods.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            {searchTerm ? '未找到匹配的货物' : '暂无货物数据'}
          </div>
        ) : (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              共 {filteredGoods.length} 条记录，显示第 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredGoods.length)} 条
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
        title={editingGoods ? '编辑货物' : '新增货物'}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">货物名称 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="请输入货物名称"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">货物编码 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.code ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="请输入货物编码"
            />
            {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">规格</label>
            <input
              type="text"
              value={formData.spec}
              onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.spec ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="请输入规格"
            />
            {errors.spec && <p className="mt-1 text-sm text-red-500">{errors.spec}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">单位 <span className="text-red-500">*</span></label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">单位重量（kg）</label>
            <input
              type="number"
              value={formData.unitWeight}
              onChange={(e) => setFormData({ ...formData, unitWeight: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入单位重量"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">单位体积（m³）</label>
            <input
              type="number"
              value={formData.unitVolume}
              onChange={(e) => setFormData({ ...formData, unitVolume: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入单位体积"
              min="0"
              step="0.001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">保质期（天）</label>
            <input
              type="number"
              value={formData.shelfLifeDays}
              onChange={(e) => setFormData({ ...formData, shelfLifeDays: parseInt(e.target.value) || 0 })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.shelfLifeDays ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="0表示未维护"
              min="0"
              max="9999"
            />
            {errors.shelfLifeDays && <p className="mt-1 text-sm text-red-500">{errors.shelfLifeDays}</p>}
            <p className="mt-1 text-xs text-slate-500">
              有效期至 = 生产日期 + 保质期（天），有效期至由系统自动计算，不允许手工修改。
            </p>
          </div>
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700">货物效期明细</label>
              <button
                onClick={addShelfLifeDetail}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加明细
              </button>
            </div>
            {shelfLifeDetails.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">暂无效期明细</p>
            ) : (
              <div className="space-y-2">
                {shelfLifeDetails.map((detail, index) => (
                  <div key={detail.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-500 w-8">#{index + 1}</span>
                    <input
                      type="number"
                      value={detail.shelfLifeDays}
                      onChange={(e) => updateShelfLifeDetail(index, parseInt(e.target.value) || 0)}
                      className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded"
                      placeholder="货物效期（天）"
                      min="0"
                    />
                    <button
                      onClick={() => removeShelfLifeDetail(index)}
                      className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500">
                货物效期明细用于库存统计报表中计算货物效期，同一货物可维护多个效期条件。
              </p>
            </div>
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
        title="货物详情"
        onClose={() => setShowDetail(false)}
      >
        {detailGoods && (
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">货物名称</span>
              <span className="font-medium">{detailGoods.name}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">货物编码</span>
              <span className="font-medium">{detailGoods.code}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">规格</span>
              <span className="font-medium">{detailGoods.spec || '-'}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">单位</span>
              <span className="font-medium">{detailGoods.unit}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">保质期（天）</span>
              <span className="font-medium">{detailGoods.shelfLifeDays}</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-3">
              <span className="text-sm font-medium text-slate-700">货物效期明细</span>
              {detailGoods.shelfLifeDetails && detailGoods.shelfLifeDetails.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {detailGoods.shelfLifeDetails.map((detail, index) => (
                    <div key={detail.id} className="flex justify-between text-sm">
                      <span className="text-slate-600">效期{index + 1}</span>
                      <span className="text-slate-800 font-medium">{detail.shelfLifeDays}天</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">暂无效期明细</p>
              )}
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">创建时间</span>
              <span className="font-medium">{detailGoods.createdAt}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">更新时间</span>
              <span className="font-medium">{detailGoods.updatedAt}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
