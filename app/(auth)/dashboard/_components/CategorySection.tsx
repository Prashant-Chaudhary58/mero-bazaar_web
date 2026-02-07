export default function CategorySection() {
    const categories = ["All", "Vegetables (तरकारी)", "Fruits (फलफूल)"];

    return (
        <div id="categories" className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Categories</h2>
            <div className="flex flex-wrap gap-3">
                {categories.map((cat, index) => (
                    <button
                        key={index}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition ${index === 0
                                ? "bg-gray-200 text-gray-800" // Active state for 'All'
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
}
