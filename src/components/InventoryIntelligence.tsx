import React, { useState, useRef } from 'react';
import {
  TrendingUp,
  Package,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  PieChart,
  Lightbulb,
  Tag,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const InventoryIntelligence: React.FC = () => {
  const {
    products,
    orders,
    repTier,
    totalUnitsOnHand,
    totalWholesaleValue,
    totalRetailValue,
    totalPotentialProfit,
    exportDataJSON,
    importDataJSON,
    exportInventoryCSV,
    resetToDefaults,
  } = useInventory();

  const [importStatus, setImportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Identify slow-moving items (stock on hand > 8 and not marked fast mover)
  const slowMovers = products.filter((p) => !p.isFastMover && p.stockOnHand >= 4);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          setImportStatus('Backup restored successfully!');
        } else {
          setImportStatus('Invalid JSON backup file format.');
        }
        setTimeout(() => setImportStatus(''), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">
          Avon Inventory Intelligence &amp; Capital Analytics
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Actionable merchandising insights, dead stock liquidation strategies, and data backups
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs font-semibold text-neutral-500">
            Wholesale Capital Deployed
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
            ${totalWholesaleValue.toFixed(2)}
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Physical inventory on shelves across {products.length} catalog references
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs font-semibold text-neutral-500">
            Brochure Retail Value
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
            ${totalRetailValue.toFixed(2)}
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Gross revenue generated when inventory is delivered to customers
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-xs">
          <div className="text-xs font-semibold text-neutral-500">
            Net Representative Profit
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            +${totalPotentialProfit.toFixed(2)}
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Average margin: {totalRetailValue > 0 ? Math.round((totalPotentialProfit / totalRetailValue) * 100) : 0}% at {repTier}
          </p>
        </div>
      </div>

      {/* Slow-Moving Inventory & Merchandising Strategies */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-neutral-900">
              Slow-Moving Inventory &amp; Liquidation Strategies
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Free up tied working capital before seasonal brochure packaging changes
          </p>
        </div>

        <div className="p-6 space-y-4">
          {slowMovers.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All stocked items have healthy turnover! No idle dead-stock detected.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slowMovers.map((item) => (
                <div
                  key={item.id}
                  className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-neutral-900">{item.name}</div>
                      <div className="text-neutral-500 font-mono text-[11px] mt-0.5">
                        Code: {item.lineCode} · {item.category}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-neutral-900 tabular-nums">
                        {item.stockOnHand} units idle
                      </div>
                      <div className="text-neutral-500 font-mono">
                        ${(item.stockOnHand * item.wholesaleCost).toFixed(2)} tied up
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-neutral-200/80 space-y-1.5">
                    <div className="font-semibold text-rose-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Recommended Avon Merchandising Move:</span>
                    </div>
                    <p className="text-neutral-700 leading-relaxed text-[11px]">
                      {item.category === 'Personal Care'
                        ? 'Feature as a $5 add-on bundle with any Skin So Soft or Anew purchase in Campaign 21 delivery bags.'
                        : item.category === 'Fragrance'
                        ? 'Offer as a hostess appreciation gift for home beauty parties, or bundle with a matching body wash at $28.'
                        : 'Include as a free full-size surprise bonus for loyal customer orders exceeding $65.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Backup, Export & Maintenance */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-base font-bold text-neutral-900">
            System Data Management &amp; Backup
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Export master spreadsheets, download JSON snapshots, or reset to original sample catalog
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={exportInventoryCSV}
              className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors text-left space-y-2 cursor-pointer"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-neutral-900">
                <Download className="w-4 h-4 text-rose-600" />
                <span>Export Master Inventory CSV</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Download full catalog with Line Codes, SKU, costs, retail prices, and stock numbers for Excel.
              </p>
            </button>

            <button
              onClick={exportDataJSON}
              className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors text-left space-y-2 cursor-pointer"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-neutral-900">
                <Download className="w-4 h-4 text-neutral-700" />
                <span>Download Full JSON Backup</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Backup all products, customer delivery orders, movement logs, and campaign targets.
              </p>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors text-left space-y-2 cursor-pointer"
            >
              <div className="flex items-center gap-2 font-bold text-xs text-neutral-900">
                <Upload className="w-4 h-4 text-neutral-700" />
                <span>Restore From JSON Backup</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Upload a previously saved .json backup file to restore full state.
              </p>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {importStatus && (
            <div className="p-3 bg-neutral-100 rounded-lg text-xs font-semibold text-neutral-800">
              {importStatus}
            </div>
          )}

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Need to restore default Avon demo dataset?
            </span>
            <button
              onClick={() => {
                if (confirm('Reset all inventory, customer orders, and logs to initial Avon sample data?')) {
                  resetToDefaults();
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-rose-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Sample Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
