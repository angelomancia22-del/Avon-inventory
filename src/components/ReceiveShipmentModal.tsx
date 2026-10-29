import React, { useState } from 'react';
import { X, Truck, Plus, Trash2, CheckCircle2, PackageCheck } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface ReceiveShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiveShipmentModal: React.FC<ReceiveShipmentModalProps> = ({ isOpen, onClose }) => {
  const { products, receiveShipment, campaigns } = useInventory();

  const [poNumber, setPoNumber] = useState(`PO-AVN-${Math.floor(10000 + Math.random() * 90000)}`);
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(100000 + Math.random() * 900000)}`);
  const [campaign, setCampaign] = useState(campaigns[0]?.name || 'Campaign 21');
  const [carrier, setCarrier] = useState('UPS Ground');

  const [items, setItems] = useState<
    Array<{
      productId: string;
      quantity: number;
      unitCost: number;
    }>
  >([
    {
      productId: products[0]?.id || '',
      quantity: 5,
      unitCost: products[0]?.wholesaleCost || 14.4,
    },
    {
      productId: products[1]?.id || '',
      quantity: 4,
      unitCost: products[1]?.wholesaleCost || 26.4,
    },
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const firstProd = products[0];
    setItems((prev) => [
      ...prev,
      {
        productId: firstProd?.id || '',
        quantity: 3,
        unitCost: firstProd?.wholesaleCost || 10.0,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          if (field === 'productId') {
            const p = products.find((prod) => prod.id === value);
            return {
              ...item,
              productId: value,
              unitCost: p ? p.wholesaleCost : item.unitCost,
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handlePreloadLowStock = () => {
    const lowItems = products.filter((p) => p.stockOnHand <= p.reorderThreshold);
    if (lowItems.length > 0) {
      setItems(
        lowItems.map((p) => ({
          productId: p.id,
          quantity: Math.max(3, p.reorderThreshold * 2 - p.stockOnHand),
          unitCost: p.wholesaleCost,
        }))
      );
    }
  };

  const totalUnits = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalInvoiceAmount = items.reduce((acc, i) => acc + i.quantity * i.unitCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    receiveShipment(poNumber, invoiceNumber, campaign, items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-neutral-200 shadow-xl overflow-hidden my-8">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-rose-600" />
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Receive Avon Delivery Shipment Box
              </h2>
              <div className="text-xs text-neutral-500">
                Verify incoming packages against packing slip &amp; update physical stock
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Avon PO Number
              </label>
              <input
                type="text"
                required
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Warehouse Invoice #
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Brochure Campaign
              </label>
              <select
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden"
              >
                {campaigns.map((c) => (
                  <option key={c.campaignNumber} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900">
                Products In Shipment Box ({items.length} lines)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreloadLowStock}
                  className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer"
                >
                  Load Low Stock Items
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);

                return (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-[220px]">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-md focus:outline-hidden"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.lineCode}] {p.name} (Current: {p.stockOnHand})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-neutral-500 text-[11px]">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)
                          }
                          className="w-16 px-2 py-1 bg-white border border-neutral-200 rounded-md text-center font-mono font-bold"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-neutral-500 text-[11px]">Cost:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitCost}
                          onChange={(e) =>
                            handleItemChange(idx, 'unitCost', parseFloat(e.target.value) || 0)
                          }
                          className="w-20 px-2 py-1 bg-white border border-neutral-200 rounded-md text-right font-mono"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length === 1}
                        className="p-1 text-neutral-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals Strip */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-neutral-500 font-sans">Units Received: </span>
              <span className="font-bold tabular-nums text-neutral-900">{totalUnits} units</span>
            </div>
            <div>
              <span className="text-neutral-500 font-sans">Total Box Wholesale Cost: </span>
              <span className="font-bold tabular-nums text-base text-neutral-900">
                ${totalInvoiceAmount.toFixed(2)}
              </span>
            </div>
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
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Verify &amp; Add to Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
