"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { FaTimes } from 'react-icons/fa';

export default function CreatePost() {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB
          setError('Image size must be less than 5MB');
          return;
        }
        setImage(file);
        setError(null); // Clear any previous errors
      }
    } catch (err) {
      console.error('Error handling image:', err);
      setError('Failed to process image');
    }
  };

  const removeImage = () => {
    try {
      setImage(null);
      setError(null);
      // Reset the input if it exists
      const input = document.getElementById('image-upload') as HTMLInputElement;
      if (input) {
        input.value = '';
      }
    } catch (err) {
      console.error('Error removing image:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      if (!caption.trim()) {
        throw new Error('Please enter a caption');
      }

      let imageUrl = null;
      
      if (image) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2);
        const fileExt = image.name.split('.').pop() || 'jpg';
        const fileName = `${timestamp}-${randomString}.${fileExt}`;
        
        // Upload the image
        const { error: uploadError } = await supabase
          .storage
          .from('post-images')
          .upload(fileName, image);

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        // Get the CDN URL for the image
        const {
          data: { publicUrl },
        } = supabase
          .storage
          .from('post-images')
          .getPublicUrl(fileName);

        // Transform the URL to use the direct CDN URL
        const cdnUrl = publicUrl.replace(
          'storage.googleapis.com',
          'supabase.co/storage/v1/object/public'
        );

        imageUrl = cdnUrl;
        console.log('Generated image URL:', imageUrl); // For debugging
      }

      const { error: postError } = await supabase
        .from('posts')
        .insert([
          {
            caption: caption.trim(),
            image: imageUrl,
            user_id: 'placeholder-user-id',
            likes: 0
          }
        ]);

      if (postError) {
        throw new Error(`Failed to create post: ${postError.message}`);
      }

      // Clear form
      setCaption('');
      setImage(null);
      
      // Navigate to feed
      router.push('/feed');
      router.refresh();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create post';
      setError(errorMessage);
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CreatePostContainer>
      <h1>Create a New Post</h1>
      <Form onSubmit={handleSubmit}>
        <TextArea
          value={caption}
          onChange={(e) => {
            setCaption(e.target.value);
            if (error && error.includes('caption')) {
              setError(null);
            }
          }}
          placeholder="What's on your mind?"
          required
        />
        
        <FileInput
          type="file"
          onChange={handleImageChange}
          accept="image/*"
          id="image-upload"
        />
        <FileInputLabel htmlFor="image-upload">
          Choose an image (optional)
        </FileInputLabel>
        
        {image && (
          <ImagePreviewContainer>
            <ImagePreview 
              src={URL.createObjectURL(image)} 
              alt="Preview"
              onError={() => {
                setError('Failed to load image preview');
                setImage(null);
              }}
            />
            <RemoveImageButton 
              onClick={removeImage} 
              type="button"
              aria-label="Remove image"
            >
              <FaTimes />
            </RemoveImageButton>
          </ImagePreviewContainer>
        )}

        <Button 
          type="submit" 
          disabled={loading || !caption.trim()}
        >
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </Form>
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </CreatePostContainer>
  );
}

const CreatePostContainer = styled.div`
  max-width: 500px;
  margin: 3rem auto;
  padding: 2rem 2.5rem;
  background: rgba(255,255,255,0.15);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.18);
  color: var(--foreground);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 1.5px solid #0070f3;
  border-radius: 10px;
  background: rgba(255,255,255,0.25);
  color: var(--foreground);
  font-size: 1.1rem;
  transition: border 0.2s, box-shadow 0.2s;
  &:focus {
    border: 2px solid #0070f3;
    outline: none;
    box-shadow: 0 0 0 2px #0070f355;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 0.7rem 1.2rem;
  background: linear-gradient(90deg, #0070f3 60%, #00c6ff 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 0.5rem;
  transition: background 0.2s;
  &:hover {
    background: linear-gradient(90deg, #005bb5 60%, #0070f3 100%);
  }
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 320px;
  margin: 1rem 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
`;

const ImagePreview = styled.img`
  width: 100%;
  height: auto;
  border-radius: 12px;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 0.3rem;
  right: 0.3rem;
  background: #ff1744;
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: background 0.2s;
  &:hover {
    background: #d50000;
  }
`;

const Button = styled.button`
  padding: 0.8rem 2rem;
  background: linear-gradient(90deg, #0070f3 60%, #00c6ff 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
  box-shadow: 0 2px 8px rgba(0,112,243,0.10);
  transition: background 0.2s, box-shadow 0.2s;
  &:hover:not(:disabled) {
    background: linear-gradient(90deg, #005bb5 60%, #0070f3 100%);
    box-shadow: 0 4px 16px rgba(0,112,243,0.18);
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.div`
  color: #ff1744;
  background: rgba(255,23,68,0.08);
  border: 1px solid #ff1744;
  border-radius: 8px;
  padding: 0.7rem 1rem;
  margin-top: 1rem;
  font-weight: 600;
  text-align: center;
`; 