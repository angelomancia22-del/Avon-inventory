import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  SlidersHorizontal,
  Package,
  AlertTriangle,
  ArrowUpDown,
  MoreVertical,
  PlusCircle,
  MinusCircle,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { Product, ProductCategory } from '../types/inventory';

interface ProductCatalogProps {
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onViewProductDetails: (product: Product) => void;
  onQuickAdjust: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onOpenNewProduct,
  onEditProduct,
  onViewProductDetails,
  onQuickAdjust,
}) => {
  const { products, adjustStock, deleteProduct } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const categories: ProductCategory[] = [
    'All',
    'Skincare',
    'Fragrance',
    'Bath & Body',
    'Makeup',
    'Personal Care',
    'Demo & Samples',
  ];

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (stockStatusFilter === 'low' && p.stockOnHand > p.reorderThreshold) {
        return false;
      }
      if (stockStatusFilter === 'out' && p.stockOnHand > 0) {
        return false;
      }
      if (stockStatusFilter === 'in' && p.stockOnHand === 0) {
        return false;
      }
      if (stockStatusFilter === 'fast' && !p.isFastMover) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSku = p.sku.toLowerCase().includes(query);
        const matchesLineCode = p.lineCode.toLowerCase().includes(query);
        const matchesBrand = p.brandLine.toLowerCase().includes(query);
        const matchesShelf = p.shelfLocation?.toLowerCase().includes(query);
        if (!matchesName && !matchesSku && !matchesLineCode && !matchesBrand && !matchesShelf) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [products, selectedCategory, stockStatusFilter, searchQuery, sortField, sortAsc]);

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleQuickAdd = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    adjustStock(p.id, 1, 'Quick restock adjustment (+1)', 'Stock Adjustment');
  };

  const handleQuickMinus = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (p.stockOnHand > 0) {
      adjustStock(p.id, -1, 'Quick stock adjustment (-1)', 'Stock Adjustment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Avon Product Master Catalog
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage brochure items, line codes, shelf locations, and on-hand stock quantities
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 border border-neutral-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenNewProduct}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Catalog Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 space-y-4">
        {/* Search & Status Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product name, Avon line code (e.g. 492-310), SKU, or bin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <span>Status:</span>
            </div>
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Inventory</option>
              <option value="low">Low Stock Alerts</option>
              <option value="out">Out of Stock</option>
              <option value="in">In Stock Only</option>
              <option value="fast">Fast Movers</option>
            </select>
          </div>
        </div>

        {/* Category Segmented Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-neutral-100 pt-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Catalog View: Table or Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
          <Package className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-900">No products match your criteria</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the selected category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setStockStatusFilter('all');
            }}
            className="mt-4 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 rounded-lg cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* High-Density Data Grid (SaaS Guidelines) */
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-600 font-semibold">
                  <th className="py-3 px-4 w-12">Photo</th>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-4 cursor-pointer hover:text-neutral-900"
                  >
                    <div className="flex items-center gap-1">
                      <span>Product &amp; Line Code</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('category')}
                    className="py-3 px-3 cursor-pointer hover:text-neutral-900"
                  >
                    Category
                  </th>
                  <th className="py-3 px-3">Location</th>
                  <th
                    onClick={() => handleSort('stockOnHand')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-neutral-900"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>On Hand</span>
                      <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3 text-right">Reserved</th>
                  <th className="py-3 px-3 text-right">Available</th>
                  <th
                    onClick={() => handleSort('wholesaleCost')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-neutral-900"
                  >
                    Rep Cost
                  </th>
                  <th
                    onClick={() => handleSort('brochurePrice')}
                    className="py-3 px-3 text-right cursor-pointer hover:text-neutral-900"
                  >
                    Retail
                  </th>
                  <th className="py-3 px-3 text-right">Profit Margin</th>
                  <th className="py-3 px-4 text-center">Quick +/-</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((p) => {
                  const available = Math.max(0, p.stockOnHand - p.stockReserved);
                  const isLow = p.stockOnHand <= p.reorderThreshold;
                  const unitProfit = p.brochurePrice - p.wholesaleCost;
                  const marginPct = Math.round((unitProfit / p.brochurePrice) * 100);

                  return (
                    <tr
                      key={p.id}
                      onClick={() => onViewProductDetails(p)}
                      className="hover:bg-neutral-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Thumbnail */}
                      <td className="py-2.5 px-4">
                        <div className="w-10 h-10 rounded-md bg-neutral-100 overflow-hidden border border-neutral-200 shrink-0 flex items-center justify-center">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                      </td>

                      {/* Product Name & Line Code */}
                      <td className="py-2.5 px-4 min-w-[220px]">
                        <div className="font-semibold text-neutral-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-neutral-700 font-semibold">{p.lineCode}</span>
                          <span aria-hidden="true">·</span>
                          <span>{p.sku}</span>
                          {p.isFastMover && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-rose-700 font-medium">Fast Mover</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 text-neutral-600 whitespace-nowrap">
                        {p.category}
                      </td>

                      {/* Location */}
                      <td className="py-2.5 px-3 text-neutral-600 whitespace-nowrap font-mono text-[11px]">
                        {p.shelfLocation || 'Unassigned'}
                      </td>

                      {/* Stock on Hand */}
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            p.stockOnHand === 0
                              ? 'text-rose-600'
                              : isLow
                              ? 'text-amber-700'
                              : 'text-neutral-900'
                          }`}
                        >
                          {p.stockOnHand}
                        </span>
                        {isLow && (
                          <div className="text-[10px] text-amber-600">Reorder &le;{p.reorderThreshold}</div>
                        )}
                      </td>

                      {/* Reserved */}
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-500">
                        {p.stockReserved > 0 ? (
                          <span className="text-amber-700 font-medium">{p.stockReserved}</span>
                        ) : (
                          '0'
                        )}
                      </td>

                      {/* Available */}
                      <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-neutral-900">
                        {available}
                      </td>

                      {/* Wholesale Cost */}
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-600">
                        ${p.wholesaleCost.toFixed(2)}
                      </td>

                      {/* Brochure Retail */}
                      <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-neutral-900">
                        ${p.brochurePrice.toFixed(2)}
                      </td>

                      {/* Margin */}
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700">
                        +${unitProfit.toFixed(2)} ({marginPct}%)
                      </td>

                      {/* Quick Quantity Adjustment */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleQuickMinus(p, e)}
                            disabled={p.stockOnHand === 0}
                            className="p-1 text-neutral-400 hover:text-neutral-800 disabled:opacity-30 transition-colors"
                            title="Decrement stock by 1"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-mono font-semibold text-xs tabular-nums text-neutral-800">
                            {p.stockOnHand}
                          </span>
                          <button
                            onClick={(e) => handleQuickAdd(p, e)}
                            className="p-1 text-neutral-400 hover:text-neutral-800 transition-colors"
                            title="Increment stock by 1"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onQuickAdjust(p)}
                            className="p-1.5 text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 rounded-md transition-colors"
                            title="Stock Log / Audit"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove "${p.name}" from catalog?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const available = Math.max(0, p.stockOnHand - p.stockReserved);
            const isLow = p.stockOnHand <= p.reorderThreshold;
            const unitProfit = p.brochurePrice - p.wholesaleCost;

            return (
              <div
                key={p.id}
                onClick={() => onViewProductDetails(p)}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-all cursor-pointer flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="aspect-4/3 w-full bg-neutral-100 overflow-hidden relative border-b border-neutral-100">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <Package className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-neutral-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[11px] font-mono tabular-nums">
                      Code: {p.lineCode}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                      <span>{p.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{p.brandLine}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 group-hover:text-rose-600 transition-colors">
                      {p.name}
                    </h3>
                    <div className="text-xs text-neutral-500 font-mono">
                      Location: {p.shelfLocation || 'Main Bin'}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-neutral-100 mt-2 space-y-3">
                  <div className="flex items-center justify-between text-xs pt-3">
                    <div>
                      <div className="text-neutral-500">Stock on Hand</div>
                      <div className={`font-mono font-bold tabular-nums text-sm ${isLow ? 'text-amber-700' : 'text-neutral-900'}`}>
                        {p.stockOnHand} <span className="text-[11px] font-normal text-neutral-500">({available} avail)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-neutral-500">Brochure Retail</div>
                      <div className="font-mono font-bold tabular-nums text-sm text-neutral-900">
                        ${p.brochurePrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-100" onClick={(e) => e.stopPropagation()}>
                    <div className="text-[11px] text-emerald-700 font-mono">
                      +${unitProfit.toFixed(2)} profit
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleQuickMinus(p, e)}
                        disabled={p.stockOnHand === 0}
                        className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                      <span className="font-mono text-xs font-bold tabular-nums px-1">
                        {p.stockOnHand}
                      </span>
                      <button
                        onClick={(e) => handleQuickAdd(p, e)}
                        className="p-1 text-neutral-500 hover:text-neutral-900"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
