import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const MainLayout = () => {
  return (
    // Changed bg-white to bg-[#F5F5F5] to match the design background
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Navbar />
      {/* Removed default padding so images can go full width if needed later */}
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-white text-center p-6 mt-auto border-t">
        <p className="text-gray-500 text-sm">© 2025 RAWCTRL. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;