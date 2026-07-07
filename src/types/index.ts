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
  unitWeight: number;
  unitVolume: number;
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

export interface InboundPlanItem {
  id: string;
  planId: string;
  goodsId: string;
  goodsCode: string;
  goodsName: string;
  spec: string;
  plannedQuantity: number;
  plannedUnit: string;
  productionDate: string;
  expiryDate: string;
  remark: string;
}

export interface InboundPlan {
  id: string;
  planNo: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  plannedDate: string;
  inboundType: '正常入库' | '退货入库' | '拒收入库';
  storeId: string;
  storeName: string;
  plateNumber: string;
  temperatureZone: '冷藏' | '常温' | '冷冻' | '混装';
  status: '待入库' | '已生成入库单' | '已关闭';
  closeReason: string;
  closeBy: string;
  closeTime: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  items: InboundPlanItem[];
}

export interface InboundOrderItem {
  id: string;
  orderId: string;
  goodsId: string;
  goodsCode: string;
  goodsName: string;
  spec: string;
  plannedQuantity: number;
  plannedUnit: string;
  actualQuantity: number;
  actualUnit: string;
  productionDate: string;
  expiryDate: string;
  isGoodQuality: boolean;
  remark: string;
  isAbnormal: boolean;
  groupId?: string;
}

export interface InboundOrder {
  id: string;
  orderNo: string;
  planId: string;
  planNo: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  customerType: '月库型' | '仓储型';
  storeId: string;
  storeName: string;
  plateNumber: string;
  plannedDate: string;
  actualDate: string;
  inboundType: '正常入库' | '退货入库' | '拒收入库';
  temperatureZone: '冷藏' | '常温' | '冷冻' | '混装';
  attachment: string;
  status: '暂存' | '已生效';
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  items: InboundOrderItem[];
}

export interface StockStat {
  id: string;
  customerId: string;
  customerName: string;
  storeId: string;
  storeName: string;
  goodsId: string;
  goodsCode: string;
  goodsName: string;
  spec: string;
  stockQuantity: number;
  stockUnit: string;
  isGoodQuality: boolean;
  productionDate: string;
  expiryDate: string;
  goodsShelfLife: string;
}

export interface OutboundPlanItem {
  id: string;
  planId: string;
  goodsId: string;
  goodsCode: string;
  goodsName: string;
  spec: string;
  plannedQuantity: number;
  plannedUnit: string;
  totalWeight: number;
  totalVolume: number;
  goodsType: string;
  salesPrice: number;
  salesAmount: number;
  remark: string;
  productionDate: string;
  expiryDate: string;
  isGoodQuality: boolean;
  rowSource: 'original' | 'copied';
}

export interface OutboundPlan {
  id: string;
  planNo: string;
  businessType: '整车' | '零担' | '城配';
  customerOrderNo: string;
  department: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  deliveryArea: string;
  receivingArea: string;
  requiredDepartureTime: string;
  requiredArrivalTime: string;
  outboundType: '销售出库' | '退货出库' | '报废出库';
  storeId: string;
  storeName: string;
  plannedDate: string;
  remark: string;
  status: '待出库' | '已生成出库单' | '已关闭';
  closeReason: string;
  closeBy: string;
  closeTime: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  items: OutboundPlanItem[];
}

export interface OutboundOrderItem {
  id: string;
  orderId: string;
  goodsId: string;
  goodsCode: string;
  goodsName: string;
  spec: string;
  plannedQuantity: number;
  plannedUnit: string;
  actualQuantity: number;
  actualUnit: string;
  productionDate: string;
  expiryDate: string;
  isGoodQuality: boolean;
  actualSignedQuantity: number;
  remark: string;
}

export interface OutboundOrder {
  id: string;
  orderNo: string;
  planId: string;
  planNo: string;
  customerId: string;
  customerCode: string;
  customerName: string;
  storeId: string;
  storeName: string;
  plannedDate: string;
  actualDate: string;
  remark: string;
  status: '暂存' | '已出库';
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  items: OutboundOrderItem[];
}

export type PageTab = 
  | 'goods' 
  | 'stores' 
  | 'customerOutboundRule' 
  | 'customers'
  | 'inboundPlan'
  | 'inboundOrder'
  | 'stockStat'
  | 'outboundPlan'
  | 'outboundOrder';
