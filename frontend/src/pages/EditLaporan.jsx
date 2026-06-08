import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const EditLaporan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [pesan, setPesan] = useState({ text: '', type: '' });
    const [kategoriList, setKategoriList] = useState([]);

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
        const fetchInitialData = async () => {
            try {
                const resKategori = await api.get('/kategori');
                setKategoriList(resKategori.data);

                const resLaporan = await api.get(`/laporan/${id}`);
                const data = resLaporan.data;

                const formattedDate = new Date(data.tanggal_kejadian).toISOString().split('T')[0];

                setFormData({
                    tipe_laporan: data.tipe_laporan,
                    id_kategori: data.id_kategori || '',
                    nama_barang: data.nama_barang,
                    deskripsi: data.deskripsi,
                    lokasi_kejadian: data.lokasi_kejadian,
                    tanggal_kejadian: formattedDate,
                    imbalan: data.imbalan || '',
                    foto: null 
                });
            } catch (error) {
                console.error(error);
                alert("Failed to retrieve report data or you are not authorized.");
                navigate('/');
            }
        };
        fetchInitialData();
    }, [id, navigate]);

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
        submitData.append('id_kategori', formData.id_kategori);
        submitData.append('nama_barang', formData.nama_barang);
        submitData.append('deskripsi', formData.deskripsi);
        submitData.append('lokasi_kejadian', formData.lokasi_kejadian);
        submitData.append('tanggal_kejadian', formData.tanggal_kejadian);
        submitData.append('reward', formData.imbalan);

        if (formData.foto) {
            submitData.append('foto', formData.foto);
        }

        try {
            await api.put(`/laporan/${id}`, submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Post updated successfully!");
            navigate(`/laporan/${id}`); 
        } catch (error) {
            setPesan({ text: error.response?.data?.message || 'An error occurred while saving', type: 'error' });
            setIsLoading(false);
        }
    };

    return (
        <div className="py-10 max-w-3xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-6 text-slate-500 hover:text-blue-600 font-medium">← Cancel Edit</button>
            
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Edit Report Post</h2>

                {pesan.text && (
                    <div className="mb-6 p-4 rounded-xl border bg-red-50 text-red-700 border-red-100 text-sm font-medium">
                        {pesan.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Report Type</label>
                            <select name="tipe_laporan" value={formData.tipe_laporan} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white">
                                <option value="kehilangan">I Lost My Stuff</option>
                                <option value="penemuan">I Found Something</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Name of goods</label>
                            <input type="text" name="nama_barang" required value={formData.nama_barang} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Item Category</label>
                            <select name="id_kategori" value={formData.id_kategori} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white">
                                <option value="">Select Category...</option>
                                {kategoriList.map(kat => (
                                    <option key={kat.id_kategori} value={kat.id_kategori}>{kat.nama_kategori}</option>
                                ))}
                            </select>
                        </div>

                        {/* INPUT IMBALAN */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Reward / Imbalan (Opsional)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
                                <input 
                                    type="number" 
                                    name="reward" 
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
                        <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Description</label>
                        <textarea name="deskripsi" required rows="4" value={formData.deskripsi} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Location of the Incident</label>
                            <input type="text" name="lokasi_kejadian" required value={formData.lokasi_kejadian} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Date of Incident</label>
                            <input type="date" name="tanggal_kejadian" required value={formData.tanggal_kejadian} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600" />
                        </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Change Item Photo (Opsional)</label>
                        <p className="text-xs text-slate-500 mb-3">Leave it blank if you don't want to change the previous photo..</p>
                        <input type="file" id="foto" name="foto" accept="image/*" onChange={handleFileChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
                    </div>

                    <div className="pt-4">
                        <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}>
                            {isLoading ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLaporan;