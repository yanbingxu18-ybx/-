import { useState } from 'react';
import { User, Bell, Shield, Database, Palette, Save } from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('user');

  const tabs = [
    { id: 'user', label: '用户管理', icon: User },
    { id: 'notification', label: '通知设置', icon: Bell },
    { id: 'security', label: '安全设置', icon: Shield },
    { id: 'database', label: '数据管理', icon: Database },
    { id: 'appearance', label: '外观设置', icon: Palette },
  ];

  const users = [
    { id: 1, name: '管理员', email: 'admin@wht.com', role: '管理员', status: '在线' },
    { id: 2, name: '张三', email: 'zhangsan@wht.com', role: '仓管员', status: '在线' },
    { id: 3, name: '李四', email: 'lisi@wht.com', role: '业务员', status: '离线' },
  ];

  return (
    <div className="p-6">
      <div className="flex gap-6">
        <div className="w-64 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">系统设置</h3>
          </div>
          <ul className="p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">
              {tabs.find((t) => t.id === activeTab)?.label}
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Save className="w-4 h-4" />
              保存设置
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'user' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">ID</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">用户名</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">邮箱</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">角色</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">状态</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-600">{user.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.role}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === '在线' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                            编辑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'notification' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-800">邮件通知</h4>
                    <p className="text-sm text-slate-500">当有重要事件时发送邮件通知</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-800">短信通知</h4>
                    <p className="text-sm text-slate-500">当有紧急事件时发送短信通知</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-800">系统消息</h4>
                    <p className="text-sm text-slate-500">在系统内显示消息通知</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">会话超时时间</label>
                  <select className="w-48 px-4 py-2 border border-slate-300 rounded-lg">
                    <option>15分钟</option>
                    <option selected>30分钟</option>
                    <option>1小时</option>
                    <option>2小时</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">密码最小长度</label>
                  <input type="number" defaultValue={8} className="w-48 px-4 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600" />
                  <span className="text-sm text-slate-700">要求密码包含字母和数字</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600" />
                  <span className="text-sm text-slate-700">登录失败5次锁定账号</span>
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    数据库备份计划：每日凌晨2:00自动备份
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button className="px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50">
                    手动备份数据库
                  </button>
                  <button className="px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50">
                    恢复数据库
                  </button>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-800 mb-2">最近备份记录</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">2026-06-20 02:00:00</span>
                      <span className="text-green-600">成功</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">2026-06-19 02:00:00</span>
                      <span className="text-green-600">成功</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">2026-06-18 02:00:00</span>
                      <span className="text-green-600">成功</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">主题颜色</label>
                  <div className="flex gap-4">
                    {['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600', 'bg-red-600'].map((color) => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-full ${color} ${color === 'bg-blue-600' ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                      ></button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">侧边栏样式</label>
                  <select className="w-48 px-4 py-2 border border-slate-300 rounded-lg">
                    <option selected>深色</option>
                    <option>浅色</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
