import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import { Filter, X } from 'lucide-react';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Read filters from URL
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'relevance';
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build filter object based on ProductFilterRequest.java
        const filter = {
          q: searchQuery,
          category: currentCategory === 'all' ? null : currentCategory,
          sort: currentSort
        };

        const data = await productService.getProducts(filter);
        setProducts(data);
      } catch (err) {
        console.error("Shop Load Error:", err);
        setError("Failed to load products. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [currentCategory, currentSort, searchQuery]);

  // Handler to update URL params
  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setIsMobileFiltersOpen(false); // Close mobile menu on selection
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen pt-8 pb-20">
      <div className="container mx-auto px-4 md:px-12">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-300 pb-4">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">
              {currentCategory || 'All Products'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {products.length} Items Found
            </p>
          </div>
          
          {/* Mobile Filter Toggle */}
          <button 
            className="md:hidden flex items-center gap-2 font-bold text-sm"
            onClick={() => setIsMobileFiltersOpen(true)}
          >
            <Filter size={18} /> FILTERS
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          
          {/* SIDEBAR FILTERS (Desktop & Mobile Wrapper) */}
          <div className={`
            fixed inset-0 bg-white z-50 p-6 transform transition-transform duration-300 md:relative md:transform-none md:bg-transparent md:p-0 md:w-64 md:block
            ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            {/* Mobile Close Button */}
            <div className="flex justify-between items-center md:hidden mb-8">
              <h2 className="text-xl font-bold">FILTERS</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-10">
              <h3 className="font-bold text-sm uppercase mb-4 tracking-wider">Categories</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                {['All', 'Jeans', 'Sweatshirts', 'Accessories'].map((cat) => (
                  <li key={cat}>
                    <button 
                      onClick={() => handleFilterChange('category', cat === 'All' ? '' : cat.toLowerCase())}
                      className={`hover:text-black transition-colors ${
                        (currentCategory === cat.toLowerCase() || (cat === 'All' && !currentCategory)) 
                        ? 'text-black font-bold underline' 
                        : ''
                      }`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sort */}
            <div>
              <h3 className="font-bold text-sm uppercase mb-4 tracking-wider">Sort By</h3>
              <select 
                value={currentSort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 py-2 text-sm focus:border-black outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 text-gray-500">
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 text-black underline hover:no-underline"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-xl font-bold mb-2">No products found.</h3>
                <p className="text-gray-500">Try changing your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Shop;