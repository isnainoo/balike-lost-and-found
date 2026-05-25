-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 25, 2026 at 03:47 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `balike_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `kategori`
--

CREATE TABLE `kategori` (
  `id_kategori` int(11) NOT NULL,
  `nama_kategori` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kategori`
--

INSERT INTO `kategori` (`id_kategori`, `nama_kategori`) VALUES
(1, 'Electronics & Gadgets'),
(2, 'Wallets & Bags'),
(3, 'Documents and Identity'),
(4, 'Vehicle / House Keys'),
(5, 'Other');

-- --------------------------------------------------------

--
-- Table structure for table `laporan`
--

CREATE TABLE `laporan` (
  `id_laporan` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_kategori` int(11) DEFAULT NULL,
  `tipe_laporan` enum('kehilangan','penemuan') NOT NULL,
  `nama_barang` varchar(150) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `lokasi_kejadian` varchar(150) DEFAULT NULL,
  `tanggal_kejadian` date DEFAULT NULL,
  `url_foto` text DEFAULT NULL,
  `status` enum('pending','published','rejected','selesai','archived') DEFAULT 'pending',
  `waktu_dibuat` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `laporan`
--

INSERT INTO `laporan` (`id_laporan`, `id_user`, `id_kategori`, `tipe_laporan`, `nama_barang`, `deskripsi`, `lokasi_kejadian`, `tanggal_kejadian`, `url_foto`, `status`, `waktu_dibuat`) VALUES
(1, 1, 2, 'kehilangan', 'Dompet Kulit Hitam', 'Pada hari Senin, 28 April 2026 sekitar pukul 15.00 WIB, saya kehilangan sebuah dompet di sekitar area kampus. Dompet tersebut berwarna coklat dan berisi KTP, kartu mahasiswa, ATM, serta sejumlah uang tunai. Kemungkinan dompet terjatuh di jalan atau tertinggal di salah satu ruangan. Bagi yang menemukan, mohon menghubungi saya. Terima kasih.', 'Kampus 2 ums', '2026-04-28', '/uploads/1777297005549.png', 'published', '2026-04-27 13:36:45'),
(2, 1, 1, 'penemuan', 'Samsung s25 ultra', 'Pada hari Senin, 28 April 2026 sekitar pukul 12.30 WIB, saya menemukan sebuah handphone di area dalam masjid, tepatnya di dekat saf belakang. HP tersebut berwarna putih dengan kondisi masih menyala. Tidak ditemukan identitas pemilik di sekitar lokasi. Saat ini barang diamankan untuk sementara. Bagi yang merasa kehilangan, dapat menghubungi dengan menyebutkan ciri-ciri HP secara detail sebagai bukti kepemilikan.', 'Masjid Sudalmiyah rais', '2026-04-04', '/uploads/1778257576884.png', 'published', '2026-04-27 13:45:20'),
(3, 1, 3, 'penemuan', 'Credit card', 'Saat ini card diamankan satpam. Bagi pemilik yang merasa kehilangan, silakan menghubungi dengan menyebutkan data yang sesuai sebagai bukti kepemilikan.', 'Parkiran UMS', '2026-04-16', '/uploads/1778315501426.png', 'published', '2026-04-27 14:37:10'),
(5, 2, 4, 'penemuan', 'Kunci motor vespa', 'Ditemukan sebuah kunci motor di area parkiran. Kunci tersebut memiliki gantungan berwarna hitam. Saat ini kunci diamankan. Bagi yang merasa kehilangan, silakan menghubungi dengan menyebutkan ciri-ciri detail sebagai bukti kepemilikan.', 'Stadion manahan', '2026-04-22', '/uploads/1778257494373.png', 'published', '2026-04-27 15:35:08'),
(7, 3, 1, 'kehilangan', 'Powerbank 60 watt', 'Saya kehilangan powerbank di area mushola spbu surakarta karena tertinggal, bagi yang menemukan bisa hubungi saya', 'Spbu solobaru', '2026-03-31', '/uploads/1777368191588.png', 'published', '2026-04-28 09:23:11'),
(8, 2, 1, 'penemuan', 'Power Hitam', 'Satu lagi saya menemukan powerbank didekat toilet warnanya hitam', 'Surakarta', '2026-04-25', '/uploads/1777370008772.png', 'published', '2026-04-28 09:53:28'),
(9, 3, 5, 'kehilangan', 'Parfum dior', 'Parfum saya merek dior tutupnyaberwarna hitam, body berwarna hitam dan biru yang menemukan hubungi saya ya', 'Stadion Manahan', '2026-04-17', '/uploads/1777371274065.png', 'published', '2026-04-28 10:14:34'),
(10, 2, 5, 'penemuan', 'Parfume wangi bunga', 'parfumenya perpaduan warna hitam dan biru', 'Stadion manahan', '2026-04-21', '/uploads/1777371430641.png', 'published', '2026-04-28 10:17:10'),
(11, 5, 1, 'kehilangan', 'Handphone ip 17 blue', 'Hallo gais saya kehilangan handphone warna biru, yang menemukan hubungi saya nggih', 'Surakarta', '2026-04-26', '/uploads/1777372417619.png', 'published', '2026-04-28 10:33:37'),
(12, 4, 1, 'penemuan', 'Hp warna biru', 'Telah ditemukan hp warna biru di jalan surakarta', 'Surakarta', '2026-04-28', '/uploads/1777372566233.png', 'published', '2026-04-28 10:36:06'),
(13, 3, 1, 'penemuan', 'Hp samsung warna biru', 'Saya menemukan hp samsung berwarna biru di daerah surakarta kota', 'Surakarta', '2026-04-25', '/uploads/1778257939896.png', 'published', '2026-04-29 14:35:10'),
(14, 3, 1, 'penemuan', 'Jam tangan', 'Saya menemukan jam tangan warna hitam mas', 'Spbu kartasura', '2026-05-02', '/uploads/1777821479575.png', 'selesai', '2026-05-03 15:17:59'),
(15, 3, 2, 'penemuan', 'dompet', 't', 'kampus', '2026-05-04', '/uploads/1777876245585.png', 'selesai', '2026-05-04 06:30:45'),
(18, 1, 4, 'kehilangan', 'Kunci motor honda nmax keyles', 'info info \r\ninfo info \r\ninfo info \r\ninfo info \r\ninfo info \r\ninfo info \r\ninfo info \r\ninfo info \r\ninfo info ', 'Fk Ums', '2026-04-28', '', 'published', '2026-05-04 14:43:25'),
(19, 4, 1, 'penemuan', 'Jam tangan warna hitam', 'Ditemukan jam tangan berwarna hitam di surakarta pak, merek apple watch', 'Surakarta', '2026-05-03', '/uploads/1777990286691.png', 'published', '2026-05-05 14:11:26'),
(21, 5, 1, 'kehilangan', 'Saya kehilangan mouse logitech', 'Saya kehilangan mouse logitech warna putih di sekitar kampus', 'Kampus UMS', '2026-05-06', '/uploads/1778258438869.png', 'pending', '2026-05-08 16:40:38');

-- --------------------------------------------------------

--
-- Table structure for table `pesan`
--

CREATE TABLE `pesan` (
  `id_pesan` int(11) NOT NULL,
  `id_laporan` int(11) NOT NULL,
  `id_pengirim` int(11) NOT NULL,
  `id_penerima` int(11) NOT NULL,
  `isi_pesan` text NOT NULL,
  `waktu_kirim` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id_user` int(11) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nomor_telepon` varchar(20) DEFAULT NULL,
  `role` enum('user','admin','super_admin') DEFAULT 'user',
  `is_trusted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_user`, `nama_lengkap`, `email`, `password`, `nomor_telepon`, `role`, `is_trusted`) VALUES
(1, 'Isna Admin', 'isna@gmail.com', '$2a$12$vrnwfagsboZ3vy1kFlrG7O9yAGO20HZXwB4qHylKVGjJ6YeB3a.1u', '081329131167', 'admin', 0),
(2, 'Kangmas Santos', 'santos@gmail.com', '$2a$10$HnyMJE04e5fblDgy2QrIbOHqcCYExIt0dMnlUgW5nlxzCWGB/arqu', '081329131167', 'user', 0),
(3, 'Kangmas bahlil', 'bahlil@gmail.com', '$2a$10$wEz7USGDT.ZNKtIkF7E3TOkvnJRCA0Ht2QnU2Eo2pjalz8V2efXqa', '081329131167', 'user', 0),
(4, 'Kangmas wilson', 'wilson@gmail.com', '$2a$10$qdB4Fl34FtEE7S0VjBe6Au96Pm/.MAmy5BGl2qEAFBNZNBWjcp6GG', '+62 896-0112-4730', 'user', 1),
(5, 'Kangmas mike', 'mike@gmail.com', '$2a$10$bp/WEVngqh3ihYp4ZMzE3ee0LuBzWV9T3dBBUx6hTmY9AID9NnfN2', '081329131167', 'user', 0),
(6, 'Super Saiyan', 'super@gmail.com', '$2a$10$dFqDK/S.i3Dg0OKUbHXx8OyKzZki8sXYP4JljYfgN2eF91fRHJE0m', '081329131167', 'super_admin', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `kategori`
--
ALTER TABLE `kategori`
  ADD PRIMARY KEY (`id_kategori`);

--
-- Indexes for table `laporan`
--
ALTER TABLE `laporan`
  ADD PRIMARY KEY (`id_laporan`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_kategori` (`id_kategori`);

--
-- Indexes for table `pesan`
--
ALTER TABLE `pesan`
  ADD PRIMARY KEY (`id_pesan`),
  ADD KEY `id_laporan` (`id_laporan`),
  ADD KEY `id_pengirim` (`id_pengirim`),
  ADD KEY `id_penerima` (`id_penerima`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `kategori`
--
ALTER TABLE `kategori`
  MODIFY `id_kategori` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `laporan`
--
ALTER TABLE `laporan`
  MODIFY `id_laporan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `pesan`
--
ALTER TABLE `pesan`
  MODIFY `id_pesan` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `laporan`
--
ALTER TABLE `laporan`
  ADD CONSTRAINT `laporan_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `laporan_ibfk_2` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON DELETE SET NULL;

--
-- Constraints for table `pesan`
--
ALTER TABLE `pesan`
  ADD CONSTRAINT `pesan_ibfk_1` FOREIGN KEY (`id_laporan`) REFERENCES `laporan` (`id_laporan`) ON DELETE CASCADE,
  ADD CONSTRAINT `pesan_ibfk_2` FOREIGN KEY (`id_pengirim`) REFERENCES `user` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `pesan_ibfk_3` FOREIGN KEY (`id_penerima`) REFERENCES `user` (`id_user`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
