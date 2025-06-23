import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Debug: Log Supabase configuration
console.log('Supabase Configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseKey,
  isDevelopment: process.env.NODE_ENV === 'development'
});

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
});

// Initialize storage and log detailed information
const initStorage = async () => {
  try {
    // Test basic connection
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('Storage connection test:', {
      success: !bucketsError,
      error: bucketsError?.message,
      buckets: buckets
    });
    
    if (bucketsError) {
      console.error('Storage connection error:', bucketsError);
      if (bucketsError.message.includes('JWT')) {
        console.error('This might be an authentication issue - check your ANON_KEY');
      }
      return;
    }

    // Check specific bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('post-images')
      .list();
    
    console.log('post-images bucket test:', {
      success: !filesError,
      error: filesError?.message,
      files: files
    });

  } catch (err) {
    console.error('Storage initialization error:', err);
  }
};

// Run initialization
initStorage();

// Test bucket access and permissions
export const checkBucketPermissions = async () => {
  try {
    // List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets);
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      return;
    }

    // Check if post-images bucket exists
    const postImagesBucket = buckets?.find(b => b.name === 'post-images');
    if (!postImagesBucket) {
      console.error('post-images bucket not found!');
      return;
    }

    // Try to list files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('post-images')
      .list();
    
    console.log('Files in post-images bucket:', files);
    if (filesError) {
      console.error('Error listing files:', filesError);
      return;
    }

    // Try to get a signed URL for the first file (if any exist)
    if (files && files.length > 0) {
      const { data: signedData, error: signedError } = await supabase.storage
        .from('post-images')
        .createSignedUrl(files[0].name, 60);
      
      console.log('Signed URL test:', signedData);
      if (signedError) {
        console.error('Error creating signed URL:', signedError);
      }
    }
  } catch (err) {
    console.error('Error checking bucket permissions:', err);
  }
};

// Run the check
checkBucketPermissions();

/*
To set up RLS policies for the posts table, run these SQL queries in your Supabase SQL editor:

-- Enable RLS
alter table posts enable row level security;

-- Create policy to allow authenticated users to create their own posts
create policy "Users can create their own posts"
on posts
for insert
to authenticated
with check (auth.uid()::text = user_id);

-- Create policy to allow anyone to read all posts
create policy "Anyone can read all posts"
on posts
for select
to anon, authenticated
using (true);

-- Optional: Allow users to update and delete their own posts
create policy "Users can update their own posts"
on posts
for update
to authenticated
using (auth.uid()::text = user_id);

create policy "Users can delete their own posts"
on posts
for delete
to authenticated
using (auth.uid()::text = user_id);
*/ 