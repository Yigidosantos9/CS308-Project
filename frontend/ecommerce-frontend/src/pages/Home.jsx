import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 1,
    title: 'MEN',
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80',
    link: '/shop?targetAudience=men'
  },
  {
    id: 2,
    title: 'WOMEN',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    link: '/shop?targetAudience=women'
  },
  {
    id: 3,
    title: 'ALL PRODUCTS',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    link: '/shop'
  }
];

const Home = () => {
  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <div className="container mx-auto px-4 md:px-12 pb-20">

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative items-center">

          {categories.map((cat) => (
            <Link to={cat.link} key={cat.id} className="group block relative">

              {/* Image Container */}
              <div className="aspect-[3/4] w-full overflow-hidden rounded-t-xl bg-gray-200">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Label Box */}
              <div className="bg-white py-6 px-8 rounded-b-xl flex justify-between items-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="font-bold text-2xl tracking-wide">{cat.title}</span>
                <ArrowRight className="w-7 h-7 text-black group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </Link>
          ))}

        </div>
      </div>
    </div>
  );
};

export default Home;
