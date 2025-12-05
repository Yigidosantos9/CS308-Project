// frontend/src/pages/profile/Profile.jsx
import { useState, useEffect } from 'react';
import { useShop } from '../../context/ShopContext';

const Profile = () => {
  const { user } = useShop();
  const [activeTab, setActiveTab] = useState('Profile');

  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

  const menuItems = [
    'Profile',
    'Addresses',
    'Orders',
    'Payment Methods',
    'Security / Password',
    'Notifications / Preferences'
  ];

  // When user is loaded/updated from backend, sync into form
  useEffect(() => {
    if (user) {
      setFormState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    setSaveStatus(null);
  };

  const handleSave = async () => {
    try {
      // TODO: When a profile-update endpoint exists, call it here.
      // Example (adjust endpoint/name with your backend):
      // await userService.updateProfile({
      //   firstName: formState.firstName,
      //   lastName: formState.lastName,
      //   email: formState.email,
      //   phoneNumber: formState.phone,
      // });

      console.log('Profile data to save (currently local-only):', formState);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 2500);
    } catch (err) {
      console.error('Failed to save profile', err);
      setSaveStatus('error');
    }
  };

  // Simple fallback if somehow user is null (should be protected by PrivateRoute)
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading profile… Please log in again if this takes too long.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-10 pb-20 px-4 md:px-16">
      <div className="container mx-auto max-w-7xl">
        
        {/* Main Layout: Sidebar + Content */}
        <div className="flex flex-col md:flex-row min-h-[600px]">
          
          {/* LEFT SIDEBAR - USER DETAILS */}
          <div className="w-full md:w-1/4 border-r border-gray-300 pr-8 md:pr-12 pt-4">
            <h1 className="text-xl font-bold mb-10 tracking-wide text-black uppercase">
              USER DETAILS
            </h1>
            
            <ul className="flex flex-col gap-6 pl-2">
              {menuItems.map((item) => (
                <li key={item}>
                  <button 
                    onClick={() => setActiveTab(item)}
                    className={`flex items-center gap-3 text-base font-bold transition-colors ${
                      activeTab === item ? 'text-black' : 'text-black hover:opacity-70'
                    }`}
                  >
                    {/* Square Bullet Point for Active State */}
                    <span className={`w-1 h-1 bg-black ${activeTab === item ? 'opacity-100' : 'opacity-0'}`}></span>
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT CONTENT AREA - FORM */}
          <div className="flex-1 pl-0 md:pl-20 pt-4">
            
            {activeTab === 'Profile' ? (
              <div className="max-w-3xl">
                
                {/* Header Section */}
                <div className="flex items-center gap-6 mb-12">
                  {/* Profile Picture Placeholder */}
                  <div className="w-24 h-24 rounded-full bg-gray-300 flex-shrink-0"></div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-black uppercase tracking-tight mb-1">
                      {formState.firstName || formState.lastName
                        ? `${formState.firstName} ${formState.lastName}`.trim()
                        : 'USER PROFILE'}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      View and update your personal information.
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
                  
                  {/* Row 1: First Name & Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                    <div className="flex flex-col gap-2">
                      <label className="text-base text-black font-normal">First Name</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-400 rounded-lg py-3 px-4 outline-none focus:border-black transition-colors"
                        value={formState.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-base text-black font-normal">Last Name</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-400 rounded-lg py-3 px-4 outline-none focus:border-black transition-colors"
                        value={formState.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Row 2: Email */}
                  <div className="flex flex-col gap-2 md:w-2/3 mx-auto md:mx-0">
                    <label className="text-base text-black font-normal">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full border border-gray-400 rounded-lg py-3 px-4 outline-none focus:border-black transition-colors"
                      value={formState.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>

                  {/* Row 3: Phone */}
                  <div className="flex flex-col gap-2 md:w-2/3 mx-auto md:mx-0">
                    <label className="text-base text-black font-normal">Phone Number</label>
                    <input 
                      type="tel" 
                      className="w-full border border-gray-400 rounded-lg py-3 px-4 outline-none focus:border-black transition-colors"
                      value={formState.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>

                  {/* Save Button + Status */}
                  <div className="flex flex-col items-center gap-3 mt-4">
                    <button 
                      type="button"
                      onClick={handleSave}
                      className="bg-[#6495ED] text-white font-bold py-3 px-10 rounded shadow-sm hover:bg-[#5380d6] transition-colors uppercase text-sm tracking-wide"
                    >
                      SAVE CHANGES
                    </button>

                    {saveStatus === 'success' && (
                      <p className="text-xs text-green-600">
                        Changes saved for this session. (Backend update endpoint not wired yet.)
                      </p>
                    )}
                    {saveStatus === 'error' && (
                      <p className="text-xs text-red-600">
                        Failed to save changes. Please try again.
                      </p>
                    )}
                  </div>

                </form>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p>Content for {activeTab} is not implemented yet.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
