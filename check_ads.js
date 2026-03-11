
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAds() {
    console.log('Checking ads table...');
    const { data: ads, count, error } = await supabase
        .from('ads')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error fetching ads:', error);
        return;
    }

    console.log(`Total ads in database: ${count}`);
    if (ads && ads.length > 0) {
        console.log('Sample ads (first 5):');
        ads.slice(0, 5).forEach(ad => {
            console.log(`- ID: ${ad.id}, Title: ${ad.title}, Status: ${ad.status}, Featured: ${ad.featured}`);
        });
        
        const activeAds = ads.filter(a => a.status === 'active');
        const featuredAds = ads.filter(a => a.featured === true);
        
        console.log(`Active ads: ${activeAds.length}`);
        console.log(`Featured ads: ${featuredAds.length}`);
    } else {
        console.log('No ads found in the database.');
    }
}

checkAds();
