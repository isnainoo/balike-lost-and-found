import { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
};

const Home = () => {
    const [laporan, setLaporan] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [kategoriList, setKategoriList] = useState([]);
    const [selectedKategori, setSelectedKategori] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resLaporan, resKategori] = await Promise.all([
                    api.get('/laporan/public'),
                    api.get('/kategori')
                ]);

                setLaporan(resLaporan.data);
                setKategoriList(resKategori.data);
            } catch (error) {
                console.error("Error retrieving data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredLaporan = laporan.filter((item) => {
        const nama = item.nama_barang ? item.nama_barang.toLowerCase() : '';
        const deskripsi = item.deskripsi ? item.deskripsi.toLowerCase() : '';
        const lokasi = item.lokasi_kejadian ? item.lokasi_kejadian.toLowerCase() : '';
        const query = searchQuery.toLowerCase();

        const matchSearch =
            nama.includes(query) ||
            deskripsi.includes(query) ||
            lokasi.includes(query);

        const matchKategori =
            selectedKategori === '' ||
            item.id_kategori === parseInt(selectedKategori);

        return matchSearch && matchKategori;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const currentItems = filteredLaporan.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    const totalPages = Math.ceil(filteredLaporan.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleCategoryClick = (kategori) => {
        setSelectedKategori(kategori);
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="text-center mt-20 text-slate-500 font-medium italic">
                Loading data Balike...
            </div>
        );
    }

    return (
        <div className="py-10">

            {/* HERO SECTION */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 md:p-16 text-white text-center mb-12 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                        Find Your Items Back.
                    </h1>

                    <p className="text-blue-100 text-lg max-w-2xl mx-auto font-light mb-8">
                        Integrated Lost & Found Reporting Platform in Surakarta City.
                    </p>

                    <Link
                        to="/dashboard"
                        className="inline-block bg-white text-blue-700 font-extrabold tracking-wide px-8 py-4 rounded-full shadow-lg hover:bg-slate-50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 active:scale-95"
                    >
                        + Create Report Now
                    </Link>
                </div>

                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
            </div>

            {/* SEARCH BAR */}
            <div className="max-w-2xl mx-auto mb-10">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        🔍
                    </div>

                    <input
                        type="text"
                        placeholder="Search for item name, description, or location..."
                        className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-slate-700"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {/* FILTER KATEGORI */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                <button
                    onClick={() => handleCategoryClick('')}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                        selectedKategori === ''
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-600 hover:text-blue-600'
                    }`}
                >
                    All
                </button>

                {kategoriList.map((kat) => (
                    <button
                        key={kat.id_kategori}
                        onClick={() =>
                            handleCategoryClick(kat.id_kategori.toString())
                        }
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                            selectedKategori === kat.id_kategori.toString()
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-600 hover:text-blue-600'
                        }`}
                    >
                        {kat.nama_kategori}
                    </button>
                ))}
            </div>

            {/* GRID LAPORAN */}
            {filteredLaporan.length === 0 ? (
                <div className="text-center text-slate-400 bg-white p-20 rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-lg font-medium">
                        {searchQuery
                            ? `No results found for "${searchQuery}"`
                            : "No reports have been published yet."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {currentItems.map((item) => (
                            <Link
                                to={`/laporan/${item.id_laporan}`}
                                key={item.id_laporan}
                                className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col group relative"
                            >
                                <div className="relative h-56 overflow-hidden">
                                    {item.url_foto ? (
                                        <img
                                            src={`http://localhost:5000${item.url_foto}`}
                                            alt={item.nama_barang}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-bold italic tracking-widest">
                                            NO IMAGE
                                        </div>
                                    )}

                                    {/* BADGE TIPE (LOST/FOUND) */}
                                    <div className="absolute top-5 left-5">
                                        <span
                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm ${
                                                item.tipe_laporan === 'kehilangan'
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-emerald-500 text-white'
                                            }`}
                                        >
                                            {item.tipe_laporan === 'kehilangan'
                                                ? 'LOST'
                                                : 'FOUND'}
                                        </span>
                                    </div>

                                    {item.imbalan > 0 && (
                                        <div className="absolute top-5 right-5">
                                            <span className="flex items-center gap-1 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 px-3 py-1 rounded-lg text-[10px] font-black tracking-tighter shadow-sm">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                </svg>
                                                {formatRupiah(item.imbalan)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-7 flex flex-col flex-1">
                                    <h3 className="text-xl font-extrabold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                                        {item.nama_barang}
                                    </h3>

                                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">
                                        {item.deskripsi || 'Click to see item details.'}
                                    </p>

                                    <div className="flex items-center justify-between pt-5 border-t border-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5">
                                            📍 <span>{item.lokasi_kejadian}</span>
                                        </div>

                                        <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                                            SEE DETAILS →
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* PAGINATION */}
                    {filteredLaporan.length > itemsPerPage && (
                        <div className="mt-12 bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">

                            <div className="text-slate-500 text-sm font-medium">
                                Showing{' '}
                                <span className="font-bold text-slate-800">
                                    {indexOfFirstItem + 1}
                                </span>{' '}
                                until{' '}
                                <span className="font-bold text-slate-800">
                                    {Math.min(indexOfLastItem, filteredLaporan.length)}
                                </span>{' '}
                                from{' '}
                                <span className="font-bold text-slate-800">
                                    {filteredLaporan.length}
                                </span>{' '}
                                document
                            </div>

                            <div className="flex rounded-xl overflow-hidden shadow-sm border border-slate-300">

                                {/* PREV */}
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                                    }
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-800 disabled:opacity-50 disabled:hover:bg-slate-200 transition-colors border-r border-slate-300 font-bold"
                                >
                                    &lt;
                                </button>

                                {/* PAGE NUMBER */}
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => paginate(index + 1)}
                                        className={`px-4 py-2 border-r border-slate-300 transition-colors ${
                                            currentPage === index + 1
                                                ? 'bg-slate-400 text-white font-bold'
                                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 hover:text-slate-900'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                {/* NEXT */}
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, totalPages)
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-800 disabled:opacity-50 disabled:hover:bg-slate-200 transition-colors font-bold"
                                >
                                    &gt;
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Home;