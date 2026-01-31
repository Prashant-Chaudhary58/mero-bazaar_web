export default function HeroSection() {
    return (
        <div className="relative bg-[#729249] overflow-hidden rounded-none md:rounded-b-[0px]">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 flex flex-col md:flex-row items-center justify-between">

                {/* Left Content */}
                <div className="w-full md:w-1/2 z-10">
                    {/* Search Bar - Positioned above title in design? No, usually title first. 
                Design shows search bar at very top? 
                Actually, let's put search bar inside the hero as per "Search Bar component" request details on design.
            */}
                    <div className="mb-8">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-1 rounded-full flex items-center max-w-md">
                            <input
                                type="text"
                                placeholder="Search"
                                className="bg-transparent border-none outline-none text-white placeholder-white/70 px-4 py-2 w-full"
                            />
                            <button className="p-2 text-white/80 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                        Fresh. Fair. Direct
                    </h1>
                    <p className="text-white/90 text-xl md:text-2xl font-light">
                        बिचौलिया हटायौं, किसानको हातमा पैसा पुर्यायौं
                    </p>
                </div>

                {/* Right Image */}
                <div className="w-full md:w-1/2 mt-10 md:mt-0 flex justify-center md:justify-end relative">
                    {/* Flower Image */}
                    <div className="relative w-64 h-64 md:w-96 md:h-96">
                        <img
                            src="/images/flowerhome.png" // Using the image found in public/images
                            alt="Flower"
                            className="object-contain w-full h-full drop-shadow-2xl"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
