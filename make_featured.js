
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function makeAdsFeatured() {
    console.log('Updating ads to be featured...');
    
    // Get first 8 active ads
    const { data: ads, error: fetchError } = await supabase
        .from('ads')
        .select('id')
        .eq('status', 'active')
        .limit(8);

    if (fetchError) {
        console.error('Error fetching ads:', fetchError);
        return;
    }

    if (!ads || ads.length === 0) {
        console.log('No active ads found to update.');
        return;
    }

    const adIds = ads.map(a => a.id);
    console.log(`Making ${adIds.length} ads featured...`);

    const { error: updateError } = await supabase
        .from('ads')
        .update({ featured: true })
        .in('id', adIds);

    if (updateError) {
        console.error('Error updating ads:', updateError);
        return;
    }

    console.log('Successfully updated ads to featured!');
}

makeAdsFeatured();
