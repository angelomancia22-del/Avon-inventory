import React, { useState, useEffect } from 'react';
import { X, Package, Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import { Product, ProductCategory } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  mode: 'create' | 'edit' | 'view';
}

const PRESET_IMAGES = [
  {
    name: 'Bath Oil / Skin So Soft',
    url: '/src/assets/images/avon_skin_so_soft_bath_oil_1793264832470.jpg',
  },
  {
    name: 'Facial Serum / Anew',
    url: '/src/assets/images/avon_anew_skincare_serum_1793264833936.jpg',
  },
  {
    name: 'Far Away Perfume',
    url: '/src/assets/images/avon_far_away_perfume_1793264834376.jpg',
  },
  {
    name: 'Lipstick & Cosmetics / Glimmer',
    url: '/src/assets/images/avon_glimmer_cosmetics_1793264834588.jpg',
  },
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  mode,
}) => {
  const { addProduct, updateProduct, repCommissionRate } = useInventory();

  const [formData, setFormData] = useState({
    sku: '',
    lineCode: '',
    name: '',
    category: 'Skincare' as Exclude<ProductCategory, 'All'>,
    brandLine: 'Anew',
    description: '',
    campaignIntroduced: 'Campaign 21',
    currentBrochureCampaign: 'Campaign 21',
    wholesaleCost: 15.0,
    brochurePrice: 25.0,
    stockOnHand: 5,
    reorderThreshold: 3,
    shelfLocation: 'Shelf A-01',
    batchExpiry: '2028-06',
    imageUrl: PRESET_IMAGES[1].url,
    isDemoSample: false,
    isFastMover: true,
    notes: '',
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        sku: productToEdit.sku,
        lineCode: productToEdit.lineCode,
        name: productToEdit.name,
        category: productToEdit.category,
        brandLine: productToEdit.brandLine,
        description: productToEdit.description || '',
        campaignIntroduced: productToEdit.campaignIntroduced,
        currentBrochureCampaign: productToEdit.currentBrochureCampaign,
        wholesaleCost: productToEdit.wholesaleCost,
        brochurePrice: productToEdit.brochurePrice,
        stockOnHand: productToEdit.stockOnHand,
        reorderThreshold: productToEdit.reorderThreshold,
        shelfLocation: productToEdit.shelfLocation,
        batchExpiry: productToEdit.batchExpiry || '2028-06',
        imageUrl: productToEdit.imageUrl || PRESET_IMAGES[0].url,
        isDemoSample: productToEdit.isDemoSample,
        isFastMover: productToEdit.isFastMover,
        notes: productToEdit.notes || '',
      });
    } else {
      // Default new product values
      const randomLine = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
      setFormData({
        sku: `AVN-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        lineCode: randomLine,
        name: '',
        category: 'Skincare',
        brandLine: 'Anew',
        description: '',
        campaignIntroduced: 'Campaign 21',
        currentBrochureCampaign: 'Campaign 21',
        wholesaleCost: 15.0,
        brochurePrice: 25.0,
        stockOnHand: 6,
        reorderThreshold: 3,
        shelfLocation: 'Shelf A-01',
        batchExpiry: '2028-12',
        imageUrl: PRESET_IMAGES[0].url,
        isDemoSample: false,
        isFastMover: false,
        notes: '',
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const unitProfit = formData.brochurePrice - formData.wholesaleCost;
  const marginPct = formData.brochurePrice > 0
    ? Math.round((unitProfit / formData.brochurePrice) * 100)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (mode === 'create') {
      addProduct({
        sku: formData.sku,
        lineCode: formData.lineCode,
        name: formData.name,
        category: formData.category,
        brandLine: formData.brandLine,
        description: formData.description,
        campaignIntroduced: formData.campaignIntroduced,
        currentBrochureCampaign: formData.currentBrochureCampaign,
        wholesaleCost: Number(formData.wholesaleCost),
        brochurePrice: Number(formData.brochurePrice),
        stockOnHand: Number(formData.stockOnHand),
        stockReserved: 0,
        reorderThreshold: Number(formData.reorderThreshold),
        shelfLocation: formData.shelfLocation,
        batchExpiry: formData.batchExpiry,
        imageUrl: formData.imageUrl,
        isDemoSample: formData.isDemoSample,
        isFastMover: formData.isFastMover,
        notes: formData.notes,
      });
    } else if (mode === 'edit' && productToEdit) {
      updateProduct(productToEdit.id, {
        sku: formData.sku,
        lineCode: formData.lineCode,
        name: formData.name,
        category: formData.category,
        brandLine: formData.brandLine,
        description: formData.description,
        campaignIntroduced: formData.campaignIntroduced,
        currentBrochureCampaign: formData.currentBrochureCampaign,
        wholesaleCost: Number(formData.wholesaleCost),
        brochurePrice: Number(formData.brochurePrice),
        stockOnHand: Number(formData.stockOnHand),
        reorderThreshold: Number(formData.reorderThreshold),
        shelfLocation: formData.shelfLocation,
        batchExpiry: formData.batchExpiry,
        imageUrl: formData.imageUrl,
        isDemoSample: formData.isDemoSample,
        isFastMover: formData.isFastMover,
        notes: formData.notes,
      });
    }

    onClose();
  };

  const isViewOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-neutral-200 shadow-xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {mode === 'create'
                ? 'Add New Avon Catalog Product'
                : mode === 'edit'
                ? `Edit: ${productToEdit?.name}`
                : `Product Details: ${productToEdit?.name}`}
            </h2>
            <div className="text-xs text-neutral-500 mt-0.5">
              {mode === 'create'
                ? 'Register incoming item into representative inventory tracking'
                : `Line code ${formData.lineCode} · ${formData.category}`}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Avon Product Name *
              </label>
              <input
                type="text"
                required
                disabled={isViewOnly}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Skin So Soft Original Bath Oil 16.9 oz"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-rose-500 disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Avon Brochure Line Code * (e.g. 492-310)
              </label>
              <input
                type="text"
                required
                disabled={isViewOnly}
                value={formData.lineCode}
                onChange={(e) => setFormData({ ...formData, lineCode: e.target.value })}
                placeholder="492-310"
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-rose-500 disabled:opacity-75"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Category
              </label>
              <select
                disabled={isViewOnly}
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as Exclude<ProductCategory, 'All'>,
                  })
                }
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden disabled:opacity-75"
              >
                <option value="Skincare">Skincare</option>
                <option value="Fragrance">Fragrance</option>
                <option value="Bath & Body">Bath & Body</option>
                <option value="Makeup">Makeup</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Demo & Samples">Demo & Samples</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Brand Line
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={formData.brandLine}
                onChange={(e) => setFormData({ ...formData, brandLine: e.target.value })}
                placeholder="Anew / Skin So Soft"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                SKU / Internal Tag
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden disabled:opacity-75"
              />
            </div>
          </div>

          {/* Pricing & Profit Calculation Card */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900">
                Representative Pricing &amp; Commission Calculation
              </span>
              <span className="text-xs font-mono text-emerald-700 font-semibold">
                Margin: {marginPct}% (+${unitProfit.toFixed(2)} / unit)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Brochure Retail Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  disabled={isViewOnly}
                  value={formData.brochurePrice}
                  onChange={(e) => {
                    const retail = parseFloat(e.target.value) || 0;
                    // Auto-suggest wholesale cost based on rep commission
                    const suggestedWholesale = parseFloat((retail * (1 - repCommissionRate)).toFixed(2));
                    setFormData({
                      ...formData,
                      brochurePrice: retail,
                      wholesaleCost: suggestedWholesale,
                    });
                  }}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                  Rep Wholesale Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  disabled={isViewOnly}
                  value={formData.wholesaleCost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wholesaleCost: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-200 rounded-lg focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Stock, Location, Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Stock On Hand
              </label>
              <input
                type="number"
                min="0"
                required
                disabled={isViewOnly}
                value={formData.stockOnHand}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockOnHand: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Reorder Threshold
              </label>
              <input
                type="number"
                min="0"
                required
                disabled={isViewOnly}
                value={formData.reorderThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorderThreshold: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Shelf / Bin Storage
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={formData.shelfLocation}
                onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                placeholder="Shelf A-01"
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Batch Expiry
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={formData.batchExpiry}
                onChange={(e) => setFormData({ ...formData, batchExpiry: e.target.value })}
                placeholder="2028-06"
                className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          {/* Product Photography Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Product Photography Asset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_IMAGES.map((img) => {
                const isSelected = formData.imageUrl === img.url;
                return (
                  <button
                    key={img.url}
                    type="button"
                    disabled={isViewOnly}
                    onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                    className={`relative rounded-lg overflow-hidden border p-1 text-left transition-all ${
                      isSelected
                        ? 'border-rose-600 ring-2 ring-rose-200'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="aspect-4/3 w-full bg-neutral-100 rounded overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[10px] text-neutral-600 mt-1 truncate font-medium">
                      {img.name}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-rose-600 text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                disabled={isViewOnly}
                checked={formData.isFastMover}
                onChange={(e) => setFormData({ ...formData, isFastMover: e.target.checked })}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-neutral-700 font-medium">Mark as Fast Mover</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                disabled={isViewOnly}
                checked={formData.isDemoSample}
                onChange={(e) => setFormData({ ...formData, isDemoSample: e.target.checked })}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <span className="text-neutral-700 font-medium">Demo / Tester Sample Pack</span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Rep Catalog Notes / Customer Tips
            </label>
            <textarea
              rows={2}
              disabled={isViewOnly}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Campaign 22 brochure includes bundle deal; popular repeat order for holiday deliveries."
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
              {isViewOnly ? 'Close' : 'Cancel'}
            </button>
            {!isViewOnly && (
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {mode === 'create' ? 'Save Product to Inventory' : 'Update Catalog Item'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
