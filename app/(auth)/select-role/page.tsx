import Link from "next/link";
import Image from "next/image";

export default function RoleSelectionPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl w-full items-center bg-slate-50 gap-8">
        {/* Left Side: Logo / Branding */}
        <div className="flex flex-col items-center justify-center rounded-3xl p-8 md:p-16">
          <Image
            src="/images/logo.jpg"
            alt="Mero Baazar Logo"
            width={256}
            height={256}
            className="w-64 mb-6 object-contain"
            priority
          />
          <p className="text-center text-gray-700 text-lg font-medium">
            Direct from Farm to Your Table
          </p>
        </div>

        {/* Right Side: Role Selection */}
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-800">Who are you?</h2>

          <div className="flex flex-col sm:flex-row gap-10 md:gap-16 mb-16">
            {/* Farmer / Seller */}
            <Link
              href="/register?role=seller"
              className="flex flex-col items-center group transition-all hover:scale-105"
            >
              <div className="w-28 h-28 md:w-32 md:h-32 mb-4 rounded-full overflow-hidden border-4 border-[#4B7321]/20 group-hover:border-[#4B7321] transition-colors">
                <Image
                  src="/images/farmer.png"
                  alt="Farmer / Seller"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-xl text-gray-800 group-hover:text-[#4B7321] transition-colors">
                Farmer / Seller
              </span>
              <span className="text-sm text-gray-600 mt-1">Sell your crops directly</span>
            </Link>

            {/* Buyer */}
            <Link
              href="/register?role=buyer"
              className="flex flex-col items-center group transition-all hover:scale-105"
            >
              <div className="w-28 h-28 md:w-32 md:h-32 mb-4 rounded-full overflow-hidden border-4 border-[#4B7321]/20 group-hover:border-[#4B7321] transition-colors">
                <Image
                  src="/images/buyer.png"
                  alt="Buyer"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-xl text-gray-800 group-hover:text-[#4B7321] transition-colors">
                Buyer
              </span>
              <span className="text-sm text-gray-600 mt-1">Buy fresh & affordable produce</span>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-gray-600 font-medium">Join Mero Baazar today</p>
            <p className="text-[#4B7321] text-xl font-bold mt-2">किसान र उपभोक्ता सँगै जोडिऔं</p>
          </div>
        </div>
      </div>
    </div>
  );
}