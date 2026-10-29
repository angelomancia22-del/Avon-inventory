import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CustomerOrder,
  CampaignInfo,
  StockMovement,
  StockMovementType,
  OrderStatus,
} from '../types/inventory';
import {
  INITIAL_PRODUCTS,
  INITIAL_CAMPAIGNS,
  INITIAL_ORDERS,
  INITIAL_MOVEMENTS,
} from '../data/initialData';

interface InventoryContextType {
  products: Product[];
  orders: CustomerOrder[];
  campaigns: CampaignInfo[];
  movements: StockMovement[];
  repTier: string;
  setRepTier: (tier: string) => void;
  repCommissionRate: number;
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'lastRestockedDate'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (
    productId: string,
    delta: number,
    reason: string,
    type: StockMovementType,
    referenceId?: string
  ) => void;
  // Order actions
  addCustomerOrder: (order: Omit<CustomerOrder, 'id' | 'orderNumber'>) => CustomerOrder;
  updateOrderStatus: (orderId: string, status: OrderStatus, isPaid?: boolean) => void;
  deleteCustomerOrder: (orderId: string) => void;
  // Receiving
  receiveShipment: (
    poNumber: string,
    invoiceNumber: string,
    campaign: string,
    receivedItems: { productId: string; quantity: number; unitCost: number }[]
  ) => void;
  // Campaign action
  updateCampaignSales: (campaignNum: number, amount: number) => void;
  // System actions
  resetToDefaults: () => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;
  exportInventoryCSV: () => void;
  // Computed metrics
  totalUnitsOnHand: number;
  totalWholesaleValue: number;
  totalRetailValue: number;
  totalPotentialProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingOrdersCount: number;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEY = 'avon_inventory_system_v1';

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [campaigns, setCampaigns] = useState<CampaignInfo[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_campaigns`);
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_movements`);
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  });

  const [repTier, setRepTierState] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_tier`) || "President's Club (40%)";
  });

  const repCommissionRate = repTier.includes('40%')
    ? 0.40
    : repTier.includes('30%')
    ? 0.30
    : 0.25;

  const setRepTier = (tier: string) => {
    setRepTierState(tier);
    localStorage.setItem(`${STORAGE_KEY}_tier`, tier);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_campaigns`, JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_movements`, JSON.stringify(movements));
  }, [movements]);

  // Actions
  const addProduct = (prodData: Omit<Product, 'id' | 'lastRestockedDate'>) => {
    const newId = `prod-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newProd: Product = {
      ...prodData,
      id: newId,
      lastRestockedDate: today,
    };
    setProducts((prev) => [newProd, ...prev]);

    // Movement log
    if (newProd.stockOnHand > 0) {
      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        productId: newId,
        productName: newProd.name,
        sku: newProd.sku,
        type: 'Stock Adjustment',
        quantityDelta: newProd.stockOnHand,
        resultingStock: newProd.stockOnHand,
        reason: 'Initial inventory creation',
        referenceId: 'INITIAL-STOCK',
      };
      setMovements((prev) => [movement, ...prev]);
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, ...updates };
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustStock = (
    productId: string,
    delta: number,
    reason: string,
    type: StockMovementType,
    referenceId?: string
  ) => {
    let resultingQty = 0;
    let targetName = '';
    let targetSku = '';

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedQty = Math.max(0, p.stockOnHand + delta);
          resultingQty = updatedQty;
          targetName = p.name;
          targetSku = p.sku;
          return {
            ...p,
            stockOnHand: updatedQty,
            lastRestockedDate: delta > 0 ? new Date().toISOString().split('T')[0] : p.lastRestockedDate,
          };
        }
        return p;
      })
    );

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      productId,
      productName: targetName,
      sku: targetSku,
      type,
      quantityDelta: delta,
      resultingStock: resultingQty,
      reason,
      referenceId: referenceId || 'REP-ADJUST',
    };

    setMovements((prev) => [movement, ...prev]);
  };

  const receiveShipment = (
    poNumber: string,
    invoiceNumber: string,
    campaign: string,
    receivedItems: { productId: string; quantity: number; unitCost: number }[]
  ) => {
    const timestamp = new Date().toLocaleString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    const today = new Date().toISOString().split('T')[0];
    const newMovements: StockMovement[] = [];

    setProducts((prev) =>
      prev.map((p) => {
        const item = receivedItems.find((r) => r.productId === p.id);
        if (item && item.quantity > 0) {
          const newQty = p.stockOnHand + item.quantity;
          newMovements.push({
            id: `mov-${Date.now()}-${p.id}`,
            timestamp,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            type: 'Shipment Received',
            quantityDelta: item.quantity,
            resultingStock: newQty,
            reason: `Avon Invoice #${invoiceNumber} for ${campaign}`,
            referenceId: poNumber,
          });
          return {
            ...p,
            stockOnHand: newQty,
            wholesaleCost: item.unitCost || p.wholesaleCost,
            lastRestockedDate: today,
          };
        }
        return p;
      })
    );

    if (newMovements.length > 0) {
      setMovements((prev) => [...newMovements, ...prev]);
    }
  };

  const addCustomerOrder = (orderData: Omit<CustomerOrder, 'id' | 'orderNumber'>): CustomerOrder => {
    const orderNumber = `ORD-C21-${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: CustomerOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Reserve stock for items
    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = newOrder.items.find((item) => item.productId === p.id);
        if (orderedItem) {
          return {
            ...p,
            stockReserved: p.stockReserved + orderedItem.quantity,
          };
        }
        return p;
      })
    );

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, isPaid?: boolean) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const previousStatus = targetOrder.status;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            isPaid: isPaid !== undefined ? isPaid : o.isPaid,
          };
        }
        return o;
      })
    );

    // If transitioned to 'Delivered & Paid' from an active unfulfilled state,
    // deduct from on-hand and release reserved stock
    if (
      (status === 'Delivered & Paid' || status === 'Out for Delivery') &&
      previousStatus === 'Pending Fulfillment'
    ) {
      targetOrder.items.forEach((item) => {
        adjustStock(
          item.productId,
          -item.quantity,
          `Delivered to ${targetOrder.customerName}`,
          'Customer Order Fulfilled',
          targetOrder.orderNumber
        );
      });

      // Release reserved units
      setProducts((prev) =>
        prev.map((p) => {
          const item = targetOrder.items.find((i) => i.productId === p.id);
          if (item) {
            return {
              ...p,
              stockReserved: Math.max(0, p.stockReserved - item.quantity),
            };
          }
          return p;
        })
      );
    } else if (status === 'Delivered & Paid' && previousStatus === 'Bagged & Packed') {
      // Stock was already reserved; now finalize movement
      targetOrder.items.forEach((item) => {
        adjustStock(
          item.productId,
          -item.quantity,
          `Final delivery complete to ${targetOrder.customerName}`,
          'Customer Order Fulfilled',
          targetOrder.orderNumber
        );
      });

      setProducts((prev) =>
        prev.map((p) => {
          const item = targetOrder.items.find((i) => i.productId === p.id);
          if (item) {
            return {
              ...p,
              stockReserved: Math.max(0, p.stockReserved - item.quantity),
            };
          }
          return p;
        })
      );
    }
  };

  const deleteCustomerOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder && targetOrder.status !== 'Delivered & Paid') {
      // Release reserved stock
      setProducts((prev) =>
        prev.map((p) => {
          const item = targetOrder.items.find((i) => i.productId === p.id);
          if (item) {
            return {
              ...p,
              stockReserved: Math.max(0, p.stockReserved - item.quantity),
            };
          }
          return p;
        })
      );
    }
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const updateCampaignSales = (campaignNum: number, amount: number) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.campaignNumber === campaignNum ? { ...c, salesTarget: amount } : c))
    );
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setMovements(INITIAL_MOVEMENTS);
    localStorage.removeItem(`${STORAGE_KEY}_products`);
    localStorage.removeItem(`${STORAGE_KEY}_orders`);
    localStorage.removeItem(`${STORAGE_KEY}_campaigns`);
    localStorage.removeItem(`${STORAGE_KEY}_movements`);
  };

  const exportDataJSON = () => {
    const exportBundle = {
      exportedAt: new Date().toISOString(),
      repTier,
      products,
      orders,
      campaigns,
      movements,
    };
    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avon-inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.products && Array.isArray(parsed.products)) {
        setProducts(parsed.products);
      }
      if (parsed.orders && Array.isArray(parsed.orders)) {
        setOrders(parsed.orders);
      }
      if (parsed.campaigns && Array.isArray(parsed.campaigns)) {
        setCampaigns(parsed.campaigns);
      }
      if (parsed.movements && Array.isArray(parsed.movements)) {
        setMovements(parsed.movements);
      }
      if (parsed.repTier) {
        setRepTier(parsed.repTier);
      }
      return true;
    } catch {
      return false;
    }
  };

  const exportInventoryCSV = () => {
    const headers = [
      'SKU',
      'Avon Line Code',
      'Product Name',
      'Category',
      'Brand Line',
      'Stock On Hand',
      'Stock Reserved',
      'Available',
      'Reorder Threshold',
      'Wholesale Cost ($)',
      'Brochure Retail ($)',
      'Potential Profit/Unit ($)',
      'Total Value ($)',
      'Shelf Location',
      'Expiry Batch',
      'Last Restocked',
    ];

    const rows = products.map((p) => {
      const available = Math.max(0, p.stockOnHand - p.stockReserved);
      const profitPerUnit = (p.brochurePrice - p.wholesaleCost).toFixed(2);
      const totalVal = (p.stockOnHand * p.wholesaleCost).toFixed(2);
      return [
        `"${p.sku}"`,
        `"${p.lineCode}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category}"`,
        `"${p.brandLine}"`,
        p.stockOnHand,
        p.stockReserved,
        available,
        p.reorderThreshold,
        p.wholesaleCost.toFixed(2),
        p.brochurePrice.toFixed(2),
        profitPerUnit,
        totalVal,
        `"${p.shelfLocation || ''}"`,
        `"${p.batchExpiry || ''}"`,
        `"${p.lastRestockedDate}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avon-inventory-master-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Computed
  const totalUnitsOnHand = products.reduce((acc, p) => acc + p.stockOnHand, 0);
  const totalWholesaleValue = products.reduce((acc, p) => acc + p.stockOnHand * p.wholesaleCost, 0);
  const totalRetailValue = products.reduce((acc, p) => acc + p.stockOnHand * p.brochurePrice, 0);
  const totalPotentialProfit = totalRetailValue - totalWholesaleValue;
  const lowStockCount = products.filter((p) => p.stockOnHand <= p.reorderThreshold && p.stockOnHand > 0).length;
  const outOfStockCount = products.filter((p) => p.stockOnHand === 0).length;
  const pendingOrdersCount = orders.filter((o) => o.status !== 'Delivered & Paid').length;

  return (
    <InventoryContext.Provider
      value={{
        products,
        orders,
        campaigns,
        movements,
        repTier,
        setRepTier,
        repCommissionRate,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCustomerOrder,
        updateOrderStatus,
        deleteCustomerOrder,
        receiveShipment,
        updateCampaignSales,
        resetToDefaults,
        exportDataJSON,
        importDataJSON,
        exportInventoryCSV,
        totalUnitsOnHand,
        totalWholesaleValue,
        totalRetailValue,
        totalPotentialProfit,
        lowStockCount,
        outOfStockCount,
        pendingOrdersCount,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
