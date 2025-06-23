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
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('Image size must be less than 5MB');
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
        const timestamp = new Date().getTime();
        const fileExt = image.name.split('.').pop();
        const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase
          .storage
          .from('post-images')
          .upload(fileName, image);

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase
          .storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

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

      router.push('/feed');
      router.refresh();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
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
          onChange={(e) => setCaption(e.target.value)}
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

const CreatePostContainer = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 1rem 0;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: auto;
  border-radius: 4px;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: red;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.div`
  color: red;
  margin-top: 1rem;
`; 