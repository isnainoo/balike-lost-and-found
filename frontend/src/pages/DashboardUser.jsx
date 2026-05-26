import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const DashboardUser = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pesan, setPesan] = useState({ text: '', type: '' });
  const [kategoriList, setKategoriList] = useState([]);
  const [smartMatches, setSmartMatches] = useState([]);
  
  const [riwayatLaporan, setRiwayatLaporan] = useState([]);

  const [formData, setFormData] = useState({
    tipe_laporan: 'kehilangan',
    id_kategori: '',
    nama_barang: '',
    deskripsi: '',
    lokasi_kejadian: '',
    tanggal_kejadian: '',
    imbalan: '',
    foto: null
  });

  useEffect(() => {
    const dataUser = localStorage.getItem('user');
    if (!dataUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(dataUser);
      setUser(parsedUser);
      fetchRiwayatLaporan();
      fetchKategori();
      fetchSmartMatches();
    }
  }, [navigate]);

  const fetchRiwayatLaporan = async () => {
    try {
      const response = await api.get('/laporan/me');
      setRiwayatLaporan(response.data);
    } catch (error) {
      console.error("Failed to retrieve report history:", error);
    }
  };

  const fetchKategori = async () => {
    try {
      const response = await api.get('/kategori');
      setKategoriList(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, id_kategori: response.data[0].id_kategori }));
      }
    } catch (error) {
      console.error("Failed to retrieve category:", error);
    }
  };

  const fetchSmartMatches = async () => {
    try {
      const response = await api.get('/laporan/me/matches');
      setSmartMatches(response.data);
    } catch (error) {
      console.error("Failed to fetch AI Matches data");
    }
  };

  const handleAction = async (id, action) => {
    const confirm = window.confirm(`Are you sure you want to? ${action === 'delete' ? 'permanent deletion' : 'finish'} this report?`);
    if (!confirm) return;

    try {
      if (action === 'delete') {
        await api.delete(`/laporan/${id}`);
      } else {
        await api.put(`/laporan/${id}/selesai`);
      }
      fetchRiwayatLaporan(); 
      fetchSmartMatches(); 
    } catch (error) {
      alert("Failed to perform action.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, foto: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPesan({ text: '', type: '' });

    const submitData = new FormData();
    submitData.append('tipe_laporan', formData.tipe_laporan);
    submitData.append('nama_barang', formData.nama_barang);
    submitData.append('deskripsi', formData.deskripsi);
    submitData.append('lokasi_kejadian', formData.lokasi_kejadian);
    submitData.append('tanggal_kejadian', formData.tanggal_kejadian);
    submitData.append('id_kategori', formData.id_kategori); 
    
    if (formData.imbalan) {
        submitData.append('imbalan', formData.imbalan);
    }

    if (formData.foto) {
      submitData.append('foto', formData.foto);
    }

    try {
      const response = await api.post('/laporan', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPesan({ text: `Success! Your report status is: ${response.data.status_laporan}.`, type: 'success' });

      setFormData({
        tipe_laporan: 'kehilangan', 
        id_kategori: kategoriList.length > 0 ? kategoriList[0].id_kategori : '',
        nama_barang: '', 
        deskripsi: '',
        lokasi_kejadian: '', 
        tanggal_kejadian: '', 
        imbalan: '',
        foto: null
      });
      document.getElementById('foto').value = '';
      
      fetchRiwayatLaporan();
      fetchSmartMatches();

    } catch (error) {
      setPesan({ text: error.response?.data?.message || 'There is an error', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="py-10 max-w-6xl mx-auto space-y-8">
      
      {/* Header Dashboard */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Halo, {user.nama_lengkap}! 👋</h1>
        <p className="text-slate-500 mt-1">
          Your status: <span className="font-bold text-blue-600">
          {user.role === 'super_admin' ? '👑 Super Admin' : 
          user.role === 'admin' ? '🛡️ Admin' : 
          user.is_trusted ? '⭐ Trusted User (Auto-Publish)' : 
          'Standard User'}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORM INPUT */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Create New Report</h2>

          {pesan.text && (
            <div className={`mb-6 p-4 rounded-xl border text-sm font-medium ${pesan.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {pesan.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
                <select name="tipe_laporan" value={formData.tipe_laporan} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white">
                  <option value="kehilangan">I Lost My Stuff</option>
                  <option value="penemuan">I Found Something</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name of goods</label>
                <input type="text" name="nama_barang" required value={formData.nama_barang} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="Example: Dompet Hitam" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Category</label>
                <select 
                  name="id_kategori" 
                  value={formData.id_kategori} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white transition-all"
                >
                  {kategoriList.map(kat => (
                    <option key={kat.id_kategori} value={kat.id_kategori}>
                      {kat.nama_kategori}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* INPUT IMBALAN */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reward / Imbalan (Opsional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
                  <input 
                    type="number" 
                    name="imbalan" 
                    value={formData.imbalan} 
                    onChange={handleInputChange} 
                    onWheel={(e) => e.target.blur()} 
                    onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white" 
                    placeholder="Contoh: 50000" 
                  />
                </div>
              </div>
            </div>
          
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea name="deskripsi" required rows="3" value={formData.deskripsi} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="State the detailed characteristics of the item..."></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location of the Incident</label>
                <input type="text" name="lokasi_kejadian" required value={formData.lokasi_kejadian} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="Example: Parkiran FK UMS" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" name="tanggal_kejadian" required value={formData.tanggal_kejadian} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-1">Item Photos</label>
              <input type="file" id="foto" name="foto" accept="image/*" onChange={handleFileChange} className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer transition-colors" />
            </div>

            <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-4 rounded-2xl transition-all mt-4 ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.98]'}`}>
              {isLoading ? 'Sending Data...' : 'Submit Report'}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-6 h-fit">
          {smartMatches.length > 0 && (
            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-700">
              <h2 className="text-xl font-extrabold text-blue-900 mb-2 flex items-center gap-2">
                <span className="text-2xl animate-pulse">🤖</span> Smart Match
              </h2>
              <p className="text-blue-600 text-xs mb-5 leading-relaxed font-medium">
                We found a post that has similarities to your item!
              </p>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                {smartMatches.map((item, index) => (
                  <Link 
                    to={`/laporan/${item.match.id_laporan}`} 
                    key={index}
                    className="block bg-white border border-blue-100 p-4 rounded-2xl hover:bg-blue-100 hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                      Compatibility for: <span className="text-blue-600">{item.myReportName}</span>
                    </p>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-blue-700 transition-colors">
                        {item.match.nama_barang}
                      </h3>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-200 whitespace-nowrap ml-2">
                        {item.score}% MATCH
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 font-medium">
                      <span>📍 {item.match.lokasi_kejadian}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* RIWAYAT LAPORAN */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              My Report History
              <span className="bg-blue-100 text-blue-600 text-xs px-2.5 py-0.5 rounded-full">{riwayatLaporan.length}</span>
            </h2>
            
            {riwayatLaporan.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-sm text-slate-400 font-medium">No reports have been made yet.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                {riwayatLaporan.map((item) => (
                  <div key={item.id_laporan} className="group bg-slate-50 rounded-2xl border border-slate-100 p-5 hover:bg-white hover:shadow-lg hover:border-blue-100 transition-all duration-300">
                    
                    {/* Link ke Detail */}
                    <Link to={`/laporan/${item.id_laporan}`} className="block">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors line-clamp-1 pr-2">
                          {item.nama_barang}
                        </h3>
                        <span className={`text-[9px] px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter border whitespace-nowrap ${
                          item.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          item.status === 'selesai' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          item.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-4 font-medium">
                        <span className="truncate max-w-[120px]">📍 {item.lokasi_kejadian}</span>
                        <span>•</span>
                        <span>{new Date(item.tanggal_kejadian).toLocaleDateString('id-ID')}</span>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-200 mt-2">
                      <Link 
                        to={`/laporan/${item.id_laporan}/edit`}
                        className="flex-1 text-center py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-xl hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm"
                      >
                        EDIT
                      </Link>
                      
                      {item.status !== 'selesai' && (
                        <button 
                          onClick={() => handleAction(item.id_laporan, 'selesai')}
                          className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm"
                        >
                          FINISHED
                        </button>
                      )}

                      <button 
                        onClick={() => handleAction(item.id_laporan, 'delete')}
                        className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardUser;