export interface GoodsShelfLifeDetail {
  id: string;
  goodsId: string;
  shelfLifeDays: number;
}

export interface Goods {
  id: string;
  name: string;
  code: string;
  spec: string;
  unit: string;
  shelfLifeDays: number;
  shelfLifeDetails: GoodsShelfLifeDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  code: string;
  name: string;
  type: '冷冻' | '冷藏' | '常温';
  location: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOutboundRule {
  id: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  goodsId: string;
  goodsCode: string;
  goodsName: string;
  shelfLifeDays: number;
  alertDays: number;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  contact: string;
  phone: string;
  address: string;
  customerType: '月库型' | '仓储型';
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  capacity: number;
  status: '正常' | '维修' | '停用';
  createdAt: string;
  updatedAt: string;
}

export interface BillItem {
  rowNumber: number;
  goodsId: string;
  goodsCode: string;
  goodsName: string;
  productionDate: string;
}

export interface BillData {
  items: BillItem[];
  documentDate: string;
}

export type PageTab = 
  | 'goods' 
  | 'stores' 
  | 'customerOutboundRule' 
  | 'customers';
