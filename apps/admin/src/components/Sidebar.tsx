'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Store,
  Truck,
  ShoppingBag,
  BarChart3,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'დაშბორდი' },
  { href: '/dashboard/users', icon: Users, label: 'მომხმარებლები' },
  { href: '/dashboard/restaurants', icon: Store, label: 'რესტორნები' },
  { href: '/dashboard/drivers', icon: Truck, label: 'მძღოლები' },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'შეკვეთები' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'ანალიტიკა' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">მტრედები</h1>
            <p className="text-xs text-gray-400">ადმინ პანელი</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.name || 'ადმინი'}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.phone}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition"
        >
          <LogOut className="w-5 h-5" />
          <span>გასვლა</span>
        </button>
      </div>
    </aside>
  );
}
