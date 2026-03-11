import { Link } from 'react-router-dom';
import { useListings } from '@/context/ListingContext';
import { useToast } from '@/hooks/use-toast';
import { Ad } from '@/types';

function ListingCard({ listing }: { listing: Ad }) {
  const { favorites, toggleFavorite } = useListings();
  const { toast } = useToast();
  const isFav = favorites.includes(listing.id);

  const seller = listing.user;
  const category = listing.category;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'YENİ';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'YENİ';
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Bugün';
    if (diffDays === 2) return 'Dün';
    if (diffDays <= 7) return `${diffDays - 1} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
      <Link to={`/ilan/${listing.id}`} className="block relative aspect-[4/3] overflow-hidden">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 uppercase text-[10px] font-black">
            Görsel Yok
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {listing.featured && (
            <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">VİTRİN</span>
          )}
          {category && (
            <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
              {category.name.toUpperCase()}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={e => { 
            e.preventDefault(); 
            e.stopPropagation();
            toggleFavorite(listing.id); 
            toast({ title: isFav ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi' }); 
          }}
          className={`absolute top-4 right-4 h-10 w-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 z-10
            ${isFav ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-white/50 text-slate-900 hover:bg-white hover:scale-110'}`}
        >
          <span className={`material-symbols-outlined text-2xl ${isFav ? 'fill-1' : ''}`}>
            favorite
          </span>
        </button>

        {/* Counter */}
        <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="material-symbols-outlined text-xs">photo_camera</span>
          {listing.images?.length || 0}
        </div>
      </Link>

      {/* Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="text-xl font-black text-primary tracking-tight">
            {listing.price.toLocaleString('tr-TR')} ₺
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">visibility</span>
            {listing.viewCount || 0}
          </div>
        </div>

        <Link to={`/ilan/${listing.id}`}>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1 mb-4 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-6">
          <span className="material-symbols-outlined text-sm text-primary">location_on</span>
          {listing.location?.city}, {listing.location?.district}
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase overflow-hidden border border-slate-200 dark:border-slate-600">
              {seller?.avatar ? (
                <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
              ) : (
                seller?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-slate-900 dark:text-white truncate max-w-[90px] leading-tight">{seller?.name || 'Kullanıcı'}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{formatDate(listing.createdAt)}</span>
            </div>
          </div>
          
          <Link 
            to={`/ilan/${listing.id}`}
            className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300"
          >
            <span className="material-symbols-outlined text-xl">arrow_outward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedListings() {
  const { listings, loading } = useListings();

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem]" />
          ))}
        </div>
      </section>
    );
  }

  const featured = listings.filter((l: Ad) => (l as any).featured === true).slice(0, 8);
  const displayListings = featured.length > 0 ? featured : listings.slice(0, 8);

  if (displayListings.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {featured.length > 0 ? 'Vitrindeki İlanlar' : 'En Yeni İlanlar'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {featured.length > 0 ? 'Sizin için seçtiğimiz özel fırsatlar' : 'Sisteme yeni eklenen ilanlara göz atın'}
          </p>
        </div>
        <Link 
          to="/ilanlar" 
          className="text-primary font-bold flex items-center gap-1 hover:underline group"
        >
          Tümünü Gör
          <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayListings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </section>
  );
}

export { ListingCard };
