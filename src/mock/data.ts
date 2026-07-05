import { Goods, Store, CustomerOutboundRule, Customer, Vehicle } from '../types';

export const mockGoods: Goods[] = [
  { 
    id: '1', 
    name: '可口可乐', 
    code: 'COKE001', 
    spec: '500ml', 
    unit: '件', 
    shelfLifeDays: 365, 
    shelfLifeDetails: [
      { id: 'd1', goodsId: '1', name: '常规', value: '常温', shelfLifeDays: 365 },
      { id: 'd2', goodsId: '1', name: '冷藏', value: '2-8℃', shelfLifeDays: 730 },
    ],
    createdAt: '2026-01-10 10:00:00', 
    updatedAt: '2026-01-10 10:00:00' 
  },
  { 
    id: '2', 
    name: '百事可乐', 
    code: 'PEPSI001', 
    spec: '330ml', 
    unit: '箱', 
    shelfLifeDays: 365, 
    shelfLifeDetails: [
      { id: 'd3', goodsId: '2', name: '常规', value: '常温', shelfLifeDays: 365 },
    ],
    createdAt: '2026-01-11 11:00:00', 
    updatedAt: '2026-01-11 11:00:00' 
  },
  { 
    id: '3', 
    name: '蒙牛纯牛奶', 
    code: 'MENGNIU', 
    spec: '250ml*12盒', 
    unit: '箱', 
    shelfLifeDays: 180, 
    shelfLifeDetails: [
      { id: 'd4', goodsId: '3', name: '常温', value: '25℃以下', shelfLifeDays: 180 },
      { id: 'd5', goodsId: '3', name: '冷藏', value: '2-6℃', shelfLifeDays: 360 },
    ],
    createdAt: '2026-02-01 09:00:00', 
    updatedAt: '2026-02-01 09:00:00' 
  },
  { 
    id: '4', 
    name: '伊利酸奶', 
    code: 'YILI001', 
    spec: '100g*8杯', 
    unit: '箱', 
    shelfLifeDays: 21, 
    shelfLifeDetails: [
      { id: 'd6', goodsId: '4', name: '冷藏', value: '2-6℃', shelfLifeDays: 21 },
    ],
    createdAt: '2026-02-15 14:00:00', 
    updatedAt: '2026-02-15 14:00:00' 
  },
  { 
    id: '5', 
    name: '红牛饮料', 
    code: 'HONGNIU', 
    spec: '250ml', 
    unit: '件', 
    shelfLifeDays: 540, 
    shelfLifeDetails: [
      { id: 'd7', goodsId: '5', name: '常规', value: '常温', shelfLifeDays: 540 },
    ],
    createdAt: '2026-03-01 10:00:00', 
    updatedAt: '2026-03-01 10:00:00' 
  },
  { 
    id: '6', 
    name: '农夫山泉', 
    code: 'NONGFU', 
    spec: '550ml', 
    unit: '件', 
    shelfLifeDays: 730, 
    shelfLifeDetails: [
      { id: 'd8', goodsId: '6', name: '常规', value: '常温', shelfLifeDays: 730 },
    ],
    createdAt: '2026-03-10 08:00:00', 
    updatedAt: '2026-03-10 08:00:00' 
  },
  { 
    id: '7', 
    name: '统一冰红茶', 
    code: 'TONGYI', 
    spec: '500ml', 
    unit: '件', 
    shelfLifeDays: 365, 
    shelfLifeDetails: [
      { id: 'd9', goodsId: '7', name: '常规', value: '常温', shelfLifeDays: 365 },
    ],
    createdAt: '2026-04-01 09:00:00', 
    updatedAt: '2026-04-01 09:00:00' 
  },
  { 
    id: '8', 
    name: '康师傅方便面', 
    code: 'KANGSHIFU', 
    spec: '5连包', 
    unit: '箱', 
    shelfLifeDays: 180, 
    shelfLifeDetails: [
      { id: 'd10', goodsId: '8', name: '常规', value: '常温', shelfLifeDays: 180 },
    ],
    createdAt: '2026-04-15 11:00:00', 
    updatedAt: '2026-04-15 11:00:00' 
  },
  { 
    id: '9', 
    name: '旺仔牛奶', 
    code: 'WANGZAI', 
    spec: '245ml*12罐', 
    unit: '箱', 
    shelfLifeDays: 365, 
    shelfLifeDetails: [
      { id: 'd11', goodsId: '9', name: '常规', value: '常温', shelfLifeDays: 365 },
    ],
    createdAt: '2026-05-01 10:00:00', 
    updatedAt: '2026-05-01 10:00:00' 
  },
  { 
    id: '10', 
    name: '青岛啤酒', 
    code: 'QINGDAO', 
    spec: '500ml*6瓶', 
    unit: '箱', 
    shelfLifeDays: 180, 
    shelfLifeDetails: [
      { id: 'd12', goodsId: '10', name: '常温', value: '25℃以下', shelfLifeDays: 180 },
      { id: 'd13', goodsId: '10', name: '冷藏', value: '0-10℃', shelfLifeDays: 360 },
    ],
    createdAt: '2026-05-10 14:00:00', 
    updatedAt: '2026-05-10 14:00:00' 
  },
];

export const mockStores: Store[] = [
  { id: '1', code: 'CK001', name: '北京冷冻仓库', type: '冷冻', location: '北京市朝阳区建国路88号', latitude: 39.9042, longitude: 116.4074, createdAt: '2026-01-01 09:00:00', updatedAt: '2026-01-01 09:00:00' },
  { id: '2', code: 'CK002', name: '上海冷藏仓库', type: '冷藏', location: '上海市浦东新区陆家嘴环路1000号', latitude: 31.2304, longitude: 121.4737, createdAt: '2026-01-05 10:00:00', updatedAt: '2026-01-05 10:00:00' },
  { id: '3', code: 'CK003', name: '广州常温仓库', type: '常温', location: '广州市天河区珠江新城花城大道88号', latitude: 23.1291, longitude: 113.2644, createdAt: '2026-02-01 09:00:00', updatedAt: '2026-02-01 09:00:00' },
  { id: '4', code: 'CK004', name: '深圳冷冻仓库', type: '冷冻', location: '深圳市南山区科技园路100号', latitude: 22.5431, longitude: 114.0579, createdAt: '2026-02-10 11:00:00', updatedAt: '2026-02-10 11:00:00' },
  { id: '5', code: 'CK005', name: '杭州冷藏仓库', type: '冷藏', location: '杭州市西湖区文三路478号', latitude: 30.2741, longitude: 120.1551, createdAt: '2026-03-01 10:00:00', updatedAt: '2026-03-01 10:00:00' },
  { id: '6', code: 'CK006', name: '成都常温仓库', type: '常温', location: '成都市高新区天府大道北段1700号', latitude: 30.5728, longitude: 104.0668, createdAt: '2026-03-15 09:00:00', updatedAt: '2026-03-15 09:00:00' },
  { id: '7', code: 'CK007', name: '武汉冷冻仓库', type: '冷冻', location: '武汉市江汉区解放大道688号', latitude: 30.5928, longitude: 114.3055, createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-01 10:00:00' },
  { id: '8', code: 'CK008', name: '南京冷藏仓库', type: '冷藏', location: '南京市鼓楼区中山路100号', latitude: 32.0603, longitude: 118.7969, createdAt: '2026-04-10 09:00:00', updatedAt: '2026-04-10 09:00:00' },
];

export const mockCustomerOutboundRules: CustomerOutboundRule[] = [
  { id: '1', customerId: '1', customerCode: 'BH001', customerName: '北京华联超市', goodsId: '1', goodsCode: 'COKE001', goodsName: '可口可乐', shelfLifeDays: 365, alertDays: 180, remark: '夏季需重点关注', createdAt: '2026-02-01 10:00:00', updatedAt: '2026-02-01 10:00:00' },
  { id: '2', customerId: '1', customerCode: 'BH001', customerName: '北京华联超市', goodsId: '3', goodsCode: 'MENGNIU', goodsName: '蒙牛纯牛奶', shelfLifeDays: 180, alertDays: 150, remark: '', createdAt: '2026-02-10 11:00:00', updatedAt: '2026-02-10 11:00:00' },
  { id: '3', customerId: '2', customerCode: 'JLF001', customerName: '上海家乐福', goodsId: '1', goodsCode: 'COKE001', goodsName: '可口可乐', shelfLifeDays: 365, alertDays: 200, remark: '', createdAt: '2026-03-01 10:00:00', updatedAt: '2026-03-01 10:00:00' },
  { id: '4', customerId: '2', customerCode: 'JLF001', customerName: '上海家乐福', goodsId: '4', goodsCode: 'YILI001', goodsName: '伊利酸奶', shelfLifeDays: 21, alertDays: 14, remark: '酸奶保质期短，严格控制', createdAt: '2026-03-15 09:00:00', updatedAt: '2026-03-15 09:00:00' },
  { id: '5', customerId: '3', customerCode: 'WEM001', customerName: '广州沃尔玛', goodsId: '8', goodsCode: 'KANGSHIFU', goodsName: '康师傅方便面', shelfLifeDays: 180, alertDays: 120, remark: '', createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-01 10:00:00' },
];

export const mockCustomers: Customer[] = [
  { id: '1', name: '北京华联超市', code: 'BH001', contact: '张先生', phone: '13800138001', address: '北京市朝阳区', customerType: '月库型', createdAt: '2026-01-01 10:00:00', updatedAt: '2026-01-01 10:00:00' },
  { id: '2', name: '上海家乐福', code: 'JLF001', contact: '李女士', phone: '13800138002', address: '上海市浦东新区', customerType: '仓储型', createdAt: '2026-01-05 11:00:00', updatedAt: '2026-01-05 11:00:00' },
  { id: '3', name: '广州沃尔玛', code: 'WEM001', contact: '王经理', phone: '13800138003', address: '广州市天河区', customerType: '月库型', createdAt: '2026-02-01 09:00:00', updatedAt: '2026-02-01 09:00:00' },
  { id: '4', name: '深圳华润万家', code: 'HRWJ001', contact: '陈先生', phone: '13800138004', address: '深圳市南山区', customerType: '仓储型', createdAt: '2026-02-10 10:00:00', updatedAt: '2026-02-10 10:00:00' },
];

export const mockVehicles: Vehicle[] = [
  { id: '1', plateNumber: '京A12345', driverName: '刘师傅', driverPhone: '13900139001', vehicleType: '冷藏车', capacity: 10, status: '正常', createdAt: '2026-01-01 09:00:00', updatedAt: '2026-01-01 09:00:00' },
  { id: '2', plateNumber: '沪B67890', driverName: '赵师傅', driverPhone: '13900139002', vehicleType: '冷冻车', capacity: 15, status: '正常', createdAt: '2026-01-05 10:00:00', updatedAt: '2026-01-05 10:00:00' },
  { id: '3', plateNumber: '粤C11111', driverName: '孙师傅', driverPhone: '13900139003', vehicleType: '常温货车', capacity: 20, status: '维修', createdAt: '2026-02-01 09:00:00', updatedAt: '2026-02-01 09:00:00' },
  { id: '4', plateNumber: '粤D22222', driverName: '周师傅', driverPhone: '13900139004', vehicleType: '冷藏车', capacity: 8, status: '正常', createdAt: '2026-02-10 11:00:00', updatedAt: '2026-02-10 11:00:00' },
];

export const addressSuggestions = [
  '北京市朝阳区建国路88号',
  '上海市浦东新区陆家嘴环路1000号',
  '广州市天河区珠江新城花城大道88号',
  '深圳市南山区科技园路100号',
  '杭州市西湖区文三路478号',
  '成都市高新区天府大道北段1700号',
  '武汉市江汉区解放大道688号',
  '南京市鼓楼区中山路100号',
];
