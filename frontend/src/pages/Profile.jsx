import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPass, setIsLoadingPass] = useState(false);
  const [pesan, setPesan] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nomor_telepon: ''
  });

  const [passData, setPassData] = useState({
    passwordLama: '',
    passwordBaru: '',
    konfirmasiPassword: ''
  });

  useEffect(() => {
    const dataUser = localStorage.getItem('user');
    if (!dataUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(dataUser);
      setUser(parsedUser);
      setFormData({
        nama_lengkap: parsedUser.nama_lengkap || '',
        nomor_telepon: parsedUser.nomor_telepon || ''
      });
    }
  }, [navigate]);

  const handleInputProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInputPassChange = (e) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoadingProfile(true);
    setPesan({ text: '', type: '' });

    try {
      const response = await api.put('/auth/profile', formData);
      
      const updatedUser = { ...user, nama_lengkap: formData.nama_lengkap, nomor_telepon: formData.nomor_telepon };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setPesan({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      setPesan({ text: error.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setIsLoadingPass(true);
    setPesan({ text: '', type: '' });

    if (passData.passwordBaru !== passData.konfirmasiPassword) {
      setPesan({ text: 'New password and confirmation do not match!', type: 'error' });
      setIsLoadingPass(false);
      return;
    }

    try {
      await api.put('/auth/password', {
        passwordLama: passData.passwordLama,
        passwordBaru: passData.passwordBaru
      });
      
      setPesan({ text: 'Password changed successfully!', type: 'success' });
      setPassData({ passwordLama: '', passwordBaru: '', konfirmasiPassword: '' });
    } catch (error) {
      setPesan({ text: error.response?.data?.message || 'Failed to change password', type: 'error' });
    } finally {
      setIsLoadingPass(false);
    }
  };

  if (!user) return null;

  return (
    <div className="py-10 max-w-4xl mx-auto px-4">
      
      {/* HEADER PROFILE */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 relative overflow-hidden">
        {/* Ornamen Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center text-4xl font-black shadow-md flex-shrink-0 z-10">
          {user.nama_lengkap.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left z-10 mt-2 md:mt-0">
          <h1 className="text-2xl font-extrabold text-slate-800">{user.nama_lengkap}</h1>
          <p className="text-slate-500 font-medium">{user.email}</p>
          <div className="mt-2">
            {user.role === 'super_admin' ? (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-lg text-xs font-bold">
            Super Admin
          </span>
          ) : user.role === 'admin' ? (
          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-lg text-xs font-bold">
            Admin
          </span>
          ) : user.is_trusted ? (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-bold">
            Trusted User
          </span>
          ) : (
          <span className="bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1 rounded-lg text-xs font-bold">
            Standard User
          </span>
        )}
        </div>
        </div>
      </div>

      {pesan.text && (
        <div className={`mb-6 p-4 rounded-xl border text-sm font-bold shadow-sm ${pesan.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
          {pesan.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* FORM INFORMASI PRIBADI */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 h-fit">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>👤</span> Personal data
            </h2>
            <p className="text-xs text-slate-500 mt-1">Update your name and WhatsApp number.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
              <input 
                type="text" 
                name="nama_lengkap" 
                value={formData.nama_lengkap} 
                onChange={handleInputProfileChange} 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
              <input 
                type="text" 
                name="nomor_telepon" 
                value={formData.nomor_telepon} 
                onChange={handleInputProfileChange} 
                required
                placeholder="Example: 08123456789"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoadingProfile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] mt-2 disabled:bg-blue-400"
            >
              {isLoadingProfile ? 'Keep...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* FORM UBAH PASSWORD */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 h-fit">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span>🔒</span> Change new password
            </h2>
            <p className="text-xs text-slate-500 mt-1">Make sure your account uses a strong password.</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Old Password</label>
              <input 
                type="password" 
                name="passwordLama" 
                value={passData.passwordLama} 
                onChange={handleInputPassChange} 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input 
                type="password" 
                name="passwordBaru" 
                value={passData.passwordBaru} 
                onChange={handleInputPassChange} 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <input 
                type="password" 
                name="konfirmasiPassword" 
                value={passData.konfirmasiPassword} 
                onChange={handleInputPassChange} 
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoadingPass}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] mt-2 disabled:bg-slate-500"
            >
              {isLoadingPass ? 'Processing...' : 'Change Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;