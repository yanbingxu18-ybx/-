import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, MapPin } from 'lucide-react';
import { Store } from '../types';
import { mockStores, addressSuggestions } from '../mock/data';
import { Modal } from '../components/Modal';

const storeTypes = ['冷冻', '冷藏', '常温'];

export function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState('全部');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailStore, setDetailStore] = useState<Store | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: '常温' as '冷冻' | '冷藏' | '常温',
    location: '',
    latitude: 0,
    longitude: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setStores(mockStores);
  }, []);

  const filteredStores = stores.filter((item) => {
    const matchCode = item.code.toLowerCase().includes(searchCode.toLowerCase());
    const matchName = item.name.toLowerCase().includes(searchName.toLowerCase());
    const matchType = searchType === '全部' || item.type === searchType;
    return matchCode && matchName && matchType;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const paginatedStores = filteredStores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) newErrors.code = '请输入仓库编码';
    if (formData.code.length > 20) newErrors.code = '仓库编码最多20个字符';
    if (!formData.name.trim()) newErrors.name = '请输入仓库名称';
    if (formData.name.length > 50) newErrors.name = '仓库名称最多50个字符';
    if (!storeTypes.includes(formData.type)) newErrors.type = '仓库类型不正确';
    if (!formData.location.trim()) newErrors.location = '请输入定位信息';
    if (formData.location.length > 200) newErrors.location = '定位信息最多200个字符';

    const isCodeDuplicate = stores.some(
      (item) => item.code === formData.code && item.id !== editingStore?.id
    );
    if (isCodeDuplicate) newErrors.code = '仓库编码已存在';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const now = new Date().toLocaleString('zh-CN');

    if (editingStore) {
      setStores(
        stores.map((item) =>
          item.id === editingStore.id
            ? { ...item, ...formData, updatedAt: now }
            : item
        )
      );
    } else {
      const newStore: Store = {
        id: String(Date.now()),
        ...formData,
        createdAt: now,
        updatedAt: now,
      };
      setStores([newStore, ...stores]);
    }

    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setFormData({ code: '', name: '', type: '常温', location: '', latitude: 0, longitude: 0 });
    setErrors({});
    setEditingStore(null);
    setShowMap(false);
  };

  const handleEdit = (item: Store) => {
    setEditingStore(item);
    setFormData({
      code: item.code,
      name: item.name,
      type: item.type,
      location: item.location,
      latitude: item.latitude,
      longitude: item.longitude,
    });
    setShowModal(true);
  };

  const handleDelete = (item: Store) => {
    if (confirm(`确定要删除仓库 "${item.name}" 吗？`)) {
      setStores(stores.filter((s) => s.id !== item.id));
    }
  };

  const handleView = (item: Store) => {
    setDetailStore(item);
    setShowDetail(true);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressInput(value);
    setShowSuggestions(value.length > 0);
  };

  const selectAddress = (address: string) => {
    const latitudes = [39.9042, 31.2304, 23.1291, 22.5431, 30.2741, 30.5728, 30.5928, 32.0603];
    const longitudes = [116.4074, 121.4737, 113.2644, 114.0579, 120.1551, 104.0668, 114.3055, 118.7969];
    const index = addressSuggestions.indexOf(address);
    setFormData({
      ...formData,
      location: address,
      latitude: latitudes[index] || 39.9042,
      longitude: longitudes[index] || 116.4074,
    });
    setAddressInput(address);
    setShowSuggestions(false);
  };

  const randomSelectLocation = () => {
    const randomIndex = Math.floor(Math.random() * addressSuggestions.length);
    selectAddress(addressSuggestions[randomIndex]);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '冷冻':
        return 'bg-blue-100 text-blue-700';
      case '冷藏':
        return 'bg-green-100 text-green-700';
      case '常温':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleReset = () => {
    setSearchCode('');
    setSearchName('');
    setSearchType('全部');
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="仓库编码"
            value={searchCode}
            onChange={(e) => {
              setSearchCode(e.target.value);
              setCurrentPage(1);
            }}
            className="w-48 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="仓库名称"
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              setCurrentPage(1);
            }}
            className="w-48 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={searchType}
            onChange={(e) => {
              setSearchType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="全部">全部类型</option>
            <option value="冷冻">冷冻</option>
            <option value="冷藏">冷藏</option>
            <option value="常温">常温</option>
          </select>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            重置
          </button>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增仓库
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">序号</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">仓库编码</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">仓库名称</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">仓库类型</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">定位信息</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedStores.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-500">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{item.code}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.location}</td>
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

        {paginatedStores.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            未找到匹配的仓库
          </div>
        ) : (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              共 {filteredStores.length} 条记录，显示第 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredStores.length)} 条
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
        title={editingStore ? '编辑仓库' : '新增仓库'}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">仓库编码 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={!!editingStore}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.code ? 'border-red-500' : 'border-slate-300'
              } ${editingStore ? 'bg-slate-100' : ''}`}
              placeholder="请输入仓库编码"
            />
            {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">仓库名称 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="请输入仓库名称"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">仓库类型 <span className="text-red-500">*</span></label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as '冷冻' | '冷藏' | '常温' })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {storeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">定位信息 <span className="text-red-500">*</span></label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={addressInput || formData.location}
                onChange={handleAddressChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="请输入地址或搜索"
              />
            </div>
            {showSuggestions && (
              <div className="mt-1 border border-slate-200 rounded-lg bg-white shadow-sm">
                {addressSuggestions
                  .filter((addr) => addr.toLowerCase().includes(addressInput.toLowerCase()))
                  .map((addr) => (
                    <button
                      key={addr}
                      onClick={() => selectAddress(addr)}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 text-sm"
                    >
                      {addr}
                    </button>
                  ))}
              </div>
            )}
            {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
          </div>
          <div>
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {showMap ? '收起地图' : '打开地图选择'}
            </button>
          </div>
          {showMap && (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <div className="h-48 bg-white border border-slate-200 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-slate-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-blue-400" />
                  <p>地图区域</p>
                  <p className="text-sm">当前位置：{formData.location || '未选择'}</p>
                </div>
              </div>
              <button
                onClick={randomSelectLocation}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                随机选择位置
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">纬度</label>
              <input
                type="text"
                value={formData.latitude.toFixed(6)}
                readOnly
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">经度</label>
              <input
                type="text"
                value={formData.longitude.toFixed(6)}
                readOnly
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100"
              />
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
        title="仓库详情"
        onClose={() => setShowDetail(false)}
      >
        {detailStore && (
          <div className="space-y-4">
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">仓库编码</span>
              <span className="font-medium">{detailStore.code}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">仓库名称</span>
              <span className="font-medium">{detailStore.name}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">仓库类型</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(detailStore.type)}`}>
                {detailStore.type}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">定位信息</span>
              <span className="font-medium">{detailStore.location}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">纬度</span>
              <span className="font-medium">{detailStore.latitude.toFixed(6)}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">经度</span>
              <span className="font-medium">{detailStore.longitude.toFixed(6)}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">创建时间</span>
              <span className="font-medium">{detailStore.createdAt}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">更新时间</span>
              <span className="font-medium">{detailStore.updatedAt}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
