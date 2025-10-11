import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/helpers';
interface NavbarProps {
  onMenuButtonClick: () => void;
}
const Navbar: React.FC<NavbarProps> = ({
  onMenuButtonClick
}) => {
  const {
    user,
    logout
  } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };
  return <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center">
        <button onClick={onMenuButtonClick} className="mr-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 md:hidden dark:hover:bg-gray-800">
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-indigo-600">DigiSign</span>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={toggleDarkMode} className="rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:hover:bg-gray-800">
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button className="rounded-md p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:hover:bg-gray-800">
          <Bell className="h-5 w-5" />
        </button>
        <div className="relative">
          <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2">
            {user?.name ? <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-medium text-white">
                {getInitials(user.name)}
              </div> : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                <User className="h-5 w-5" />
              </div>}
          </button>
          {userMenuOpen && <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
              <div className="border-b px-4 py-2 dark:border-gray-700">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700" onClick={() => setUserMenuOpen(false)}>
                Cài đặt tài khoản
              </Link>
              <button onClick={() => {
            logout();
            setUserMenuOpen(false);
          }} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700">
                Đăng xuất
              </button>
            </div>}
        </div>
      </div>
    </header>;
};
export default Navbar;