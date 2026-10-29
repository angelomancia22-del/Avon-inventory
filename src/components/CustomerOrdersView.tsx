import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  DollarSign,
  Truck,
  Gift,
  MoreVertical,
  Check,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { CustomerOrder, OrderStatus } from '../types/inventory';

interface CustomerOrdersViewProps {
  onOpenNewOrder: () => void;
  onViewPackingSlip: (order: CustomerOrder) => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  onOpenNewOrder,
  onViewPackingSlip,
}) => {
  const { orders, updateOrderStatus, deleteCustomerOrder, products } = useInventory();
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const statusFilters = [
    'All',
    'Pending Fulfillment',
    'Bagged & Packed',
    'Out for Delivery',
    'Delivered & Paid',
  ];

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== 'All' && order.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchAddr = order.deliveryAddress.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      if (!matchName && !matchNum && !matchAddr && !matchPhone) {
        return false;
      }
    }
    return true;
  });

  const totalSales = orders.reduce((acc, o) => acc + o.totalDue, 0);
  const totalRepProfit = orders.reduce((acc, o) => acc + o.repProfit, 0);
  const pendingCount = orders.filter((o) => o.status !== 'Delivered & Paid').length;

  return (
    <div className="space-y-6">
      {/* Title & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Avon Customer Order &amp; Delivery Station
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pack signature delivery bags, allocate stock, generate customer receipts, and collect payments
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Order</span>
        </button>
      </div>

      {/* Quick Order Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="text-xs text-neutral-500">Total Customer Orders</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
            {orders.length} <span className="text-xs font-normal text-neutral-400 font-sans">orders</span>
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {pendingCount} waiting for dispatch
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="text-xs text-neutral-500">Total Retail Order Volume</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
            ${totalSales.toFixed(2)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Gross customer delivery total
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="text-xs text-neutral-500">Representative Earnings</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-1">
            +${totalRepProfit.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-1">
            Commission on campaign orders
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200">
          <div className="text-xs text-neutral-500">Fulfillment Status</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-neutral-900 mt-1">
            {orders.filter((o) => o.status === 'Delivered & Paid').length} / {orders.length}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Orders delivered &amp; paid in full
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, order # (e.g. ORD-C21-101), address, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-rose-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-neutral-100 pt-2">
          {statusFilters.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedStatus === st
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-900">No orders found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? 'Try clearing your search query.' : 'Create your first customer delivery order.'}
          </p>
          <button
            onClick={onOpenNewOrder}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
          >
            Create Customer Order
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isDelivered = order.status === 'Delivered & Paid';
            const isPacked = order.status === 'Bagged & Packed';
            const isPending = order.status === 'Pending Fulfillment';

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 transition-all shadow-xs space-y-4"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-neutral-900">
                        {order.customerName}
                      </span>
                      <span className="text-xs font-mono text-neutral-500">
                        {order.orderNumber}
                      </span>
                      <span aria-hidden="true" className="text-neutral-300">·</span>
                      <span className="text-xs text-neutral-500">{order.campaign}</span>
                    </div>
                    <div className="text-xs text-neutral-500 flex items-center gap-2">
                      <span>{order.customerPhone}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate max-w-md">{order.deliveryAddress}</span>
                    </div>
                  </div>

                  {/* Status Indicator & Quick Change */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-neutral-900">
                        Status: <span className={
                          isDelivered ? 'text-emerald-700' : isPacked ? 'text-blue-700' : 'text-amber-700'
                        }>{order.status}</span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Target Delivery: {order.deliveryDateTarget}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isPending && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Bagged & Packed')}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Pack Bag</span>
                        </button>
                      )}

                      {isPacked && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Delivered & Paid', true)}
                          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Deliver &amp; Collect</span>
                        </button>
                      )}

                      <button
                        onClick={() => onViewPackingSlip(order)}
                        className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="View & Print Bag Delivery Slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Delivery Slip</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete order ${order.orderNumber} for ${order.customerName}?`)) {
                            deleteCustomerOrder(order.id);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Ordered Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-neutral-500 border-b border-neutral-100 font-medium">
                        <th className="pb-1.5">Item</th>
                        <th className="pb-1.5">Line Code</th>
                        <th className="pb-1.5 text-center">Qty</th>
                        <th className="pb-1.5 text-right">Unit Price</th>
                        <th className="pb-1.5 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50 font-mono">
                      {order.items.map((item, idx) => {
                        const lineTotal = item.quantity * item.unitRetailPrice;
                        return (
                          <tr key={idx} className="hover:bg-neutral-50/50">
                            <td className="py-2 font-sans font-medium text-neutral-900">
                              {item.productName}
                            </td>
                            <td className="py-2 text-neutral-600">{item.lineCode}</td>
                            <td className="py-2 text-center text-neutral-800 font-bold tabular-nums">
                              {item.quantity}
                            </td>
                            <td className="py-2 text-right tabular-nums text-neutral-600">
                              ${item.unitRetailPrice.toFixed(2)}
                            </td>
                            <td className="py-2 text-right tabular-nums text-neutral-900 font-bold">
                              ${lineTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Order Footer: Demo Samples, Subtotal & Payment */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-neutral-100 text-xs">
                  <div className="flex items-center gap-2 text-neutral-600 flex-wrap">
                    <Gift className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-medium text-neutral-800">Samples &amp; Extras in Bag:</span>
                    {order.sampleGifts && order.sampleGifts.length > 0 ? (
                      order.sampleGifts.map((sample, sIdx) => (
                        <span key={sIdx} className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded text-[11px]">
                          {sample}
                        </span>
                      ))
                    ) : (
                      <span className="text-neutral-400">None added</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-neutral-500">Rep Profit: </span>
                      <span className="font-mono font-bold text-emerald-700 tabular-nums">
                        +${order.repProfit.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Total Due: </span>
                      <span className="font-mono font-bold text-base text-neutral-900 tabular-nums">
                        ${order.totalDue.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 font-medium">
                      ({order.paymentMethod} {order.isPaid ? '· Paid' : '· Unpaid'})
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="bg-neutral-50 p-2.5 rounded-lg text-xs text-neutral-600 border border-neutral-200">
                    <strong className="text-neutral-700">Delivery Notes:</strong> {order.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
