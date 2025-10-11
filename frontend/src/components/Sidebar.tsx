import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, FileText, Users, Shield, ClipboardList, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen
}) => {
  const location = useLocation();
  const {
    user
  } = useAuth();
  const isAdmin = user?.role === 'admin';
  const menuItems = [{
    name: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />
  }, {
    name: 'Hợp đồng',
    path: '/contracts',
    icon: <FileText className="h-5 w-5" />
  }, {
    name: 'Người dùng',
    path: '/users',
    icon: <Users className="h-5 w-5" />,
    adminOnly: true
  }, {
    name: 'Vai trò',
    path: '/roles',
    icon: <Shield className="h-5 w-5" />,
    adminOnly: true
  }, {
    name: 'Nhật ký',
    path: '/logs',
    icon: <ClipboardList className="h-5 w-5" />,
    adminOnly: true
  }, {
    name: 'Cài đặt',
    path: '/settings',
    icon: <Settings className="h-5 w-5" />
  }];
  return <>
      {/* Mobile backdrop */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden" onClick={() => setIsOpen(false)}></div>}
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transform overflow-y-auto bg-indigo-700 transition duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center">
            <span className="text-xl font-bold text-white">DigiSign</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="rounded-md p-2 text-indigo-300 hover:bg-indigo-600 hover:text-white focus:outline-none md:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-5 px-2">
          {menuItems.map(item => {
          // Skip admin-only items for non-admin users
          if (item.adminOnly && !isAdmin) return null;
          const isActive = location.pathname === item.path;
          return <Link key={item.path} to={item.path} className={`mt-1 flex items-center rounded-md px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'}`} onClick={() => setIsOpen(false)}>
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>;
        })}
        </nav>
      </div>
    </>;
};
export default Sidebar;