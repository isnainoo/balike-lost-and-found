const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8 text-center text-slate-500 text-sm">
        <p className="mt-1">
          An Integrated Platform for Reporting and Searching for Lost Items in Surakarta City
        </p>
        <p className="mt-4 text-xs text-slate-400">
          © {new Date().getFullYear()} Balike. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;