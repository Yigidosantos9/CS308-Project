import { Link } from 'react-router-dom';

const Register = () => {
  return (
    // Reduced min-h to 900px to balance it with the Login page while fitting content
    <div className="flex flex-col md:flex-row min-h-[900px]">
      
      {/* LEFT SIDE - FORM */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 bg-[#F5F5F5] py-20">
        
        {/* Header Tabs */}
        {/* Reduced margin to mb-12 to keep the header closer to the form */}
        <div className="flex items-center gap-4 mb-12">
          <Link to="/login" className="text-3xl font-bold text-gray-400 hover:text-black transition-colors underline decoration-2 underline-offset-8 decoration-transparent hover:decoration-gray-400">
            LOG IN
          </Link>
          <span className="text-3xl font-light text-gray-400">|</span>
          <h1 className="text-3xl font-bold tracking-tight">SIGN UP</h1>
        </div>

        {/* Form */}
        {/* Reduced gap to 6 so fields aren't too far apart */}
        <form className="flex flex-col gap-6 w-full max-w-md">
          
          {/* Name */}
          <div className="relative group">
            <label 
              htmlFor="name" 
              className="absolute -top-3 left-4 bg-[#F5F5F5] px-2 text-lg text-black z-10"
            >
              Name
            </label>
            <input 
              type="text" 
              id="name" 
              className="w-full bg-transparent border border-black rounded-xl px-6 py-4 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>

          {/* Surname */}
          <div className="relative group">
            <label 
              htmlFor="surname" 
              className="absolute -top-3 left-4 bg-[#F5F5F5] px-2 text-lg text-black z-10"
            >
              Surname
            </label>
            <input 
              type="text" 
              id="surname" 
              className="w-full bg-transparent border border-black rounded-xl px-6 py-4 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>

          {/* Email */}
          <div className="relative group">
            <label 
              htmlFor="email" 
              className="absolute -top-3 left-4 bg-[#F5F5F5] px-2 text-lg text-black z-10"
            >
              Email
            </label>
            <input 
              type="email" 
              id="email" 
              className="w-full bg-transparent border border-black rounded-xl px-6 py-4 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <label 
              htmlFor="password" 
              className="absolute -top-3 left-4 bg-[#F5F5F5] px-2 text-lg text-black z-10"
            >
              Password
            </label>
            <input 
              type="password" 
              id="password" 
              className="w-full bg-transparent border border-black rounded-xl px-6 py-4 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>

          {/* Phone Number */}
          <div className="relative group">
            <label 
              htmlFor="phone" 
              className="absolute -top-3 left-4 bg-[#F5F5F5] px-2 text-lg text-black z-10"
            >
              Phone Number
            </label>
            <input 
              type="tel" 
              id="phone" 
              className="w-full bg-transparent border border-black rounded-xl px-6 py-4 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-8 mt-8">
            <button 
              type="button" 
              className="bg-black text-white text-sm font-bold px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wider"
            >
              Sign Up
            </button>
            <a href="#" className="text-gray-400 text-sm hover:text-black transition-colors">
              Forgot Password?
            </a>
          </div>

        </form>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div className="hidden md:block w-1/2 relative">
        <img 
          src="https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=2070&auto=format&fit=crop" 
          alt="Fashion Lifestyle" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

    </div>
  );
};

export default Register;