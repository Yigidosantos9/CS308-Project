// frontend/src/pages/AdminDashboard.jsx (or similar)
import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { productService } from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  // Sidebar Menu Items
  const menuItems = [
    'Overview',
    'Products',
    'Inventory',
    'Sales Analytics',
    'Returns / QA',
    'Settings'
  ];

  // --- SUB-COMPONENTS FOR TABS ---

  const OverviewTab = () => (
    <div className="max-w-4xl">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-2xl font-bold uppercase tracking-tight">Overview</h2>
        <span className="text-gray-500 text-sm">Last 30 days</span>
      </div>

      {/* Stats Grid (currently static placeholders, backend analytics TODO) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Revenue */}
        <div className="flex flex-col gap-2">
          <span className="text-base font-normal text-black">Revenue</span>
          <div className="flex items-center gap-3">
            <div className="h-12 w-full border border-gray-400 rounded-lg"></div>
            <span className="text-green-500 font-bold text-sm">+12.8%</span>
          </div>
        </div>

        {/* Units Sold */}
        <div className="flex flex-col gap-2">
          <span className="text-base font-normal text-black">Units Sold</span>
          <div className="flex items-center gap-3">
            <div className="h-12 w-full border border-gray-400 rounded-lg"></div>
            <span className="text-red-500 font-bold text-sm">+2.5%</span>
          </div>
        </div>

        {/* Return Rate */}
        <div className="flex flex-col gap-2">
          <span className="text-base font-normal text-black">Return Rate</span>
          <div className="flex items-center gap-3">
            <div className="h-12 w-full border border-gray-400 rounded-lg"></div>
            <span className="text-red-500 font-bold text-sm">+5%</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row (Placeholders) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-base font-normal text-black">SMTH SMTH</span>
          <div className="flex items-center gap-3">
            <div className="h-12 w-full border border-gray-400 rounded-lg"></div>
            <span className="text-red-500 font-bold text-sm">+5%</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-base font-normal text-black">BLBLBL</span>
          <div className="flex items-center gap-3">
            <div className="h-12 w-full border border-gray-400 rounded-lg"></div>
            <span className="text-red-500 font-bold text-sm">+2.5%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductsTab = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    const loadProducts = async (query = '') => {
      try {
        setLoading(true);
        setError(null);

        const filter = {
          q: query || undefined,
          // you can also add admin-side filters later: category, gender, color, sort...
        };

        const data = await productService.getProducts(filter);
        setProducts(data || []);
      } catch (err) {
        console.error('Admin Products Load Error:', err);
        setError('Failed to load products. Check backend /api/products.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadProducts(search);
    }, [search]);

    const handleDelete = async (id) => {
      const confirm = window.confirm('Are you sure you want to delete this product?');
      if (!confirm) return;

      try {
        await productService.deleteProduct(id);
        // Optimistically update UI
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert(
          'Failed to delete product. ' +
          'Make sure the backend delete endpoint is implemented and you are authorized.'
        );
      }
    };

    return (
      <div className="max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Products</h2>

          {/* Search + Add */}
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:border-black"
              />
            </div>
            <button className="bg-[#4299E1] hover:bg-[#3182CE] text-white font-bold py-2 px-6 rounded shadow-sm text-sm uppercase tracking-wide flex items-center gap-2 self-end">
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 w-full rounded-lg bg-gray-100 animate-pulse"
              ></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-gray-500 text-sm">
            No products found. Try a different search.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {products.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col md:flex-row items-center p-4 border border-gray-200 border-dashed rounded-lg bg-white shadow-sm gap-6"
              >
                {/* Image Placeholder */}
                <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0"></div>

                {/* Info Group */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full items-center">
                  
                  {/* Name */}
                  <div className="col-span-2 md:col-span-1">
                    <h3 className="font-bold text-black text-sm">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {item.brand || 'RAWCTRL'}
                    </p>
                  </div>

                  {/* Category / Price */}
                  <div className="text-sm border-l border-gray-300 pl-4">
                    <p className="font-bold text-black">
                      {item.productType || 'Category'}
                    </p>
                    <p className="text-gray-600">
                      {item.price != null ? `${item.price.toFixed(2)} TL` : '--'}
                    </p>
                  </div>

                  {/* Stock */}
                  <div className="text-sm border-l border-gray-300 pl-4">
                    <p className="text-gray-600">In Stock:</p>
                    <p className="font-bold text-black">
                      {item.stock != null ? item.stock : 0}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-center pl-4 border-l border-transparent md:border-gray-300">
                    <button
                      className="bg-[#4299E1] text-white text-xs font-bold py-1 px-3 rounded hover:bg-blue-600 uppercase flex items-center gap-1"
                      type="button"
                      onClick={() => {
                        // TODO: open edit modal / navigate to edit page
                        console.log('Edit product clicked:', item.id);
                        alert('Edit product UI not implemented yet.');
                      }}
                    >
                      <Edit2 size={12} /> EDIT
                    </button>
                    <button
                      className="bg-[#E53E3E] text-white text-xs font-bold py-1 px-3 rounded hover:bg-red-600 uppercase flex items-center gap-1"
                      type="button"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={12} /> DELETE
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-white pt-10 pb-20 px-4 md:px-16">
      <div className="container mx-auto max-w-7xl">
        
        {/* Layout Grid */}
        <div className="flex flex-col md:flex-row min-h-[600px]">
          
          {/* SIDEBAR */}
          <div className="w-full md:w-1/4 border-r border-gray-300 pr-8 md:pr-12 pt-4">
            <h1 className="text-xl font-bold mb-10 tracking-wide text-black uppercase">
              ADMIN CONTROL
            </h1>
            
            <ul className="flex flex-col gap-6 pl-2">
              {menuItems.map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => setActiveTab(item)}
                    className={`flex items-center gap-3 text-sm font-bold uppercase tracking-wider transition-colors ${
                      activeTab === item ? 'text-black' : 'text-black hover:opacity-70'
                    }`}
                  >
                    {/* Square Bullet */}
                    <span className={`w-1.5 h-1.5 bg-black ${activeTab === item ? 'opacity-100' : 'opacity-0'}`}></span>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 pl-0 md:pl-20 pt-4">
            {activeTab === 'Overview' && <OverviewTab />}
            {activeTab === 'Products' && <ProductsTab />}
            
            {!['Overview', 'Products'].includes(activeTab) && (
              <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                <p>{activeTab} module coming soon.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
