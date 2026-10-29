import React from 'react';
import { X, Printer, Download, Check, Sparkles, Heart } from 'lucide-react';
import { CustomerOrder } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';

interface PackingSlipModalProps {
  order: CustomerOrder | null;
  onClose: () => void;
}

export const PackingSlipModal: React.FC<PackingSlipModalProps> = ({ order, onClose }) => {
  const { repTier } = useInventory();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden my-8">
        {/* Modal Controls (Not Printed) */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-semibold">
              Customer Bagging Slip &amp; Delivery Invoice
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bag Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Delivery Slip Section */}
        <div id="printable-receipt" className="p-8 text-neutral-900 bg-white space-y-6 font-sans">
          {/* Slip Header */}
          <div className="flex items-start justify-between border-b-2 border-rose-600 pb-5">
            <div>
              <div className="text-2xl font-black tracking-tight text-neutral-950 font-display">
                AVON
              </div>
              <div className="text-xs font-semibold text-rose-700 uppercase tracking-widest mt-0.5">
                Official Representative Delivery Receipt
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Your Independent Avon Beauty Representative
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <div className="font-mono font-bold text-sm text-neutral-900">
                {order.orderNumber}
              </div>
              <div className="text-neutral-500">{order.campaign}</div>
              <div className="text-neutral-500">Date: {order.orderDate}</div>
              <div className="inline-block bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded text-[10px] font-mono mt-1">
                {order.isPaid ? 'PAID IN FULL' : 'PAYMENT DUE ON DELIVERY'}
              </div>
            </div>
          </div>

          {/* Customer & Rep Details */}
          <div className="grid grid-cols-2 gap-6 text-xs bg-neutral-50 p-4 rounded-lg border border-neutral-200">
            <div>
              <div className="font-bold text-neutral-900 mb-1">Delivered To:</div>
              <div className="font-semibold text-neutral-950">{order.customerName}</div>
              {order.deliveryAddress && (
                <div className="text-neutral-600">{order.deliveryAddress}</div>
              )}
              {order.customerPhone && (
                <div className="text-neutral-600">{order.customerPhone}</div>
              )}
            </div>

            <div>
              <div className="font-bold text-neutral-900 mb-1">Your Avon Representative:</div>
              <div className="font-semibold text-neutral-950">Avon Beauty Specialist</div>
              <div className="text-neutral-600">Email: beautyrep@avon-team.com</div>
              <div className="text-neutral-600 font-mono text-[11px]">Shop 24/7: avon.com/rep/direct</div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-neutral-300 text-neutral-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2">Line Code</th>
                  <th className="py-2">Product Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {order.items.map((item, idx) => {
                  const lineTotal = item.quantity * item.unitRetailPrice;
                  return (
                    <tr key={idx} className="py-2">
                      <td className="py-2.5 font-mono text-neutral-600 text-[11px]">
                        {item.lineCode}
                      </td>
                      <td className="py-2.5 font-medium text-neutral-900">
                        {item.productName}
                      </td>
                      <td className="py-2.5 text-center font-mono font-semibold tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-neutral-700">
                        ${item.unitRetailPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold tabular-nums text-neutral-950">
                        ${lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Box */}
          <div className="border-t-2 border-neutral-200 pt-4 flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Brochure Subtotal:</span>
                <span className="font-mono tabular-nums font-semibold">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Sales Tax ({order.salesTaxPercent}%):</span>
                <span className="font-mono tabular-nums">${order.salesTaxAmount.toFixed(2)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery Handling:</span>
                  <span className="font-mono tabular-nums">${order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-neutral-950 border-t border-neutral-300 pt-2">
                <span>Total Amount Due:</span>
                <span className="font-mono tabular-nums text-base text-rose-700">
                  ${order.totalDue.toFixed(2)}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 text-right pt-0.5">
                Payment Method: {order.paymentMethod}
              </div>
            </div>
          </div>

          {/* Enclosed Samples & Thank You Note */}
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-rose-800 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Specially Enclosed in Your Avon Bag:</span>
            </div>
            <div className="text-neutral-700">
              {order.sampleGifts && order.sampleGifts.length > 0 ? (
                <span>{order.sampleGifts.join(' · ')}</span>
              ) : (
                <span>Next Campaign Brochure preview included!</span>
              )}
            </div>
            <p className="text-[11px] text-neutral-600 italic pt-1 border-t border-rose-100">
              &quot;Thank you so much for your order! As your local Avon representative, I appreciate your support. Enjoy your new beauty favorites, and look through the enclosed brochure for our next specials!&quot;
            </p>
          </div>
        </div>

        {/* Modal Footer (Not Printed) */}
        <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between print:hidden">
          <div className="text-xs text-neutral-500">
            Ready for receipt printing &amp; bag stapling
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-200 hover:bg-neutral-300 rounded-lg transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
