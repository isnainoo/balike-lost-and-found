import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
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
  }, [location.pathname]);

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
      ? "text-blue-600 font-bold" 
      : "text-slate-600 hover:text-blue-600 font-medium transition-colors";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO KIRI */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="text-blue-600 flex items-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-105 transition-transform">
                <path d="M5 4H12C14.7614 4 17 6.23858 17 9C17 10.7431 16.0913 12.2783 14.7176 13.0906C16.6433 13.6841 18 15.4965 18 17.5C18 20.5376 15.5376 23 12.5 23H5V4Z" fill="currentColor"/>
                <circle cx="19" cy="19" r="3" fill="#60A5FA"/>
              </svg>
            </div>
            <span className="font-extrabold text-2xl text-slate-800 tracking-tight">Balike.</span>
          </Link>

          {/* MENU DESKTOP */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={isActive('/')}>Home page</Link>
            
            {user ? (
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

                <button 
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl font-bold transition-all"
                >
                  Exit
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
              >
                Login
              </Link>
            )}
          </div>

          {/* TOMBOL HAMBURGER MOBILE */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* DROPDOWN MENU MOBILE */}
      <div 
        className={`md:hidden absolute w-full bg-white border-b border-slate-100 shadow-lg transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
          <Link 
            to="/" 
            className={`block px-4 py-3 rounded-xl ${location.pathname === '/' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 font-medium'}`}
          >
            Home page
          </Link>

          {user ? (
            <>
              <Link 
                to={user.role === 'admin' || user.role === 'super_admin' ? '/admin' : '/dashboard'} 
                className={`block px-4 py-3 rounded-xl ${location.pathname.includes('dashboard') || location.pathname.includes('admin') ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 font-medium'}`}
              >
                {user.role === 'admin' || user.role === 'super_admin' ? 'Admin panel' : 'My dashboard'}
              </Link>
              
              <Link 
                to="/profile" 
                className={`block px-4 py-3 rounded-xl ${location.pathname === '/profile' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 font-medium'}`}
              >
                Profile
              </Link>

              <div className="border-t border-slate-100 my-2"></div>
              
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2"
              >
                Exit (Logout)
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="block px-4 py-3 mt-4 text-center bg-blue-600 text-white rounded-xl font-bold"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;