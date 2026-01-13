import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

// Main categories to always show
const MAIN_CATEGORIES = [
  { value: 'TSHIRT', label: 'T-Shirts' },
  { value: 'JEANS', label: 'Jeans' },
  { value: 'DRESS', label: 'Dresses' },
  { value:  'JACKET', label: 'Jackets' },
];

// Additional categories (hidden by default)
const MORE_CATEGORIES = [
  { value: 'SHORTS', label: 'Shorts' },
  { value:  'HOODIE', label: 'Hoodies' },
  { value: 'SWEATER', label: 'Sweaters' },
  { value: 'POLO_SHIRT', label:  'Polo Shirts' },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);

  // Read filters from URL
  const currentCategory = searchParams.get('category') || '';
  const currentTargetAudience = searchParams. get('targetAudience') || '';
  const currentSort = searchParams. get('sort') || 'relevance';
  const searchQuery = searchParams.get('q') || '';

  // Auto-expand if a "more" category is currently selected
  useEffect(() => {
    if (currentCategory && MORE_CATEGORIES.some(cat => cat.value === currentCategory)) {
      setShowMoreCategories(true);
    }
  }, [currentCategory]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const filter = {
          q: searchQuery || null,
          category:  currentCategory || null,
          targetAudience: currentTargetAudience ?  currentTargetAudience. toUpperCase() : null,
          sort:  currentSort
        };

        const data = await productService. getProducts(filter);
        setProducts(data || []);
      } catch (err) {
        console.error("Shop Load Error:", err);
        setError("Failed to load products. Please ensure the backend is running.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [currentCategory, currentTargetAudience, currentSort, searchQuery]);

  // Handler to update URL params
  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);

    if (key === 'category') {
      newParams. delete('q');
    }

    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
    setIsMobileFiltersOpen(false);
  };

  // Get display title for the page
  const getPageTitle = () => {
    if (searchQuery) return `Search:  "${searchQuery}"`;
    if (currentTargetAudience) return currentTargetAudience. toUpperCase();
    if (currentCategory) {
      const allCats = [...MAIN_CATEGORIES, ... MORE_CATEGORIES];
      const found = allCats. find(c => c.value === currentCategory);
      return found ? found.label : currentCategory;
    }
    return 'All Products';
  };

  // Render category button
  const CategoryButton = ({ value, label }) => (
    <li>
      <button
        onClick={() => handleFilterChange('category', value)}
        className={`hover:text-black transition-colors ${
          currentCategory === value ? 'text-black font-bold underline' : ''
        }`}
      >
        {label}
      </button>
    </li>
  );

  return (
    <div className="bg-[#F5F5F5] min-h-screen pt-8 pb-20">
      <div className="container mx-auto px-4 md:px-12">

        {/* Header */}
        <div className="flex justify-between items-end mb-8 border-b border-gray-300 pb-4">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight">
              {getPageTitle()}
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

          {/* SIDEBAR FILTERS */}
          <div className={`
            fixed inset-0 bg-white z-40 p-6 transform transition-transform duration-300 md:relative md:transform-none md:bg-transparent md:p-0 md:w-64 md: block
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
                {/* All option */}
                <li>
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className={`hover:text-black transition-colors ${
                      ! currentCategory ?  'text-black font-bold underline' : ''
                    }`}
                  >
                    All
                  </button>
                </li>

                {/* Main categories */}
                {MAIN_CATEGORIES.map((cat) => (
                  <CategoryButton key={cat.value} value={cat.value} label={cat. label} />
                ))}

                {/* Additional categories (when expanded) */}
                {showMoreCategories && MORE_CATEGORIES.map((cat) => (
                  <CategoryButton key={cat. value} value={cat.value} label={cat.label} />
                ))}

                {/* Show More / Show Less Toggle */}
                <li className="pt-1">
                  <button
                    onClick={() => setShowMoreCategories(! showMoreCategories)}
                    className="flex items-center gap-1. 5 text-gray-400 hover:text-gray-600 transition-colors text-xs uppercase tracking-wide"
                  >
                    {showMoreCategories ?  (
                      <>
                        <ChevronUp size={14} />
                        <span>Show Less</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} />
                        <span>Show More</span>
                      </>
                    )}
                  </button>
                </li>
              </ul>
            </div>

            {/* Target Audience */}
            <div className="mb-10">
              <h3 className="font-bold text-sm uppercase mb-4 tracking-wider">Shop For</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                {['All', 'Men', 'Women', 'Kids']. map((audience) => {
                  const audienceValue = audience === 'All' ?  '' : audience.toUpperCase();
                  const isActive = currentTargetAudience. toUpperCase() === audienceValue || 
                                   (audience === 'All' && ! currentTargetAudience);
                  
                  return (
                    <li key={audience}>
                      <button
                        onClick={() => handleFilterChange('targetAudience', audience === 'All' ?  '' : audience. toLowerCase())}
                        className={`hover:text-black transition-colors ${
                          isActive ? 'text-black font-bold underline' :  ''
                        }`}
                      >
                        {audience}
                      </button>
                    </li>
                  );
                })}
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
                <option value="popularity">Popularity</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="nameAsc">Name:  A - Z</option>
                <option value="nameDesc">Name:  Z - A</option>
                <option value="newest">Newest Arrivals</option>
                <option value="ratingDesc">Rating: High to Low</option>
                <option value="ratingAsc">Rating:  Low to High</option>
              </select>
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[... Array(6)].map((_, i) => (
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
                <p className="text-gray-500">Try changing your filters or search term. </p>
                <div className="flex gap-4 justify-center mt-4">
                  {searchQuery && (
                    <button
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete('q');
                        setSearchParams(newParams);
                      }}
                      className="text-black underline hover:no-underline"
                    >
                      Clear Search
                    </button>
                  )}
                  {(currentCategory || currentTargetAudience) && (
                    <button
                      onClick={() => {
                        const newParams = new URLSearchParams();
                        if (currentSort !== 'relevance') {
                          newParams.set('sort', currentSort);
                        }
                        setSearchParams(newParams);
                      }}
                      className="text-black underline hover: no-underline"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                {products.map((product) => (
                  <ProductCard key={product. id} product={product} />
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