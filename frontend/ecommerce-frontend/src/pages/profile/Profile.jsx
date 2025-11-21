import { useState } from 'react';
import { useShop } from '../../context/ShopContext';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  const { user } = useShop(); // Access user state if needed later

  const menuItems = [
    'Profile',
    'Addresses',
    'Orders',
    'Payment Methods',
    'Security / Password',
    'Notifications / Preferences'
  ];

  // Placeholder Content Components
  const ProfileContent = () => (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-8">My Profile</h2>
      <form className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold uppercase tracking-wider">Name</label>
            <input type="text" placeholder="John" className="border-b border-black py-2 outline-none focus:border-gray-500 bg-transparent" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold uppercase tracking-wider">Surname</label>
            <input type="text" placeholder="Doe" className="border-b border-black py-2 outline-none focus:border-gray-500 bg-transparent" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold uppercase tracking-wider">Email</label>
          <input type="email" placeholder="john.doe@example.com" className="border-b border-black py-2 outline-none focus:border-gray-500 bg-transparent" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold uppercase tracking-wider">Phone</label>
          <input type="tel" placeholder="+1 234 567 8900" className="border-b border-black py-2 outline-none focus:border-gray-500 bg-transparent" />
        </div>
        <button className="bg-black text-white py-4 px-8 mt-4 font-bold uppercase tracking-wider hover:opacity-90 w-fit">
          Save Changes
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] pt-12 pb-24 px-4 md:px-12">
      <div className="container mx-auto max-w-7xl">
        
        {/* Main Layout Grid */}
        <div className="flex flex-col md:flex-row min-h-[600px]">
          
          {/* LEFT SIDEBAR - USER DETAILS */}
          <div className="w-full md:w-1/4 border-r border-black pr-8 md:pr-12">
            <h1 className="text-2xl font-bold mb-10 tracking-tight uppercase">
              User Details
            </h1>
            
            <ul className="flex flex-col gap-6">
              {menuItems.map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => setActiveTab(item)}
                    className={`flex items-center gap-3 text-lg font-bold transition-colors ${
                      activeTab === item ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {/* Square Bullet Point */}
                    <span className={`w-1.5 h-1.5 bg-black ${activeTab === item ? 'opacity-100' : 'opacity-0'}`}></span>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="flex-1 pl-0 md:pl-12 pt-10 md:pt-0">
            {activeTab === 'Profile' && <ProfileContent />}
            
            {/* Placeholders for other tabs */}
            {activeTab !== 'Profile' && (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p>Content for {activeTab} will go here.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;