import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
};

const DetailLaporan = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    const userData = localStorage.getItem('user');
    const loggedInUser = userData ? JSON.parse(userData) : null;

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            const res = await api.get(`/laporan/${id}`);
            setItem(res.data);
        } catch (err) {
            console.error(err);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleSelesai = async () => {
        const confirm = window.confirm(
            "Has this item actually been found/finished?"
        );

        if (!confirm) return;

        try {
            await api.put(`/laporan/${id}/selesai`);
            alert("Great! The report is marked complete.");
            navigate('/');
        } catch (error) {
            alert("Failed to change status.");
        }
    };

    const handleDelete = async () => {
        const confirm = window.confirm(
            "Are you sure you want to delete this post permanently?"
        );

        if (!confirm) return;

        try {
            await api.delete(`/laporan/${id}`);
            alert("Report successfully deleted.");
            navigate('/');
        } catch (error) {
            alert("Failed to delete report.");
        }
    };

    const handleShare = async () => {
        if (!item) return;

        const isLost = item.tipe_laporan === 'kehilangan';

        const actionText = isLost
            ? 'Tolong bantu cari '
            : 'Telah ditemukan ';

        const shareData = {
            title: `Balike - ${
                isLost ? 'Kehilangan' : 'Penemuan'
            } ${item.nama_barang}`,

            text: ` ${
                isLost
                    ? 'INFO BARANG HILANG'
                    : 'INFO BARANG TEMUAN'
            }\n\n${actionText}: *${item.nama_barang}*.\n\n📍 Lokasi: ${item.lokasi_kejadian}\n📅 Tanggal: ${new Date(
                item.tanggal_kejadian
            ).toLocaleDateString('id-ID')}\n\nLihat detail lengkapnya di sini, terimakasih:`,

            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(
                    `${shareData.text}\n${shareData.url}`
                );

                alert(
                    'Teks dan link halaman berhasil disalin! Silakan paste (Ctrl+V) di WhatsApp.'
                );
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-20 text-slate-500 font-medium">
                Loading details...
            </div>
        );
    }

    if (!item) return null;

    const isOwnerOrAdmin =
        loggedInUser &&
        (loggedInUser.id_user === item.id_user ||
            loggedInUser.role === 'admin');

    return (
        <div className="py-10 max-w-5xl mx-auto">
            {/* TOP ACTION */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-500 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors"
                >
                    ← Back
                </button>

                {isOwnerOrAdmin && (
                    <div className="flex gap-3">
                        {item.status !== 'selesai' && (
                            <>
                                <button
                                    onClick={handleSelesai}
                                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-2 px-4 rounded-xl text-sm transition-colors"
                                >
                                    ✓ Finished
                                </button>

                                <button
                                    onClick={() =>
                                        navigate(`/laporan/${id}/edit`)
                                    }
                                    className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold py-2 px-4 rounded-xl text-sm transition-colors"
                                >
                                    ✏️ Edit
                                </button>
                            </>
                        )}

                        <button
                            onClick={handleDelete}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2 px-4 rounded-xl text-sm transition-colors"
                        >
                            🗑 Delete
                        </button>
                    </div>
                )}
            </div>

            {/* CARD */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row relative">
                
                {/* STATUS BADGE */}
                {item.status === 'selesai' && (
                    <div className="absolute top-6 right-6 bg-emerald-500 text-white px-4 py-2 rounded-2xl font-black text-sm tracking-widest shadow-lg z-10 rotate-3">
                        🎉 FOUND
                    </div>
                )}

                {/* FOTO */}
                <div className="md:w-1/2 flex-shrink-0 relative">
                    {item.url_foto ? (
                        <img
                            src={`http://localhost:5000${item.url_foto}`}
                            alt={item.nama_barang}
                            className="w-full h-full min-h-[400px] object-cover rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none"
                        />
                    ) : (
                        <div className="w-full h-full min-h-[300px] md:min-h-[400px] bg-slate-50 flex flex-col items-center justify-center text-slate-400 rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none border-2 border-dashed border-slate-200 m-4 md:m-0 md:border-r-0">
                            <span className="text-6xl mb-4 opacity-50">
                                📷
                            </span>

                            <p className="font-bold tracking-widest uppercase text-sm">
                                No Photos
                            </p>

                            <p className="text-xs mt-2 text-slate-400">
                                The reporter did not include any images.
                            </p>
                        </div>
                    )}
                </div>

                {/* CONTENT */}
                <div className="md:w-1/2 p-8 md:p-12">
                    {/* TYPE */}
                    <span
                        className={`inline-block mb-4 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm ${
                            item.tipe_laporan === 'kehilangan'
                                ? 'bg-red-500 text-white'
                                : 'bg-emerald-500 text-white'
                        }`}
                    >
                        {item.tipe_laporan === 'kehilangan'
                            ? 'LOST'
                            : 'FOUND'}
                    </span>

                    {/* IMBALAN WRAPPER */}
                    <div className="mb-6">
                        <h1 className="text-4xl font-extrabold text-slate-800 mb-3">
                            {item.nama_barang}
                        </h1>

                        {item.imbalan > 0 && (
                            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 font-extrabold text-xs px-3 py-1.5 rounded-full shadow-sm">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                IMBALAN: {formatRupiah(item.imbalan)}
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        {/* DESCRIPTION */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                                Description of Event
                            </h4>

                            <p className="text-slate-600 leading-relaxed text-lg">
                                {item.deskripsi ||
                                    'There is no description.'}
                            </p>
                        </div>

                        {/* INFO */}
                        <div className="grid grid-cols-2 gap-8 border-y border-slate-50 py-8">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                                    📍 Location
                                </h4>

                                <p className="font-bold text-slate-800">
                                    {item.lokasi_kejadian}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                                    📅 Date
                                </h4>

                                <p className="font-bold text-slate-800">
                                    {new Date(
                                        item.tanggal_kejadian
                                    ).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* OWNER */}
                        <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                                {item.nama_lengkap.charAt(0)}
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Contact the Inventor/Owner
                                </p>

                                <p className="font-bold text-slate-800">
                                    {item.nama_lengkap}
                                </p>
                            </div>
                        </div>

                        {/* ACTION BUTTON */}
                        {item.status === 'selesai' ? (
                            <div className="block w-full text-center bg-slate-100 text-slate-400 font-bold py-5 rounded-3xl cursor-not-allowed">
                                Case Closed (Contact Closed)
                            </div>
                        ) : (
                            <div className="flex gap-3 mt-6">
                                <a
                                    href={`https://wa.me/${
                                        item.nomor_telepon.startsWith('0')
                                            ? '62' +
                                              item.nomor_telepon.slice(1)
                                            : item.nomor_telepon
                                    }`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-3xl shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
                                >
                                    Contact via WhatsApp
                                </a>

                                {/* SHARE */}
                                <button
                                    onClick={handleShare}
                                    className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-3xl flex items-center justify-center gap-2 transition-all border border-slate-200 active:scale-[0.98]"
                                    title="Bagikan laporan ini"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2.5"
                                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                        />
                                    </svg>

                                    <span className="hidden sm:inline">
                                        Share
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailLaporan;