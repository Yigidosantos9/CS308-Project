import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-100px)]"> {/* Subtract navbar height approx */}
      
      {/* LEFT SIDE - FORM */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 bg-[#F5F5F5]">
        
        {/* Header Tabs */}
        <div className="flex items-center gap-4 mb-12">
          <h1 className="text-3xl font-bold tracking-tight">LOG IN</h1>
          <span className="text-3xl font-light text-gray-400">|</span>
          <Link to="/register" className="text-3xl font-bold text-gray-400 hover:text-black transition-colors underline decoration-2 underline-offset-8 decoration-transparent hover:decoration-gray-400">
            SIGN UP
          </Link>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-6 w-full max-w-md">
          
          {/* Custom Input: Email */}
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

          {/* Custom Input: Password */}
          <div className="relative group mt-4">
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

          {/* Action Buttons */}
          <div className="flex items-center gap-8 mt-4">
            <button 
              type="button" // Changed to button to prevent submit for now
              className="bg-black text-white text-sm font-bold px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wider"
            >
              Log In
            </button>
            <a href="#" className="text-gray-400 text-sm hover:text-black transition-colors">
              Forgot Password?
            </a>
          </div>

        </form>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div className="hidden md:block w-1/2 h-full relative">
        <img 
          src="https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=2070&auto=format&fit=crop" 
          alt="Fashion Lifestyle" 
          className="w-full h-full object-cover"
        />
      </div>

    </div>
  );
};

export default Login;