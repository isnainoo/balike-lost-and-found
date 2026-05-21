import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const LupaPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pesan, setPesan] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState({ email: '', nomor_telepon: '' });
  const [resetData, setResetData] = useState({ passwordBaru: '', konfirmasiPassword: '', resetToken: '' });

  const handleVerifikasi = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPesan({ text: '', type: '' });

    try {
      const response = await api.post('/auth/forgot-password', formData);
      setResetData({ ...resetData, resetToken: response.data.resetToken });
      setStep(2);
      setPesan({ text: 'Verification successful! Please create your new password.', type: 'success' });
    } catch (error) {
      setPesan({ text: error.response?.data?.message || 'Data not found', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPesan({ text: '', type: '' });

    if (resetData.passwordBaru !== resetData.konfirmasiPassword) {
      setPesan({ text: 'Password tidak cocok!', type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/reset-password', {
        resetToken: resetData.resetToken,
        passwordBaru: resetData.passwordBaru
      });
      alert(response.data.message);
      navigate('/login');
    } catch (error) {
      setPesan({ text: error.response?.data?.message || 'Gagal reset password', type: 'error' });
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4">
      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-lg border border-slate-100 max-w-md w-full relative overflow-hidden">
        
        {/* Ornamen Desain */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            🔒
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Account Recovery</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            {step === 1 ? 'Enter your registered email and phone number.' : 'Please enter your new password.'}
          </p>
        </div>

        {pesan.text && (
          <div className={`mb-6 p-4 rounded-xl border text-sm font-bold shadow-sm ${pesan.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
            {pesan.text}
          </div>
        )}

        {/* FORM VERIFIKASI */}
        {step === 1 && (
          <form onSubmit={handleVerifikasi} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Email address</label>
              <input 
                type="email" 
                required 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" 
                placeholder="ex@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Registered WhatsApp Number</label>
              <input 
                type="text" 
                required 
                value={formData.nomor_telepon} 
                onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" 
                placeholder="Example: 08123456789"
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95">
              {isLoading ? 'Searching for Data...' : 'Verify My Data'}
            </button>
          </form>
        )}

        {/* FORM PASSWORD BARU */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5 relative z-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Password Baru</label>
              <input 
                type="password" 
                required 
                value={resetData.passwordBaru} 
                onChange={(e) => setResetData({ ...resetData, passwordBaru: e.target.value })}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Ulangi Password Baru</label>
              <input 
                type="password" 
                required 
                value={resetData.konfirmasiPassword} 
                onChange={(e) => setResetData({ ...resetData, konfirmasiPassword: e.target.value })}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" 
              />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95">
              {isLoading ? 'Keep...' : 'Save New Password'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center relative z-10">
          <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
            ← Back
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LupaPassword;