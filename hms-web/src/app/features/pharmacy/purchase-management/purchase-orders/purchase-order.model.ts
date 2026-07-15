export type PurchaseOrderStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  productName: string;
  productTypeName: string | null;
  packing: number;
  qty: number;
  totalQty: number;
  orderQty: number | null;
}

export interface PurchaseOrder {
  id: number;
  poNumber: number;
  supplierId: number;
  supplierName: string;
  supplierContactPersonName: string | null;
  supplierAddress: string;
  supplierMobileNumber: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  comments: string | null;
  createdBy: string | null;
  createdAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
}

export interface PurchaseOrderListEntry {
  id: number;
  poNumber: number;
  supplierName: string;
  status: PurchaseOrderStatus;
  createdAt: string;
  createdBy: string | null;
}

export interface PurchaseOrderItemRequest {
  productId: number;
  packing: number;
  qty: number;
  totalQty: number;
}

export interface PurchaseOrderRequest {
  supplierId: number;
  items: PurchaseOrderItemRequest[];
  comments: string | null;
}

export interface PurchaseOrderItemApproval {
  itemId: number;
  orderQty: number;
}

export interface ApprovePurchaseOrderRequest {
  items: PurchaseOrderItemApproval[];
}

/** A line already added to the raise-PO working table, before Submit. */
export interface PurchaseOrderWorkingItem {
  productId: number;
  productName: string;
  productTypeName: string | null;
  packing: number;
  qty: number;
  totalQty: number;
}
