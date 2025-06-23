"use client";
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaImage, FaTimes } from 'react-icons/fa';

const CreatePostContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  padding-bottom: 96px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  resize: vertical;
  font-family: inherit;
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

const ImageUploadContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 200px;
  border: 2px dashed #e5e7eb;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
  &:hover {
    border-color: #6366f1;
    background: #f9fafb;
  }
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  width: 100%;
  max-height: 300px;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const Button = styled.button`
  background: #6366f1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background: #4f46e5;
  }
  &:disabled {
    background: #a5b4fc;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  margin-top: 1rem;
  color: #10b981;
  font-weight: 500;
`;

const ErrorMsg = styled.div`
  margin-top: 1rem;
  color: #e11d48;
  font-weight: 500;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 1.1rem;
  color: #6366f1;
`;

export default function CreatePost() {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Debug logging for session
    console.log('Session status:', status);
    console.log('Session data:', session);

    // Debug logging for storage bucket
    const checkBucket = async () => {
      try {
        // List all buckets
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        console.log('Available buckets:', buckets);
        if (bucketsError) console.error('Error listing buckets:', bucketsError);

        // Try to get post-images bucket info
        const { data: files, error: filesError } = await supabase.storage
          .from('post-images')
          .list();
        console.log('Files in post-images:', files);
        if (filesError) console.error('Error listing files:', filesError);
      } catch (err) {
        console.error('Bucket check error:', err);
      }
    };

    if (status === 'authenticated') {
      checkBucket();
    }
  }, [session, status]);

  // If not authenticated, redirect to sign in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setImage(file);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      if (!caption) {
        throw new Error('Please enter a caption');
      }

      let imageUrl = null;
      
      if (image) {
        // Generate a unique filename using timestamp and original name
        const timestamp = new Date().getTime();
        const fileExt = image.name.split('.').pop();
        const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Upload image to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('post-images')
          .upload(fileName, image);

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        // Get the public URL for the uploaded image
        const { data: { publicUrl } } = supabase
          .storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
        console.log('Image uploaded successfully:', imageUrl);
      }

      // Create post with image URL
      const { error: postError } = await supabase
        .from('posts')
        .insert([
          {
            caption,
            image: imageUrl,
            user_id: 'placeholder-user-id',
            likes: 0
          }
        ]);

      if (postError) {
        throw new Error(`Failed to create post: ${postError.message}`);
      }

      // Redirect to feed page after successful post
      router.push('/feed');
      router.refresh();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <CreatePostContainer>
        <LoadingSpinner>Loading...</LoadingSpinner>
      </CreatePostContainer>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <CreatePostContainer>
        <ErrorMsg>Please sign in to create posts.</ErrorMsg>
      </CreatePostContainer>
    );
  }

  return (
    <CreatePostContainer>
      <h1>Create a New Post</h1>
      <Form onSubmit={handleSubmit}>
        <TextArea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What's on your mind? (Optional if uploading an image)"
        />
        
        {image && (
          <ImagePreviewContainer>
            <ImagePreview src={URL.createObjectURL(image)} alt="Preview" />
            <RemoveImageButton onClick={removeImage} type="button">
              <FaTimes />
            </RemoveImageButton>
          </ImagePreviewContainer>
        )}

        <Button 
          type="submit" 
          disabled={loading || !caption}
        >
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </Form>
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </CreatePostContainer>
  );
} 