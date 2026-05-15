import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardUser from './pages/DashboardUser';
import DashboardAdmin from './pages/DashboardAdmin';
import DetailLaporan from './pages/DetailLaporan';
import EditLaporan from './pages/EditLaporan';
import Profile from './pages/Profile';
import LupaPassword from './pages/LupaPassword';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        
        <Navbar />

        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} /> 
            <Route path="/dashboard" element={<DashboardUser />} />
            <Route path="/admin" element={<DashboardAdmin />} />
            <Route path="/laporan/:id" element={<DetailLaporan />} />
            <Route path="/laporan/:id/edit" element={<EditLaporan />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/lupa-password" element={<LupaPassword />} />
          </Routes>
        </main>

        <Footer />

      </div>
    </Router>
  );
}

export default App;