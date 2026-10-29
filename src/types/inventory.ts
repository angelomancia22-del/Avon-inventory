export type ProductCategory =
  | 'All'
  | 'Skincare'
  | 'Fragrance'
  | 'Bath & Body'
  | 'Makeup'
  | 'Personal Care'
  | 'Demo & Samples';

export interface Product {
  id: string;
  sku: string; // e.g. "AVN-1082"
  lineCode: string; // 6-digit Avon brochure ordering code e.g. "548-912"
  name: string;
  category: Exclude<ProductCategory, 'All'>;
  brandLine: string; // e.g. "Skin So Soft", "Anew", "Far Away", "Glimmer"
  description: string;
  campaignIntroduced: string; // e.g. "Campaign 19"
  currentBrochureCampaign: string; // e.g. "Campaign 21"
  wholesaleCost: number; // What rep pays (e.g. $14.40)
  brochurePrice: number; // Customer retail price (e.g. $24.00)
  stockOnHand: number;
  stockReserved: number; // Allocated to open customer orders
  reorderThreshold: number; // Safety stock
  shelfLocation: string; // e.g. "Shelf A-2", "Drawer 1", "Bagging Station"
  batchExpiry?: string; // YYYY-MM
  imageUrl: string;
  isDemoSample: boolean;
  isFastMover: boolean;
  notes?: string;
  lastRestockedDate: string;
}

export type OrderStatus =
  | 'Pending Fulfillment'
  | 'Bagged & Packed'
  | 'Out for Delivery'
  | 'Delivered & Paid';

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  lineCode: string;
  quantity: number;
  unitRetailPrice: number;
  unitWholesaleCost: number;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string; // e.g. "ORD-C21-042"
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  campaign: string;
  orderDate: string;
  deliveryDateTarget: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  salesTaxPercent: number;
  salesTaxAmount: number;
  deliveryFee: number;
  totalDue: number;
  repProfit: number;
  sampleGifts: string[];
  paymentMethod: 'Cash on Delivery' | 'Venmo / Zelle' | 'Credit Card' | 'Check';
  isPaid: boolean;
  notes?: string;
}

export interface CampaignInfo {
  campaignNumber: number;
  name: string;
  theme: string;
  orderCutoffDate: string;
  deliveryArrivalDate: string;
  status: 'Active' | 'Upcoming' | 'Past';
  salesTarget: number;
  demoOrderDeadline: string;
}

export type StockMovementType =
  | 'Shipment Received'
  | 'Customer Order Fulfilled'
  | 'Stock Adjustment'
  | 'Demo Tester Handout'
  | 'Damaged / Expired'
  | 'Return to Avon';

export interface StockMovement {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  sku: string;
  type: StockMovementType;
  quantityDelta: number; // + for add, - for subtract
  resultingStock: number;
  reason: string;
  referenceId?: string; // e.g. PO # or Order #
}

export interface ShipmentReceipt {
  id: string;
  poNumber: string;
  invoiceNumber: string;
  campaign: string;
  receivedDate: string;
  carrier: string;
  trackingNumber: string;
  items: {
    productId: string;
    productName: string;
    lineCode: string;
    quantity: number;
    unitCost: number;
  }[];
  totalUnits: number;
  totalWholesaleCost: number;
}
