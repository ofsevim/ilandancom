import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/imageCompression';
import { storageService } from '../services/api';

// Tüm ilanların resimlerini optimize et
export async function optimizeAllImages() {
  console.log('🚀 Resim optimizasyonu başlıyor...');
  
  try {
    // Tüm ilanları çek
    const { data: ads, error } = await supabase
      .from('ads')
      .select('id, images')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (!ads || ads.length === 0) {
      console.log('❌ İlan bulunamadı');
      return;
    }
    
    console.log(`📦 ${ads.length} ilan bulundu`);
    
    let optimizedCount = 0;
    let errorCount = 0;
    
    for (const ad of ads) {
      if (!ad.images || ad.images.length === 0) continue;
      
      console.log(`\n🔄 İlan ${ad.id} işleniyor... (${ad.images.length} resim)`);
      
      const optimizedImages: string[] = [];
      
      for (let i = 0; i < ad.images.length; i++) {
        const imageUrl = ad.images[i];
        
        try {
          // Resmi indir
          const response = await fetch(imageUrl);
          if (!response.ok) {
            console.log(`  ⚠️  Resim ${i + 1} indirilemedi`);
            optimizedImages.push(imageUrl); // Eski URL'i koru
            continue;
          }
          
          const blob = await response.blob();
          const file = new File([blob], `image-${i}.jpg`, { type: blob.type });
          
          // Resmi sıkıştır
          const compressedFile = await compressImage(file, 1920, 0.85);
          
          // Boyut karşılaştırması
          const originalSize = (blob.size / 1024 / 1024).toFixed(2);
          const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
          const savings = ((1 - compressedFile.size / blob.size) * 100).toFixed(1);
          
          console.log(`  ✅ Resim ${i + 1}: ${originalSize}MB → ${compressedSize}MB (${savings}% tasarruf)`);
          
          // Yeni resmi yükle
          const fileName = `optimized-${Date.now()}-${i}.jpg`;
          await storageService.uploadImage(compressedFile, fileName);
          const newUrl = await storageService.getImageUrl(fileName);
          
          optimizedImages.push(newUrl);
          
          // Eski resmi sil (URL'den path çıkar)
          try {
            const oldPath = imageUrl.split('/').pop();
            if (oldPath) {
              await storageService.deleteImage(oldPath);
            }
          } catch (deleteError) {
            console.log(`  ⚠️  Eski resim silinemedi`);
          }
          
        } catch (error) {
          console.log(`  ❌ Resim ${i + 1} optimize edilemedi:`, error);
          optimizedImages.push(imageUrl); // Eski URL'i koru
          errorCount++;
        }
      }
      
      // İlanı güncelle
      const { error: updateError } = await supabase
        .from('ads')
        .update({ images: optimizedImages })
        .eq('id', ad.id);
      
      if (updateError) {
        console.log(`  ❌ İlan güncellenemedi:`, updateError);
        errorCount++;
      } else {
        optimizedCount++;
        console.log(`  ✅ İlan güncellendi`);
      }
      
      // Rate limiting için bekle
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎉 Optimizasyon tamamlandı!');
    console.log(`✅ ${optimizedCount} ilan optimize edildi`);
    console.log(`❌ ${errorCount} hata oluştu`);
    
  } catch (error) {
    console.error('❌ Kritik hata:', error);
  }
}

// Tek bir ilanın resimlerini optimize et
export async function optimizeAdImages(adId: string) {
  console.log(`🔄 İlan ${adId} optimize ediliyor...`);
  
  try {
    const { data: ad, error } = await supabase
      .from('ads')
      .select('id, images')
      .eq('id', adId)
      .single();
    
    if (error) throw error;
    if (!ad || !ad.images || ad.images.length === 0) {
      console.log('❌ İlan veya resim bulunamadı');
      return;
    }
    
    const optimizedImages: string[] = [];
    
    for (let i = 0; i < ad.images.length; i++) {
      const imageUrl = ad.images[i];
      
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
          optimizedImages.push(imageUrl);
          continue;
        }
        
        const blob = await response.blob();
        const file = new File([blob], `image-${i}.jpg`, { type: blob.type });
        const compressedFile = await compressImage(file, 1920, 0.85);
        
        const fileName = `optimized-${Date.now()}-${i}.jpg`;
        await storageService.uploadImage(compressedFile, fileName);
        const newUrl = await storageService.getImageUrl(fileName);
        
        optimizedImages.push(newUrl);
        
        // Eski resmi sil
        try {
          const oldPath = imageUrl.split('/').pop();
          if (oldPath) await storageService.deleteImage(oldPath);
        } catch {}
        
      } catch (error) {
        console.log(`❌ Resim ${i + 1} optimize edilemedi`);
        optimizedImages.push(imageUrl);
      }
    }
    
    // İlanı güncelle
    await supabase
      .from('ads')
      .update({ images: optimizedImages })
      .eq('id', adId);
    
    console.log('✅ İlan optimize edildi');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}
