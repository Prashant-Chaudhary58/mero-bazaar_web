import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <h2 className="text-[#4B7321] font-bold text-xl">MEro Baazar</h2>
        <Link href="/login" className="text-sm text-red-600 font-medium">Logout</Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center max-w-lg">
          <div className="w-20 h-20 bg-green-100 text-[#4B7321] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to your Dashboard!</h1>
          <p className="text-gray-600 mb-8">
            This is a dummy dashboard page
          </p>
        </div>
      </main>
    </div>
  );
}