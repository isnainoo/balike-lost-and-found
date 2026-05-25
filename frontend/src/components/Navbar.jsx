import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [notifikasi, setNotifikasi] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = () => {
      const dataUser = localStorage.getItem('user');
      if (dataUser) {
        setUser(JSON.parse(dataUser));
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [location.pathname]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
  }, [location.pathname]);

  const fetchNotifikasi = async () => {
    const dataUser = localStorage.getItem('user');
    if (!dataUser) return;

    try {
      const response = await api.get('/laporan/notifikasi/all');
      setNotifikasi(response.data);
      console.log("CEK DATA NOTIF:", response.data);
      const unread = response.data.filter(
        (n) => n.is_read === 0 || n.is_read === false
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Gagal mengambil notifikasi', error);
    }
  };

  useEffect(() => {
    fetchNotifikasi();
    const intervalId = setInterval(() => {
      fetchNotifikasi();
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLoncengClick = async () => {
    setIsNotifOpen(!isNotifOpen);

    if (unreadCount > 0 && !isNotifOpen) {
      try {
        await api.put('/laporan/notifikasi/read');
        setUnreadCount(0);
        fetchNotifikasi();
      } catch (error) {
        console.error('Gagal update notifikasi', error);
      }
    }
  };

  const handleKlikNotifLaporan = (idLaporan) => {
    setIsNotifOpen(false);
    navigate(`/laporan/${idLaporan}`);
  };

  const handleLogout = () => {
    const confirm = window.confirm('Are you sure you want to exit?');
    if (!confirm) return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path
      ? 'text-blue-600 font-bold'
      : 'text-slate-600 hover:text-blue-600 font-medium transition-colors';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="text-blue-600 flex items-center">
              <svg
                width="28" height="28" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="group-hover:scale-105 transition-transform"
              >
                <path
                  d="M5 4H12C14.7614 4 17 6.23858 17 9C17 10.7431 16.0913 12.2783 14.7176 13.0906C16.6433 13.6841 18 15.4965 18 17.5C18 20.5376 15.5376 23 12.5 23H5V4Z"
                  fill="currentColor"
                />
                <circle cx="19" cy="19" r="3" fill="#60A5FA" />
              </svg>
            </div>
            <span className="font-extrabold text-2xl text-slate-800 tracking-tight">
              Balike.
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-6">
            
            {/* 1. MENU DESKTOP (Sembunyi di HP) */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className={isActive('/')}>
                Home page
              </Link>
              {user && (
                <>
                  <Link
                    to={user.role === 'admin' || user.role === 'super_admin' ? '/admin' : '/dashboard'}
                    className={isActive(user.role === 'admin' || user.role === 'super_admin' ? '/admin' : '/dashboard')}
                  >
                    {user.role === 'admin' || user.role === 'super_admin' ? 'Admin panel' : 'My dashboard'}
                  </Link>
                  <Link to="/profile" className={isActive('/profile')}>
                    Profile
                  </Link>
                </>
              )}
            </div>

            {user && (
              <div className="relative">
                <button
                  onClick={handleLoncengClick}
                  className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-300 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>

                  {/* TITIK MERAH KEDIP */}
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                    </span>
                  )}
                </button>

                {/* DROPDOWN NOTIFIKASI */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-72 md:w-96 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50">
                    <div className="bg-slate-50/80 backdrop-blur-sm px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">Notifikasi</h3>
                      {unreadCount > 0 && (
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                          {unreadCount} Baru
                        </span>
                      )}
                    </div>

                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {notifikasi.length > 0 ? (
                        notifikasi.map((notif) => (
                          <div
                            key={notif.id_notifikasi}
                            onClick={() => handleKlikNotifLaporan(notif.id_laporan_terkait)}
                            className={`cursor-pointer px-5 py-4 border-b border-slate-50 hover:bg-slate-100 transition-colors ${
                              notif.is_read ? 'bg-white' : 'bg-blue-50/30'
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                                notif.is_read ? 'bg-slate-300' : 'bg-blue-500'
                              }`}></div>
                              <div>
                                <p className="text-sm text-slate-700 leading-snug">{notif.pesan}</p>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium flex items-center gap-1">
                                  <span className="text-blue-500 font-bold">Lihat detail</span> • 
                                  {new Date(notif.waktu_dibuat).toLocaleString('id-ID', {
                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-5 py-8 text-center text-slate-400">
                          <p className="text-3xl mb-2">📭</p>
                          <p className="text-sm font-medium">Belum ada notifikasi</p>
                        </div>
                      )}
                    </div>

                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center">
                      <button
                        onClick={() => setIsNotifOpen(false)}
                        className="text-xs text-slate-500 font-medium hover:text-blue-600 transition-colors"
                      >
                        Tutup Notifikasi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="hidden md:block">
              {user ? (
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl font-bold transition-all">
                  Exit
                </button>
              ) : (
                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
                  Login
                </Link>
              )}
            </div>

            <div className="md:hidden flex items-center ml-1">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors focus:outline-none">
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
              </button>
            </div>
            
          </div>
        </div>
      </div>

      <div
        className={`md:hidden absolute w-full bg-white border-b border-slate-100 shadow-lg transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
          <Link to="/" className={`block px-4 py-3 rounded-xl ${location.pathname === '/' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 font-medium'}`}>
            Home page
          </Link>

          {user ? (
            <>
              <Link
                to={user.role === 'admin' || user.role === 'super_admin' ? '/admin' : '/dashboard'}
                className={`block px-4 py-3 rounded-xl ${
                  location.pathname.includes('dashboard') || location.pathname.includes('admin') ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 font-medium'
                }`}
              >
                {user.role === 'admin' || user.role === 'super_admin' ? 'Admin panel' : 'My dashboard'}
              </Link>
              <Link to="/profile" className={`block px-4 py-3 rounded-xl ${location.pathname === '/profile' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 font-medium'}`}>
                Profile
              </Link>
              <div className="border-t border-slate-100 my-2"></div>
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2">
                Exit (Logout)
              </button>
            </>
          ) : (
            <Link to="/login" className="block px-4 py-3 mt-4 text-center bg-blue-600 text-white rounded-xl font-bold">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;