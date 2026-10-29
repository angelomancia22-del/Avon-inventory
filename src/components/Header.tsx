import React from 'react';
import { Package, Plus, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewOrder: () => void;
  onNewProduct: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNewOrder,
  onNewProduct,
}) => {
  const { repTier, setRepTier, lowStockCount, pendingOrdersCount } = useInventory();

  const navLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'inventory', label: 'Products & Stock' },
    { id: 'orders', label: `Customer Deliveries ${pendingOrdersCount > 0 ? `(${pendingOrdersCount})` : ''}` },
    { id: 'campaigns', label: 'Campaigns & Restock' },
    { id: 'receiving', label: 'Receive Shipment' },
    { id: 'insights', label: 'Intelligence' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-left group flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                A
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-neutral-900 group-hover:text-rose-600 transition-colors whitespace-nowrap">
                  AVON REPMANAGER
                </span>
                <span className="hidden sm:inline-block text-[11px] text-neutral-400 font-mono ml-2">
                  C-21 ACTIVE
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4–5 concise single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-600">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 relative ${
                  activeTab === link.id
                    ? 'text-rose-700 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                {link.label}
                {activeTab === link.id && (
                  <span className="absolute -bottom-5 left-0 right-0 h-0.5 bg-rose-600" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 primary action cluster */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Rep Tier Selector */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-100 rounded-md px-2.5 py-1.5">
              <span className="text-neutral-400">Commission:</span>
              <select
                value={repTier}
                onChange={(e) => setRepTier(e.target.value)}
                className="bg-transparent font-medium text-neutral-800 focus:outline-hidden cursor-pointer"
              >
                <option value="President's Club (40%)">President's Club (40%)</option>
                <option value="Premier (30%)">Premier (30%)</option>
                <option value="Contender (25%)">Contender (25%)</option>
              </select>
            </div>

            <button
              onClick={onNewOrder}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Customer Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="lg:hidden border-t border-neutral-100 overflow-x-auto px-4 py-2 flex items-center gap-4 text-xs font-medium text-neutral-600 scrollbar-none">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.id)}
            className={`whitespace-nowrap px-2 py-1 rounded-sm ${
              activeTab === link.id
                ? 'bg-rose-50 text-rose-700 font-semibold'
                : 'hover:text-neutral-900'
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>
    </header>
  );
};
