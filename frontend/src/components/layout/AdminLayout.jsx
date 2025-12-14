import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  BookOpen,
  FileText,
  Tag,
  Users,
  Menu,
  X,
  LogOut,
  Home,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../common/ThemeToggle';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/mangas', icon: BookOpen, label: 'Mangás' },
    { path: '/admin/novels', icon: FileText, label: 'Novels' },
    { path: '/admin/genres', icon: Tag, label: 'Gêneros' },
    { path: '/admin/users', icon: Users, label: 'Usuários', adminOnly: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Admin', path: '/admin' }];

    if (paths.length > 1) {
      if (paths[1] === 'mangas') {
        breadcrumbs.push({ label: 'Mangás', path: '/admin/mangas' });
        if (paths[2] === 'new') breadcrumbs.push({ label: 'Novo', path: null });
        if (paths[2] && paths[3] === 'edit') breadcrumbs.push({ label: 'Editar', path: null });
        if (paths[2] && paths[3] === 'chapters') breadcrumbs.push({ label: 'Capítulos', path: null });
      } else if (paths[1] === 'novels') {
        breadcrumbs.push({ label: 'Novels', path: '/admin/novels' });
        if (paths[2] === 'new') breadcrumbs.push({ label: 'Nova', path: null });
        if (paths[2] && paths[3] === 'edit') breadcrumbs.push({ label: 'Editar', path: null });
        if (paths[2] && paths[3] === 'chapters') breadcrumbs.push({ label: 'Capítulos', path: null });
      } else if (paths[1] === 'genres') {
        breadcrumbs.push({ label: 'Gêneros', path: '/admin/genres' });
      } else if (paths[1] === 'users') {
        breadcrumbs.push({ label: 'Usuários', path: '/admin/users' });
      }
    }

    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <ThemeToggle className="lg:hidden" />
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r dark:border-gray-700 z-50 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          {isSidebarOpen && (
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">MN Studio</span>
            </Link>
          )}
          <button
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
              setIsMobileSidebarOpen(false);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:block hidden transition-colors"
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:hidden transition-colors"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            {isSidebarOpen && (
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Theme Toggle - POSICIONADO AQUI (melhor lugar) */}
        <div className="px-4 py-3 border-b dark:border-gray-700">
          <ThemeToggle 
            className={`w-full justify-start ${isSidebarOpen ? 'px-4' : 'px-2'}`}
            showLabel={isSidebarOpen}
          />
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            if (item.adminOnly && user?.role !== 'admin') return null;

            const Icon = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={!isSidebarOpen ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Voltar ao Site</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        } pt-20 lg:pt-0`}
      >
        <div className="p-6 lg:p-8">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {getBreadcrumbs().map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight className="w-4 h-4" />}
                  {crumb.path ? (
                    <Link
                      to={crumb.path}
                      className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-900 dark:text-white font-medium">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Page Content */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;