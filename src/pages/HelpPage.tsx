import { useState } from 'react';
import { Search, HelpCircle, FileText, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

export function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: '如何新增货物？',
      answer: '在左侧菜单中点击「货物管理」，进入货物管理页面后点击右上角「新增货物」按钮，填写货物名称、编码、规格、单位和保质期等信息，点击保存即可完成新增。',
    },
    {
      question: '仓库类型有哪些？',
      answer: '系统支持三种仓库类型：冷冻仓库（温度低于0°C）、冷藏仓库（温度0-10°C）和常温仓库（普通温度）。在新增仓库时需要从预定义列表中选择仓库类型。',
    },
    {
      question: '货龄提醒规则如何配置？',
      answer: '在「货龄提醒」页面点击「新增规则」，选择已维护保质期的货物，设置提醒天数。当货物货龄超过设置的提醒天数时，系统会在入库/出库时弹出风险提示。',
    },
    {
      question: '如何进行仓库定位？',
      answer: '在新增或编辑仓库时，在定位信息输入框中输入地址关键字，系统会返回匹配的地址列表供选择；也可以点击「打开地图选择」按钮，通过模拟地图选点功能随机选择位置。',
    },
    {
      question: '如何查看货物详情？',
      answer: '在货物列表中，点击对应货物的「查看」按钮，系统会弹出详情弹窗，展示货物的完整信息，包括名称、编码、规格、单位、保质期以及创建和更新时间。',
    },
  ];

  const documents = [
    { title: '系统操作手册', description: '系统功能的详细操作指南', size: '2.5MB' },
    { title: '货物管理说明', description: '货物档案的维护和管理方法', size: '1.2MB' },
    { title: '仓库管理说明', description: '仓库信息维护和定位功能说明', size: '800KB' },
    { title: '货龄提醒规则', description: '货龄提醒功能的配置和使用说明', size: '500KB' },
  ];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <HelpCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">帮助中心</h2>
          <p className="text-slate-500 mt-2">查找常见问题解答或联系技术支持</p>
        </div>

        <div className="relative mb-8">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索帮助文档..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">常见问题</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {faqs.map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium text-slate-800">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">下载文档</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{doc.title}</h4>
                    <p className="text-sm text-slate-500">{doc.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">{doc.size}</p>
                    <button className="text-sm text-blue-600 hover:underline">下载</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-8 text-white text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-2">需要更多帮助？</h3>
          <p className="opacity-90 mb-6">联系我们的技术支持团队获取帮助</p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
              在线咨询
            </button>
            <button className="px-6 py-3 bg-blue-400 text-white font-medium rounded-lg hover:bg-blue-300 transition-colors">
              电话支持
            </button>
          </div>
          <p className="mt-4 text-sm opacity-80">工作时间：周一至周五 9:00-18:00</p>
        </div>
      </div>
    </div>
  );
}
