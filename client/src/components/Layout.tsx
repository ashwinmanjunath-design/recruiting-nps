import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Globe, Users, CheckSquare, User, ClipboardList, Settings, Menu, X, Home, Shield } from 'lucide-react';
import Logo from './Logo';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/trends', icon: TrendingUp, label: 'Trends' },
    { to: '/geographic', icon: Globe, label: 'Geographic' },
    { to: '/cohorts', icon: Users, label: 'Cohorts' },
    { to: '/actions', icon: CheckSquare, label: 'Actions' },
    { to: '/surveys', icon: ClipboardList, label: 'Surveys' },
    { to: '/settings', icon: Settings, label: 'Settings' },
    { to: '/security', icon: Shield, label: 'Security' },
  ];

  return (
    <div className="flex h-screen" style={{ background: 'linear-gradient(135deg, #f3fbff 0%, #eff8fa 50%, #e5f4f7 100%)' }}>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <div
        className={`
          fixed md:relative inset-y-0 left-0 z-40
          w-20 flex flex-col items-center py-6 space-y-6 backdrop-blur-sm
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{
          background: 'rgba(248, 250, 252, 0.95)',
          boxShadow: '2px 0 20px rgba(15, 23, 42, 0.06)'
        }}
      >
        {/* C360 Logo - Links to Experience Suite */}
        <Link
          to="/experience-suite"
          className="w-14 h-14 bg-primary flex items-center justify-center text-white font-bold text-base shadow-lg hover:scale-105 transition-transform"
          style={{
            borderRadius: '20px',
            padding: '0.75rem',
            lineHeight: '1',
            boxShadow: '0 12px 30px rgba(20, 184, 166, 0.25)'
          }}
          title="Back to Experience Suite"
        >
          <span className="leading-none">C360</span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col space-y-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-16 h-16 transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'
                }`
              }
              style={({ isActive }) => ({
                borderRadius: isActive ? '16px' : '12px',
                boxShadow: isActive ? '0 8px 25px rgba(20, 184, 166, 0.3)' : 'none'
              })}
              title={item.label}
            >
              <item.icon className="w-5 h-5" strokeWidth={2} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logo above User Avatar */}
        <div className="flex flex-col items-center space-y-3">
          <div
            className="w-12 h-12 flex items-center justify-center shadow-md"
            style={{ borderRadius: '16px', overflow: 'hidden' }}
          >
            <Logo size={48} />
          </div>

          {/* User Avatar */}
          <div
            className="w-12 h-12 bg-white flex items-center justify-center shadow-md"
            style={{ borderRadius: '16px' }}
          >
            <User className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
