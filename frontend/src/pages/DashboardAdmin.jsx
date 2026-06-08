import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState(null); 
  const [laporanPending, setLaporanPending] = useState([]);
  const [allLaporan, setAllLaporan] = useState([]); 
  const [usersList, setUsersList] = useState([]); 
  
  const [activeTab, setActiveTab] = useState('laporan'); 
  const [isLoading, setIsLoading] = useState(true);
  const [pesan, setPesan] = useState({ text: '', type: '' });
  const [searchTerm, setSearchTerm] = useState(''); 

  useEffect(() => {
    const dataUser = localStorage.getItem('user');
    if (!dataUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(dataUser);
    
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'super_admin') {
      navigate('/dashboard'); 
      return;
    }

    setCurrentUser(parsedUser);
    fetchDataAdmin(parsedUser.role);
  }, [navigate]);

  const fetchDataAdmin = async (role) => {
    setIsLoading(true);
    
    try {
      const pendingRes = await api.get('/admin/laporan/pending');
      setLaporanPending(pendingRes.data);
    } catch (error) {
      console.error("Gagal memuat laporan pending:", error);
    }

    try {
      const statsRes = await api.get('/laporan/admin/statistik'); 
      setAllLaporan(statsRes.data);
    } catch (error) {
      console.error("Gagal memuat statistik:", error);
    }

    if (role === 'super_admin') {
      try {
        const usersRes = await api.get('/admin/users');
        setUsersList(usersRes.data);
      } catch (error) {
        console.error("Gagal memuat daftar user:", error);
      }
    }

    setIsLoading(false);
  };

  const fetchUsers = async () => {
    if (currentUser?.role !== 'super_admin') return;
    try {
      const response = await api.get('/admin/users');
      setUsersList(response.data);
    } catch (error) {
      console.error("Failed to refresh user data");
    }
  };

  const handleUpdateStatus = async (idLaporan, statusBaru) => {
    try {
      await api.put(`/admin/laporan/${idLaporan}/status`, { status: statusBaru });
      setLaporanPending(prev => prev.filter(item => item.id_laporan !== idLaporan));
      fetchDataAdmin(currentUser.role); 
      
      setPesan({ 
        text: `Report successfully ${statusBaru === 'published' ? 'Accepted (Published)' : 'Rejected'}!`, 
        type: 'success' 
      });
      setTimeout(() => setPesan({ text: '', type: '' }), 3000);
    } catch (error) {
      setPesan({ text: 'An error occurred while changing the report status.', type: 'error' });
    }
  };

  const handleBerikanBadge = async (idUser, namaUser) => {
    const konfirmasi = window.confirm(`Are you sure you want to give the Trusted badge to ${namaUser}?`);
    if (!konfirmasi) return;

    try {
      await api.put(`/admin/user/${idUser}/trust`, { is_trusted: true });
      setPesan({ text: `Trusted Badge successfully awarded to ${namaUser}!`, type: 'success' });
      fetchUsers();
      setTimeout(() => setPesan({ text: '', type: '' }), 3000);
    } catch (error) {
      setPesan({ text: 'Failed to provide Trusted badge.', type: 'error' });
    }
  };

  const handleUbahRole = async (idUser, namaUser, currentRole) => {
    if (currentRole === 'super_admin') {
      alert("Cannot change the role of a fellow Super Admin!");
      return;
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const konfirmasi = window.confirm(`Are you sure you want to change ${namaUser} to ${newRole.toUpperCase()}?`);
    
    if (!konfirmasi) return;

    try {
      await api.put(`/admin/users/${idUser}/role`, { role: newRole });
      setPesan({ text: `Access for ${namaUser} successfully changed to ${newRole.toUpperCase()}!`, type: 'success' });
      fetchUsers();
      setTimeout(() => setPesan({ text: '', type: '' }), 3000);
    } catch (error) {
      setPesan({ text: error.response?.data?.message || 'Failed to change user role.', type: 'error' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const lostCount = allLaporan.filter(item => item.tipe_laporan === 'kehilangan').length;
  const foundCount = allLaporan.filter(item => item.tipe_laporan === 'penemuan').length;
  const selesaiLostCount = allLaporan.filter(item => item.status === 'selesai' && item.tipe_laporan === 'kehilangan').length;
  const selesaiFoundCount = allLaporan.filter(item => item.status === 'selesai' && item.tipe_laporan === 'penemuan').length;
  const publishedCount = allLaporan.filter(item => item.status === 'published').length;

  const chartData = [
    { name: 'Lost', total: lostCount, color: '#ef4444' },   
    { name: 'Found', total: foundCount, color: '#10b981' }    
  ];

  const filteredUsers = usersList.filter(user => 
    user.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || !currentUser) return <div className="text-center mt-20 text-slate-500 animate-pulse font-bold">Loading admin panel...</div>;

  return (
    <div className="py-6 md:py-10 max-w-[100vw] mx-auto px-4 md:px-8 overflow-x-hidden box-border">
      
      <div className="max-w-7xl mx-auto w-full min-w-0">
        
        {/* HEADER ADMIN */}
        <div className={`flex flex-col md:flex-row justify-between items-center md:items-end mb-8 p-5 md:p-6 rounded-[2rem] shadow-md text-white gap-4 w-full ${currentUser.role === 'super_admin' ? 'bg-[#111827]' : 'bg-slate-800'}`}>
          <div className="w-full text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="text-3xl">{currentUser.role === 'super_admin' ? '👑' : '🛡️'}</span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight truncate">
                {currentUser.role === 'super_admin' ? 'Super Admin Panel' : 'Admin Panel'}
              </h1>
            </div>
            <p className="text-slate-300 mt-1 text-sm truncate">
              {currentUser.role === 'super_admin' ? 'Central Control & Access Management' : 'User reports and consent management'}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-red-400 hover:text-white hover:bg-red-500 font-bold text-sm transition-all duration-300 bg-white/10 px-6 py-2.5 rounded-xl shadow-sm w-full md:w-auto flex-shrink-0"
          >
            Exit Panel
          </button>
        </div>

        {pesan.text && (
          <div className={`mb-8 p-4 rounded-xl border text-sm font-bold shadow-sm animate-in fade-in slide-in-from-top-4 ${pesan.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
            {pesan.text}
          </div>
        )}

        {/* TAB NAVIGATION DENGAN W-FULL DI MOBILE AGAR RAPI */}
        {currentUser.role === 'super_admin' && (
          <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-slate-200 w-full md:w-max overflow-x-auto custom-scrollbar shadow-sm">
            <button 
              onClick={() => setActiveTab('laporan')}
              className={`flex-1 md:flex-none whitespace-nowrap px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'laporan' ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Report Verification {laporanPending.length > 0 && <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-[10px]">{laporanPending.length}</span>}
            </button>
            <button 
              onClick={() => { setActiveTab('manajemen'); setSearchTerm(''); }} 
              className={`flex-1 md:flex-none whitespace-nowrap px-4 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'manajemen' ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Access Management
            </button>
          </div>
        )}

        <div className="min-h-[80vh] w-full min-w-0">
          
          {/* VERIFIKASI LAPORAN & STATISTIK                */}
          {activeTab === 'laporan' && (
            <div className="animate-in fade-in duration-300 w-full">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 min-h-[3rem]">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                  List of Reports Awaiting Approval
                </h2>
              </div>

              {laporanPending.length === 0 ? (
                <div className="bg-white p-8 md:p-16 rounded-[2rem] md:rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center text-slate-400 font-medium mb-12 shadow-sm w-full">
                  <span className="text-5xl block mb-4">☕</span>
                  There are no pending reports at this time.<br className="hidden md:block"/> All issues have been resolved.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12 w-full">
                  {laporanPending.map((item) => (
                    <div key={item.id_laporan} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300 group">
                      <div className="relative h-48 md:h-56 overflow-hidden">
                        {item.url_foto ? (
                          <img src={`http://localhost:5000${item.url_foto}`} alt={item.nama_barang} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xs tracking-widest italic border-b border-slate-100">NO IMAGE</div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md ${item.tipe_laporan === 'kehilangan' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                            {item.tipe_laporan === 'kehilangan' ? 'LOST' : 'FOUND'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-5 md:p-6 flex-1 flex flex-col">
                        <h3 className="text-lg md:text-xl font-extrabold text-slate-800 mb-2 line-clamp-1">{item.nama_barang}</h3>
                        <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-3 leading-relaxed">{item.deskripsi}</p>
                        
                        <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Reporter</p>
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm line-clamp-1">{item.nama_lengkap}</span>
                            <button 
                              onClick={() => handleBerikanBadge(item.id_user, item.nama_lengkap)}
                              className="text-[10px] font-black text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 whitespace-nowrap shadow-sm"
                            >
                              + Make Trusted
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                          <button 
                            onClick={() => handleUpdateStatus(item.id_laporan, 'published')}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl text-sm transition-all active:scale-95 shadow-md shadow-emerald-200"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(item.id_laporan, 'rejected')}
                            className="flex-1 bg-white hover:bg-red-500 hover:text-white hover:border-red-500 text-red-500 font-bold py-3 rounded-xl text-sm transition-all active:scale-95 border border-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm mt-8 md:mt-12 mb-8 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 flex items-center gap-2 md:gap-3">
                      📊 Statistics Overview
                    </h2>
                    <p className="text-xs md:text-sm text-slate-500 mt-2 font-medium">Comparison of the number of lost, found, and resolved cases.</p>
                  </div>
                  <div className="text-left md:text-right bg-slate-50 p-4 md:px-6 md:py-3 rounded-2xl border border-slate-100 w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0 md:mt-1 md:order-2">Total Published</p>
                    <p className="text-3xl md:text-4xl font-black text-blue-600 md:order-1">{publishedCount}</p>
                  </div>
                </div>

                <div className="relative w-full h-64 md:h-80 mb-6 mt-6 md:mt-8">
                  <div className="absolute inset-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={window.innerWidth < 768 ? 60 : 80} outerRadius={window.innerWidth < 768 ? 100 : 130} paddingAngle={5} dataKey="total" stroke="none" cornerRadius={8}>
                          {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px 12px', fontWeight: 'bold', fontSize: '12px' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 700, fontSize: '12px', color: '#475569', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

            {/* KOTAK TOTAL CASES COMPLETED (VERSI TEKS / CLEAN UI) */}
            <div className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm mt-8 md:mt-12 mb-8 w-full">
              
              {/* Header: Judul Kiri, Angka Besar Kanan */}
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 flex items-center gap-2 md:gap-3">
                    <span className="text-xl md:text-2xl">🎉</span> Total Cases Completed
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 mt-2 font-medium">Breakdown of Lost and Found items successfully returned or resolved.</p>
                </div>

                <div className="text-left md:text-right bg-slate-50 p-4 md:px-6 md:py-3 rounded-2xl border border-slate-100 w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end flex-shrink-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0 md:mt-1 md:order-2">Total Finished</p>
                  <p className="text-3xl md:text-4xl font-black text-blue-600 md:order-1">{selesaiLostCount + selesaiFoundCount}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                
                {/* Kotak Detail Lost */}
                <div className="bg-red-50/50 hover:bg-red-50 border border-red-100 p-5 rounded-2xl flex justify-between items-center transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 text-red-500 rounded-xl flex items-center justify-center font-bold text-xl">
                      🔍
                    </div>
                    <div>
                      <p className="font-extrabold text-red-700 text-sm md:text-base">Lost Cases</p>
                      <p className="text-[10px] md:text-xs text-red-500 font-medium">Items returned to owners</p>
                    </div>
                  </div>
                  <span className="text-3xl font-black text-red-600">{selesaiLostCount}</span>
                </div>

                {/* Kotak Detail Found */}
                <div className="bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex justify-between items-center transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-xl">
                      🤝
                    </div>
                    <div>
                      <p className="font-extrabold text-emerald-700 text-sm md:text-base">Found Cases</p>
                      <p className="text-[10px] md:text-xs text-emerald-600 font-medium">Items successfully claimed</p>
                    </div>
                  </div>
                  <span className="text-3xl font-black text-emerald-600">{selesaiFoundCount}</span>
                </div>

              </div>
            </div>
              </div>
            </div>
          )}

          {/* MANAJEMEN AKSES (SUPER ADMIN ONLY)            */}
          {activeTab === 'manajemen' && currentUser.role === 'super_admin' && (
            <div className="animate-in fade-in duration-300 w-full min-w-0">
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 min-h-[3rem] w-full">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                  System User List
                </h2>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                  <div className="relative w-full sm:w-64 flex-shrink-0">
                    <span className="absolute inset-y-0 left-3 flex items-center justify-center text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input 
                      type="text" 
                      placeholder="Search name or email..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm shadow-sm transition-all box-border"
                    />
                  </div>
                  <div className="bg-blue-50 text-blue-600 border border-blue-100 text-sm font-bold px-4 py-2 rounded-xl text-center shadow-sm whitespace-nowrap w-full sm:w-auto">
                    Total: {filteredUsers.length}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden w-full max-w-full">
                <div className="overflow-x-auto w-full custom-scrollbar">
                  <table className="w-full min-w-[700px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                        <th className="p-4 md:p-5 pl-6 md:pl-8">User Information</th>
                        <th className="p-4 md:p-5">Role</th>
                        <th className="p-4 md:p-5">Special Status</th>
                        <th className="p-4 md:p-5 text-right pr-6 md:pr-8">Admin Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((user) => (
                        <tr key={user.id_user} className="hover:bg-slate-50/50 transition-colors">
                          
                          <td className="p-4 md:p-5 pl-6 md:pl-8">
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-xs md:text-sm flex-shrink-0">
                                {user.nama_lengkap.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-xs md:text-sm line-clamp-1">{user.nama_lengkap}</p>
                                <p className="text-[10px] md:text-xs text-slate-500 line-clamp-1">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-4 md:p-5">
                            <span className={`px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider border whitespace-nowrap ${
                              user.role === 'super_admin' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                              'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="p-4 md:p-5">
                            {user.is_trusted ? (
                              <span className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 whitespace-nowrap w-fit">
                                ⭐ Trusted
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-slate-400">-</span>
                            )}
                          </td>

                          <td className="p-4 md:p-5 text-right pr-6 md:pr-8">
                            {user.role !== 'super_admin' ? (
                              <button
                                onClick={() => handleUbahRole(user.id_user, user.nama_lengkap, user.role)}
                                className={`text-[10px] md:text-xs font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-xl transition-all shadow-sm whitespace-nowrap ${
                                  user.role === 'admin'
                                    ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300' 
                                    : 'bg-slate-800 text-white hover:bg-blue-600' 
                                }`}
                              >
                                {user.role === 'admin' ? 'Revoke Admin' : '+ Make Admin'}
                              </button>
                            ) : (
                              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Highest Access</span>
                            )}
                          </td>
                          
                        </tr>
                      ))}
                      
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan="4" className="p-10 md:p-16 text-center text-slate-400 font-medium text-xs md:text-sm">
                            <span className="text-3xl md:text-4xl block mb-3">🔍</span>
                            {searchTerm !== '' 
                              ? `User with keyword "${searchTerm}" not found.` 
                              : 'There are no other users in the system yet.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;