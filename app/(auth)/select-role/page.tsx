import Link from "next/link";
import Image from "next/image";

export default function RoleSelectionPage() {
  return (
    <div className="flex min-h-screen items-center justify-center  bg-slate-50 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl w-full items-center  bg-slate-50 ">

        <div className="flex flex-col items-center justify-center  rounded-3xl p-16">
          <img src="/images/logo.jpg" alt="MEro Baazar" className="w-64 mb-4" />
        </div>

        {/* Right Side: Role Selection */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-10">Select your role</h2>
          
          <div className="flex gap-12 mb-16">
            {/* Seller Option */}
            <Link href="/register?role=seller" className="flex flex-col items-center group">
              <div className="w-24 h-24 mb-2 transition-transform group-hover:scale-110">
                <img src="/images/farmer.png" alt="Seller" />
              </div>
              <span className="font-bold text-lg">Seller</span>
            </Link>

            {/* Buyer Option */}
            <Link href="/register?role=buyer" className="flex flex-col items-center group">
              <div className="w-24 h-24 mb-2 transition-transform group-hover:scale-110">
                <img src="/images/buyer.png" alt="Buyer" />
              </div>
              <span className="font-bold text-lg">Buyer</span>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-gray-600 font-medium">Join Us</p>
            <p className="text-[#4B7321] text-xl font-bold mt-1">Shop Green, Live Green.</p>
          </div>
        </div>
      </div>
    </div>
  );
}