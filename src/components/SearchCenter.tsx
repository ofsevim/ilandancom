import React from 'react';
import { Search } from 'lucide-react';

interface SearchCenterProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSearch: (query: string) => void;
    onCategoryClick?: (categoryName: string) => void;
}

const SearchCenter: React.FC<SearchCenterProps> = ({ searchQuery, setSearchQuery, handleSearch, onCategoryClick }) => {
    return (
        <section className="top-bar border-b border-primary-100/50 dark:border-white/5 py-4 px-4 md:py-6 md:px-6 bg-white/40 dark:bg-primary-900/40 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto flex flex-col gap-3 md:gap-4">
                <div className="search-bar w-full flex items-center gap-3 relative group">
                    <div className="text-primary-400 group-focus-within:text-indigo-500 transition-colors shrink-0">
                        <Search size={22} />
                    </div>
                    <input
                        type="text"
                        placeholder="Ne aramıştınız? (Ev, Araba, Telefon...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                        className="w-full bg-transparent border-none outline-none text-primary-900 dark:text-white placeholder-primary-400 dark:placeholder-white/30 text-lg font-medium"
                    />
                </div>

                <div className="category-tags flex flex-wrap gap-3 items-center px-2">
                    <span className="text-[11px] font-black text-primary-400 dark:text-white/40 uppercase tracking-[0.2em]">POPÜLER:</span>
                    {['Emlak', 'Vasıta', 'Elektronik', 'Hizmetler'].map((tag) => (
                        <button
                            key={tag}
                            onClick={() => onCategoryClick?.(tag)}
                            className="popular-tag px-5 py-1.5 rounded-full text-primary-600 dark:text-white/70 text-xs font-bold transition-all border border-primary-200/50 dark:border-white/10 shadow-sm"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SearchCenter;
