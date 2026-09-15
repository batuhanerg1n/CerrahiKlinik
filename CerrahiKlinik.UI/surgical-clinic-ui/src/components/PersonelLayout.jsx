import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Users, LogOut, ClipboardList } from 'lucide-react';

export default function PersonelLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const menuItems = [
    { name: 'Randevular', path: '/personel/randevular', icon: <CalendarDays className="w-5 h-5" /> },
    { name: 'Görevler', path: '/personel/gorevler', icon: <ClipboardList className="w-5 h-5" /> },
    { name: 'Hastalar', path: '/personel/hastalar', icon: <Users className="w-5 h-5" /> }
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex z-20">
        <div>
          <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-none">Klinik</h1>
              <p className="text-[10px] text-indigo-600 font-bold tracking-wider uppercase mt-1">Personel Paneli</p>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              {user?.ad?.charAt(0) || 'P'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.ad} {user?.soyad}</p>
              <p className="text-xs text-slate-400 capitalize truncate">{user?.rol || 'Personel'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition"
          >
            <LogOut className="w-5 h-5" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <Outlet />
      </main>

    </div>
  );
}