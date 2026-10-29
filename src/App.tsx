import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { ProductCatalog } from './components/ProductCatalog';
import { CustomerOrdersView } from './components/CustomerOrdersView';
import { CampaignPlanner } from './components/CampaignPlanner';
import { ReceiveShipmentModal } from './components/ReceiveShipmentModal';
import { ProductModal } from './components/ProductModal';
import { CustomerOrderModal } from './components/CustomerOrderModal';
import { PackingSlipModal } from './components/PackingSlipModal';
import { StockAdjustModal } from './components/StockAdjustModal';
import { InventoryIntelligence } from './components/InventoryIntelligence';
import { Product, CustomerOrder } from './types/inventory';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [packingSlipModalOpen, setPackingSlipModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);

  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [stockAdjustModalOpen, setStockAdjustModalOpen] = useState(false);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<Product | null>(null);

  // Handlers
  const handleOpenNewProduct = () => {
    setSelectedProduct(null);
    setProductModalMode('create');
    setProductModalOpen(true);
  };

  const handleEditProduct = (p: Product) => {
    setSelectedProduct(p);
    setProductModalMode('edit');
    setProductModalOpen(true);
  };

  const handleViewProduct = (p: Product) => {
    setSelectedProduct(p);
    setProductModalMode('view');
    setProductModalOpen(true);
  };

  const handleOpenNewOrder = () => {
    setOrderModalOpen(true);
  };

  const handleViewPackingSlip = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setPackingSlipModalOpen(true);
  };

  const handleOpenQuickAdjust = (p?: Product) => {
    setStockAdjustProduct(p || null);
    setStockAdjustModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewOrder={handleOpenNewOrder}
        onNewProduct={handleOpenNewProduct}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <DashboardOverview
            onNavigateTab={setActiveTab}
            onOpenReceive={() => setReceiveModalOpen(true)}
            onOpenQuickAdjust={() => handleOpenQuickAdjust()}
            onOpenNewProduct={handleOpenNewProduct}
            onOpenNewOrder={handleOpenNewOrder}
          />
        )}

        {activeTab === 'inventory' && (
          <ProductCatalog
            onOpenNewProduct={handleOpenNewProduct}
            onEditProduct={handleEditProduct}
            onViewProductDetails={handleViewProduct}
            onQuickAdjust={(p) => handleOpenQuickAdjust(p)}
          />
        )}

        {activeTab === 'orders' && (
          <CustomerOrdersView
            onOpenNewOrder={handleOpenNewOrder}
            onViewPackingSlip={handleViewPackingSlip}
          />
        )}

        {activeTab === 'campaigns' && <CampaignPlanner />}

        {activeTab === 'receiving' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-8 border border-neutral-200 text-center max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-neutral-900">
                Receive Avon Warehouse Delivery Box
              </h2>
              <p className="text-xs text-neutral-500">
                Open your Avon delivery invoice, verify received quantities of Anew skincare, Far Away fragrance, and brochures, and update inventory instantly.
              </p>
              <button
                onClick={() => setReceiveModalOpen(true)}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Launch Delivery Box Check-In Form
              </button>
            </div>
          </div>
        )}

        {activeTab === 'insights' && <InventoryIntelligence />}
      </main>

      <footer className="bg-white border-t border-neutral-200 py-6 text-xs text-neutral-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">AVON INVENTORY MANAGER</span>
            <span aria-hidden="true">·</span>
            <span>Independent Representative Suite</span>
          </div>
          <div className="text-neutral-400">
            Avon Brochure Campaigns &amp; Customer Delivery Station
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        productToEdit={selectedProduct}
        mode={productModalMode}
      />

      <CustomerOrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        onOrderCreated={(orderId) => {
          setActiveTab('orders');
        }}
      />

      <PackingSlipModal
        order={selectedOrder}
        onClose={() => setPackingSlipModalOpen(false)}
      />

      <ReceiveShipmentModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
      />

      <StockAdjustModal
        isOpen={stockAdjustModalOpen}
        onClose={() => setStockAdjustModalOpen(false)}
        product={stockAdjustProduct}
      />
    </div>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <MainApp />
    </InventoryProvider>
  );
}
