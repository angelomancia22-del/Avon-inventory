import React from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Calendar,
  Truck,
  ShoppingBag,
  Sparkles,
  Download,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Product } from '../types/inventory';

interface DashboardOverviewProps {
  onNavigateTab: (tab: string) => void;
  onOpenReceive: () => void;
  onOpenQuickAdjust: () => void;
  onOpenNewProduct: () => void;
  onOpenNewOrder: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onOpenReceive,
  onOpenQuickAdjust,
  onOpenNewProduct,
  onOpenNewOrder,
}) => {
  const {
    products,
    orders,
    campaigns,
    movements,
    repTier,
    totalUnitsOnHand,
    totalWholesaleValue,
    totalRetailValue,
    totalPotentialProfit,
    lowStockCount,
    pendingOrdersCount,
    exportInventoryCSV,
  } = useInventory();

  const activeCampaign = campaigns.find((c) => c.status === 'Active') || campaigns[0];
  const upcomingCampaign = campaigns.find((c) => c.status === 'Upcoming') || campaigns[1];

  const criticalItems = products.filter(
    (p) => p.stockOnHand <= p.reorderThreshold
  );

  // Category counts
  const categorySummary = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.stockOnHand;
    return acc;
  }, {} as Record<string, number>);

  const marginPercent = totalRetailValue > 0
    ? Math.round((totalPotentialProfit / totalRetailValue) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Campaign Status Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-rose-950 text-white rounded-xl p-6 shadow-sm border border-neutral-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-rose-300">
              <span>{activeCampaign.name}</span>
              <span aria-hidden="true">·</span>
              <span>Brochure Order Cycle Active</span>
              <span aria-hidden="true">·</span>
              <span>{repTier}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {activeCampaign.theme}
            </h1>
            <p className="text-sm text-neutral-300 max-w-2xl">
              Next Avon order submission cutoff is{' '}
              <strong className="text-white font-semibold">{activeCampaign.orderCutoffDate}</strong>.
              Expected delivery arrival{' '}
              <strong className="text-white font-semibold">{activeCampaign.deliveryArrivalDate}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('campaigns')}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              <span>Campaign Restock PO</span>
            </button>
            <button
              onClick={onOpenReceive}
              className="px-4 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Truck className="w-4 h-4" />
              <span>Receive Avon Box</span>
            </button>
          </div>
        </div>

        {/* Campaign Metrics Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-neutral-400">Campaign Target</div>
            <div className="text-base font-bold font-mono tabular-nums text-white mt-0.5">
              ${activeCampaign.salesTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-neutral-400">Pending Customer Bags</div>
            <div className="text-base font-bold font-mono tabular-nums text-white mt-0.5">
              {pendingOrdersCount} orders waiting
            </div>
          </div>
          <div>
            <div className="text-neutral-400">Demo Advance Orders</div>
            <div className="text-base font-bold font-mono tabular-nums text-white mt-0.5">
              {upcomingCampaign.name} (Nov 10)
            </div>
          </div>
          <div>
            <div className="text-neutral-400">Commission Tier</div>
            <div className="text-base font-bold font-mono tabular-nums text-rose-300 mt-0.5">
              {marginPercent}% Avg Margin
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl p-5 border border-neutral-200">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Stock on Hand</span>
            <Package className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
            {totalUnitsOnHand} <span className="text-xs font-normal text-neutral-500 font-sans">units</span>
          </div>
          <div className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
            <span>Across</span>
            <span className="font-semibold text-neutral-800">{products.length}</span>
            <span>Avon catalog items</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl p-5 border border-neutral-200">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Inventory at Rep Cost</span>
            <span className="text-neutral-400 text-[11px]">Wholesale</span>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
            ${totalWholesaleValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-neutral-500 mt-2">
            Capital invested in physical on-hand stock
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl p-5 border border-neutral-200">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Retail Brochure Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
            ${totalRetailValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-2 flex items-center gap-1 font-mono tabular-nums">
            +${totalPotentialProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="font-sans text-neutral-500 font-normal">potential rep earnings</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl p-5 border border-neutral-200">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Reorder Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-600' : 'text-neutral-400'}`} />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900">
            {lowStockCount} <span className="text-xs font-normal text-neutral-500 font-sans">low items</span>
          </div>
          <div className="text-xs text-neutral-500 mt-2 flex items-center justify-between">
            <span>{criticalItems.length} at or below safety point</span>
            <button
              onClick={() => onNavigateTab('campaigns')}
              className="text-rose-600 hover:text-rose-700 font-medium hover:underline"
            >
              Order &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Quick Representative Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-neutral-200 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs font-semibold text-neutral-700 flex items-center gap-2">
          <span>Rep Workflow Shortcuts:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewOrder}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-rose-600" />
            <span>Create Customer Order</span>
          </button>
          <button
            onClick={onOpenReceive}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Truck className="w-3.5 h-3.5 text-neutral-600" />
            <span>Check-in Avon Box</span>
          </button>
          <button
            onClick={onOpenQuickAdjust}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-600" />
            <span>Quick Stock Adjust / Demo</span>
          </button>
          <button
            onClick={onOpenNewProduct}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5 text-neutral-600" />
            <span>Add Catalog Item</span>
          </button>
          <button
            onClick={exportInventoryCSV}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-neutral-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Two Column Split: Critical Stock Alerts + Recent Movements Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Reorder & Low Stock Attention Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Low Stock &amp; Campaign Reorder Watch
              </h2>
              <div className="text-xs text-neutral-500 mt-0.5">
                Items approaching zero or pledged to pending customer bags
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('campaigns')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Open Restock PO &rarr;
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {criticalItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All Avon inventory items are currently above safety thresholds.
              </div>
            ) : (
              criticalItems.map((prod) => {
                const available = Math.max(0, prod.stockOnHand - prod.stockReserved);
                return (
                  <div key={prod.id} className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50/80 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden shrink-0 border border-neutral-200 flex items-center justify-center">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-neutral-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-neutral-900 truncate">
                          {prod.name}
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-neutral-700">{prod.lineCode}</span>
                          <span aria-hidden="true">·</span>
                          <span>{prod.brandLine}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-neutral-600">{prod.shelfLocation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div>
                        <div className="text-xs font-bold font-mono tabular-nums text-neutral-900">
                          {prod.stockOnHand} on hand
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {prod.stockReserved > 0 ? (
                            <span className="text-amber-700 font-medium">({prod.stockReserved} reserved)</span>
                          ) : (
                            <span>Threshold: {prod.reorderThreshold}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigateTab('campaigns')}
                        className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200 transition-colors cursor-pointer"
                      >
                        Reorder
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Recent Stock Movement Audit Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">
                Stock Activity Ledger
              </h2>
              <div className="text-xs text-neutral-500 mt-0.5">
                Shipment check-ins, bagging, and adjustments
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-neutral-100 max-h-[420px] overflow-y-auto">
            {movements.slice(0, 7).map((mov) => {
              const isPositive = mov.quantityDelta > 0;
              return (
                <div key={mov.id} className="p-3.5 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-neutral-900 line-clamp-1">
                        {mov.productName}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {mov.reason}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {mov.timestamp} · {mov.type}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs font-bold font-mono tabular-nums ${
                          isPositive ? 'text-emerald-700' : 'text-neutral-800'
                        }`}
                      >
                        {isPositive ? `+${mov.quantityDelta}` : mov.quantityDelta}
                      </span>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        Bal: {mov.resultingStock}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-900">
          Stock Distribution by Beauty Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(categorySummary).map(([cat, count]) => (
            <div
              key={cat}
              className="bg-white p-3.5 rounded-lg border border-neutral-200 text-left"
            >
              <div className="text-xs text-neutral-500 truncate">{cat}</div>
              <div className="text-xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
                {count} <span className="text-[11px] font-normal text-neutral-400 font-sans">units</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
