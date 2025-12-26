import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      {/* Branding Section */}
      <div className="flex flex-col items-center text-center">
        <div className="bg-[#F2F2F2] p-12 rounded-full mb-8 shadow-sm">
          <img src="/images/logo.jpg" alt="MEro Baazar" className="w-48 h-auto" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          MEro <span className="text-[#4B7321]">Baazar</span>
        </h1>
        <p className="text-[#4B7321] text-xl md:text-2xl font-semibold italic mb-10">
          Shop Green, Live Green.
        </p>

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link 
            href="/select-role" 
            className="flex-1 bg-[#4B7321] text-white px-8 py-3 rounded-full font-bold text-center hover:bg-green-800 transition"
          >
            Get Started
          </Link>
          <Link 
            href="/login" 
            className="flex-1 border-2 border-[#4B7321] text-[#4B7321] px-8 py-3 rounded-full font-bold text-center hover:bg-green-50 transition"
          >
            Login
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-8 text-gray-400 text-sm">
        © 2025 MEro Baazar - Sustainable Shopping Platform
      </footer>
    </main>
  );
}