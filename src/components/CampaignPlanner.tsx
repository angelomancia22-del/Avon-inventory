import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Package,
  TrendingUp,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Product } from '../types/inventory';

export const CampaignPlanner: React.FC = () => {
  const { products, campaigns, orders, repTier, repCommissionRate, receiveShipment } = useInventory();
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [simulatedReceiptMsg, setSimulatedReceiptMsg] = useState('');

  const activeCampaign = campaigns.find((c) => c.status === 'Active') || campaigns[0];
  const upcomingCampaign = campaigns.find((c) => c.status === 'Upcoming') || campaigns[1];

  // Calculate items that need restock
  // 1. Items below reorder threshold
  // 2. Items with customer backorders exceeding available
  const [restockPlan, setRestockPlan] = useState<
    Array<{
      product: Product;
      suggestedQty: number;
      reason: string;
    }>
  >(() => {
    return products
      .map((p) => {
        const available = Math.max(0, p.stockOnHand - p.stockReserved);
        const isBelowThreshold = p.stockOnHand <= p.reorderThreshold;
        const hasUnmetCustomerDemand = p.stockReserved > p.stockOnHand;

        if (isBelowThreshold || hasUnmetCustomerDemand) {
          const needed = Math.max(
            p.reorderThreshold * 2 - available,
            p.stockReserved - p.stockOnHand + 2,
            3
          );
          const reason = hasUnmetCustomerDemand
            ? 'Customer order backorders exceed stock'
            : p.stockOnHand === 0
            ? 'Out of stock'
            : 'Below safety threshold';

          return {
            product: p,
            suggestedQty: needed,
            reason,
          };
        }
        return null;
      })
      .filter(Boolean) as Array<{ product: Product; suggestedQty: number; reason: string }>;
  });

  const handleQtyChange = (productId: string, newQty: number) => {
    setRestockPlan((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, suggestedQty: Math.max(0, newQty) } : item
      )
    );
  };

  const totalReplenishmentUnits = restockPlan.reduce((acc, item) => acc + item.suggestedQty, 0);
  const totalWholesaleInvestment = restockPlan.reduce(
    (acc, item) => acc + item.suggestedQty * item.product.wholesaleCost,
    0
  );
  const totalRetailPotential = restockPlan.reduce(
    (acc, item) => acc + item.suggestedQty * item.product.brochurePrice,
    0
  );
  const projectedEarnings = totalRetailPotential - totalWholesaleInvestment;

  // Format line codes for AvonNow order portal paste
  const handleCopyAvonNowCodes = () => {
    const formatted = restockPlan
      .filter((i) => i.suggestedQty > 0)
      .map((i) => `${i.product.lineCode}\t${i.suggestedQty}\t${i.product.name}`)
      .join('\n');

    navigator.clipboard.writeText(formatted);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2500);
  };

  const handleExportPO = () => {
    const headers = [
      'Line Code',
      'SKU',
      'Product Name',
      'Order Qty',
      'Wholesale Cost ($)',
      'Total Wholesale ($)',
      'Retail Price ($)',
      'Total Retail ($)',
      'Reason',
    ];

    const rows = restockPlan
      .filter((i) => i.suggestedQty > 0)
      .map((i) => [
        `"${i.product.lineCode}"`,
        `"${i.product.sku}"`,
        `"${i.product.name.replace(/"/g, '""')}"`,
        i.suggestedQty,
        i.product.wholesaleCost.toFixed(2),
        (i.suggestedQty * i.product.wholesaleCost).toFixed(2),
        i.product.brochurePrice.toFixed(2),
        (i.suggestedQty * i.product.brochurePrice).toFixed(2),
        `"${i.reason}"`,
      ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avon-campaign-${activeCampaign.campaignNumber}-po-requisition.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSimulateRestockCheckin = () => {
    const validItems = restockPlan.filter((i) => i.suggestedQty > 0);
    if (validItems.length === 0) return;

    const poNum = `PO-AVN-${Math.floor(10000 + Math.random() * 90000)}`;
    const invNum = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    receiveShipment(
      poNum,
      invNum,
      activeCampaign.name,
      validItems.map((i) => ({
        productId: i.product.id,
        quantity: i.suggestedQty,
        unitCost: i.product.wholesaleCost,
      }))
    );

    setSimulatedReceiptMsg(`Successfully received ${totalReplenishmentUnits} units via ${poNum}! Inventory has been replenished.`);
    setTimeout(() => setSimulatedReceiptMsg(''), 5000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">
          Avon Campaign Cycles &amp; Restock Planner
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Align inventory replenishment with bi-weekly brochure deadlines and advance demo ordering
        </p>
      </div>

      {/* Campaign Timeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {campaigns.map((camp) => {
          const isActive = camp.status === 'Active';
          const isUpcoming = camp.status === 'Upcoming';

          return (
            <div
              key={camp.campaignNumber}
              className={`rounded-xl p-5 border transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                  : isUpcoming
                  ? 'bg-white text-neutral-900 border-rose-200'
                  : 'bg-neutral-50 text-neutral-700 border-neutral-200 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`font-mono font-bold ${isActive ? 'text-rose-400' : 'text-neutral-500'}`}>
                  CAMPAIGN {camp.campaignNumber}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    isActive
                      ? 'bg-rose-600 text-white'
                      : isUpcoming
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {camp.status}
                </span>
              </div>

              <h3 className={`text-base font-bold ${isActive ? 'text-white' : 'text-neutral-950'}`}>
                {camp.theme}
              </h3>

              <div className="mt-4 pt-3 border-t border-neutral-200/30 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className={isActive ? 'text-neutral-400' : 'text-neutral-500'}>
                    Order Cutoff:
                  </span>
                  <span className="font-semibold tabular-nums">{camp.orderCutoffDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isActive ? 'text-neutral-400' : 'text-neutral-500'}>
                    Delivery Date:
                  </span>
                  <span className="font-semibold tabular-nums">{camp.deliveryArrivalDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isActive ? 'text-neutral-400' : 'text-neutral-500'}>
                    Sales Goal:
                  </span>
                  <span className="font-semibold tabular-nums">${camp.salesTarget.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Automated PO Restock Requisition Generator */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-neutral-900">
                Campaign {activeCampaign.campaignNumber} Restock Requisition
              </span>
              <span className="text-xs font-mono text-neutral-500">
                ({restockPlan.length} items flagged)
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Consolidated replenishment order based on safety inventory levels and customer backorders
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyAvonNowCodes}
              className="px-3.5 py-2 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCodes ? 'Copied to Clipboard!' : 'Copy AvonNow Quick Entry'}</span>
            </button>

            <button
              onClick={handleExportPO}
              className="px-3.5 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleSimulateRestockCheckin}
              className="px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Receive PO Into Inventory</span>
            </button>
          </div>
        </div>

        {simulatedReceiptMsg && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{simulatedReceiptMsg}</span>
          </div>
        )}

        {/* Financial Summary Strip */}
        <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <div className="text-neutral-500 font-sans">Total Restock Units</div>
            <div className="text-lg font-bold tabular-nums text-neutral-900 mt-0.5">
              {totalReplenishmentUnits} units
            </div>
          </div>
          <div>
            <div className="text-neutral-500 font-sans">Wholesale Cost (Rep Investment)</div>
            <div className="text-lg font-bold tabular-nums text-neutral-900 mt-0.5">
              ${totalWholesaleInvestment.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-neutral-500 font-sans">Retail Brochure Value</div>
            <div className="text-lg font-bold tabular-nums text-neutral-900 mt-0.5">
              ${totalRetailPotential.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-neutral-500 font-sans">Expected Rep Earnings</div>
            <div className="text-lg font-bold tabular-nums text-emerald-700 mt-0.5">
              +${projectedEarnings.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Requisition Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-100/60 text-neutral-600 font-semibold">
                <th className="py-3 px-6">Line Code</th>
                <th className="py-3 px-4">Product Description</th>
                <th className="py-3 px-4 text-center">On Hand</th>
                <th className="py-3 px-4 text-center">Reserved</th>
                <th className="py-3 px-4 text-center">Replenish Qty</th>
                <th className="py-3 px-4 text-right">Wholesale Cost</th>
                <th className="py-3 px-4 text-right">Retail Total</th>
                <th className="py-3 px-6">Reorder Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono">
              {restockPlan.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-400 font-sans">
                    No items currently need replenishment. All products are well-stocked!
                  </td>
                </tr>
              ) : (
                restockPlan.map((item) => {
                  const lineTotalWholesale = item.suggestedQty * item.product.wholesaleCost;
                  const lineTotalRetail = item.suggestedQty * item.product.brochurePrice;

                  return (
                    <tr key={item.product.id} className="hover:bg-neutral-50/70">
                      <td className="py-3 px-6 font-bold text-neutral-900">
                        {item.product.lineCode}
                      </td>
                      <td className="py-3 px-4 font-sans font-medium text-neutral-900 max-w-xs truncate">
                        {item.product.name}
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums text-neutral-700">
                        {item.product.stockOnHand}
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums text-amber-700">
                        {item.product.stockReserved}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min="0"
                          value={item.suggestedQty}
                          onChange={(e) =>
                            handleQtyChange(item.product.id, parseInt(e.target.value) || 0)
                          }
                          className="w-16 px-2 py-1 text-center font-bold font-mono bg-white border border-neutral-300 rounded-md focus:border-rose-500 focus:outline-hidden"
                        />
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-neutral-700">
                        ${lineTotalWholesale.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-neutral-900 font-bold">
                        ${lineTotalRetail.toFixed(2)}
                      </td>
                      <td className="py-3 px-6 font-sans text-neutral-500 text-[11px]">
                        {item.reason}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
