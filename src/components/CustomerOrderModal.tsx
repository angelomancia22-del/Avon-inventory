import React, { useState } from 'react';
import { X, Plus, Trash2, Gift, ShoppingBag, AlertCircle } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Product, OrderItem } from '../types/inventory';

interface CustomerOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (orderId: string) => void;
}

export const CustomerOrderModal: React.FC<CustomerOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const { products, addCustomerOrder, repCommissionRate } = useInventory();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDateTarget, setDeliveryDateTarget] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [campaign, setCampaign] = useState('Campaign 21');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'Venmo / Zelle' | 'Credit Card' | 'Check'>('Venmo / Zelle');
  const [salesTaxPercent, setSalesTaxPercent] = useState(7.5);

  const [selectedItems, setSelectedItems] = useState<
    Array<{
      productId: string;
      quantity: number;
    }>
  >([
    {
      productId: products[0]?.id || '',
      quantity: 1,
    },
  ]);

  const [selectedSamples, setSelectedSamples] = useState<string[]>([
    'Far Away Fragrance Vial Demo',
    'Campaign 22 Brochure',
  ]);

  const availableSampleOptions = [
    'Far Away Fragrance Vial Demo',
    'Anew Vitamin C serum packet',
    'Rare Pearls Fragrance Card',
    'Campaign 22 Brochure',
    'Skin So Soft travel packet',
  ];

  if (!isOpen) return null;

  const handleAddItemRow = () => {
    setSelectedItems((prev) => [
      ...prev,
      {
        productId: products[0]?.id || '',
        quantity: 1,
      },
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: 'productId' | 'quantity', val: any) => {
    setSelectedItems((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  const toggleSample = (sample: string) => {
    setSelectedSamples((prev) =>
      prev.includes(sample) ? prev.filter((s) => s !== sample) : [...prev, sample]
    );
  };

  // Compute financial totals
  let subtotal = 0;
  let totalWholesaleCost = 0;

  const builtItems: OrderItem[] = selectedItems
    .map((si) => {
      const prod = products.find((p) => p.id === si.productId);
      if (!prod) return null;
      const itemSub = prod.brochurePrice * si.quantity;
      const itemCost = prod.wholesaleCost * si.quantity;
      subtotal += itemSub;
      totalWholesaleCost += itemCost;

      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        lineCode: prod.lineCode,
        quantity: si.quantity,
        unitRetailPrice: prod.brochurePrice,
        unitWholesaleCost: prod.wholesaleCost,
      };
    })
    .filter(Boolean) as OrderItem[];

  const salesTaxAmount = parseFloat(((subtotal * salesTaxPercent) / 100).toFixed(2));
  const totalDue = subtotal + salesTaxAmount;
  const repProfit = subtotal - totalWholesaleCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || builtItems.length === 0) return;

    const created = addCustomerOrder({
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      campaign,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDateTarget,
      status: 'Pending Fulfillment',
      items: builtItems,
      subtotal,
      salesTaxPercent,
      salesTaxAmount,
      deliveryFee: 0,
      totalDue,
      repProfit,
      sampleGifts: selectedSamples,
      paymentMethod,
      isPaid: false,
      notes,
    });

    if (onOrderCreated) {
      onOrderCreated(created.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-neutral-200 shadow-xl overflow-hidden my-8">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              New Avon Customer Delivery Order
            </h2>
            <div className="text-xs text-neutral-500 mt-0.5">
              Enter customer brochure order, allocate items, and assemble bagging slip
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
          {/* Customer Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Maria Gonzalez"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Delivery Street Address
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="123 Blossom Way, Town"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Target Delivery
                </label>
                <input
                  type="date"
                  value={deliveryDateTarget}
                  onChange={(e) => setDeliveryDateTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Campaign
                </label>
                <input
                  type="text"
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Product Items Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900">
                Brochure Items Ordered
              </span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {selectedItems.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                const isOutOfStock = prod && prod.stockOnHand < item.quantity;

                return (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-[200px]">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-md focus:outline-hidden"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            [{p.lineCode}] {p.name} — ${p.brochurePrice.toFixed(2)} ({p.stockOnHand} in stock)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-neutral-500 text-[11px]">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="w-16 px-2 py-1 bg-white border border-neutral-200 rounded-md text-center font-mono font-semibold"
                        />
                      </div>

                      <div className="w-20 text-right font-mono font-bold text-neutral-900 tabular-nums">
                        ${prod ? (prod.brochurePrice * item.quantity).toFixed(2) : '0.00'}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        disabled={selectedItems.length === 1}
                        className="p-1 text-neutral-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {isOutOfStock && (
                      <div className="text-[11px] text-amber-700 flex items-center gap-1 sm:w-full mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>
                          Only {prod?.stockOnHand} on hand. Remaining will be flagged for Campaign PO reorder.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sample Extras & Gifts for Signature Avon Bag */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-rose-600" />
              <span>Complimentary Samples &amp; Next Campaign Brochure to Include</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSampleOptions.map((s) => {
                const checked = selectedSamples.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSample(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      checked
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-transparent'
                    }`}
                  >
                    {checked ? '✓ ' : '+ '} {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment & Financial Summary */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-hidden"
                >
                  <option value="Venmo / Zelle">Venmo / Zelle</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Check">Check</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Sales Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={salesTaxPercent}
                  onChange={(e) => setSalesTaxPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-3 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="space-y-0.5">
                <div className="text-neutral-500">
                  Subtotal: <span className="font-mono tabular-nums text-neutral-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="text-neutral-500">
                  Tax ({salesTaxPercent}%): <span className="font-mono tabular-nums text-neutral-900">${salesTaxAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-0.5 text-right">
                <div className="text-neutral-500">
                  Rep Profit:{' '}
                  <span className="font-mono font-bold text-emerald-700 tabular-nums">
                    +${repProfit.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm font-bold text-neutral-900">
                  Total Customer Due:{' '}
                  <span className="font-mono tabular-nums text-base text-rose-600">
                    ${totalDue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Customer Instructions / Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Leave on back porch if not home; loves vanilla fragrance."
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
              disabled={builtItems.length === 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Confirm &amp; Allocate Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
