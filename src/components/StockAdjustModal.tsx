import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Check } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Product, StockMovementType } from '../types/inventory';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { products, adjustStock } = useInventory();

  const [selectedProductId, setSelectedProductId] = useState<string>(
    product?.id || products[0]?.id || ''
  );
  const [adjustmentDelta, setAdjustmentDelta] = useState<number>(-1);
  const [reasonCategory, setReasonCategory] = useState<StockMovementType>('Demo Tester Handout');
  const [notes, setNotes] = useState('Handed out as tester at beauty gathering');

  useEffect(() => {
    if (product) {
      setSelectedProductId(product.id);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const newStockOnHand = currentProduct
    ? Math.max(0, currentProduct.stockOnHand + adjustmentDelta)
    : 0;

  const reasonsList: Array<{ type: StockMovementType; label: string; defaultDelta: number; note: string }> = [
    {
      type: 'Demo Tester Handout',
      label: 'Demo / Tester Sample Handout',
      defaultDelta: -1,
      note: 'Given out as beauty sample to customer to try',
    },
    {
      type: 'Damaged / Expired',
      label: 'Damaged Bottle / Leaked / Expired',
      defaultDelta: -1,
      note: 'Defective pump or broken seal in box',
    },
    {
      type: 'Stock Adjustment',
      label: 'Personal Use / Rep Demo Display',
      defaultDelta: -1,
      note: 'Used for live home party demo or display table',
    },
    {
      type: 'Stock Adjustment',
      label: 'Physical Count Audit Correction (+)',
      defaultDelta: 2,
      note: 'Physical count found extra items on shelf',
    },
    {
      type: 'Return to Avon',
      label: 'Returned to Avon for Credit',
      defaultDelta: -1,
      note: 'Shipped back with official RMA return slip',
    },
  ];

  const handleReasonPreset = (item: typeof reasonsList[0]) => {
    setReasonCategory(item.type);
    setAdjustmentDelta(item.defaultDelta);
    setNotes(item.note);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct || adjustmentDelta === 0) return;

    adjustStock(
      currentProduct.id,
      adjustmentDelta,
      notes,
      reasonCategory,
      `ADJ-${Date.now().toString().slice(-4)}`
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full border border-neutral-200 shadow-xl overflow-hidden my-8">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <h2 className="text-base font-bold text-neutral-900">
              Avon Stock Adjustment &amp; Demo Log
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Product Select */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Select Avon Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.lineCode}] {p.name} — Current: {p.stockOnHand} on hand
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Preview Card */}
          {currentProduct && (
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
              <div>
                <div className="text-neutral-500">Current Stock:</div>
                <div className="font-mono font-bold text-lg text-neutral-900 tabular-nums">
                  {currentProduct.stockOnHand} on hand
                </div>
                <div className="text-[11px] text-neutral-500">
                  {currentProduct.stockReserved} allocated to customer bags
                </div>
              </div>

              <div className="text-right">
                <div className="text-neutral-500">Resulting Stock:</div>
                <div className="font-mono font-bold text-lg text-rose-700 tabular-nums">
                  {newStockOnHand} on hand
                </div>
                <div className="text-[11px] font-mono text-neutral-500">
                  Delta: {adjustmentDelta > 0 ? `+${adjustmentDelta}` : adjustmentDelta}
                </div>
              </div>
            </div>
          )}

          {/* Common Preset Reasons */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Reason Presets
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {reasonsList.map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleReasonPreset(r)}
                  className={`p-2 text-left text-xs rounded-lg border transition-colors flex items-center justify-between cursor-pointer ${
                    notes === r.note
                      ? 'border-rose-500 bg-rose-50/70 text-rose-900 font-medium'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <span>{r.label}</span>
                  <span className="font-mono text-[11px] text-neutral-500">
                    {r.defaultDelta > 0 ? `+${r.defaultDelta}` : r.defaultDelta}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Delta Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Quantity Change (Delta)
              </label>
              <input
                type="number"
                required
                value={adjustmentDelta}
                onChange={(e) => setAdjustmentDelta(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-hidden"
              />
              <span className="text-[10px] text-neutral-500">
                Use negative for demo/damage, positive for restock
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Audit Movement Type
              </label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value as StockMovementType)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden"
              >
                <option value="Demo Tester Handout">Demo Tester Handout</option>
                <option value="Damaged / Expired">Damaged / Expired</option>
                <option value="Stock Adjustment">Stock Adjustment</option>
                <option value="Return to Avon">Return to Avon</option>
                <option value="Shipment Received">Shipment Received</option>
              </select>
            </div>
          </div>

          {/* Audit Note */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Audit Note / Explanation
            </label>
            <input
              type="text"
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Apply Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
