"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { FaTimes } from 'react-icons/fa';
import { useSession } from 'next-auth/react';

export default function CreatePost() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/create');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <LoadingContainer>Loading...</LoadingContainer>;
  }

  if (!session) {
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size must be less than 5MB');
          return;
        }
        setImage(file);
        setError(null);
      }
    } catch (err) {
      console.error('Error handling image:', err);
      setError('Failed to process image');
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

      if (!session?.user?.id) {
        throw new Error('You must be logged in to create a post');
      }

      let imageUrl = null;
      
      if (image) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2);
        const fileExt = image.name.split('.').pop() || 'jpg';
        const fileName = `${timestamp}-${randomString}.${fileExt}`;
        
        const { error: uploadError } = await supabase
          .storage
          .from('post-images')
          .upload(fileName, image);

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        const {
          data: { publicUrl },
        } = supabase
          .storage
          .from('post-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error: postError } = await supabase
        .from('posts')
        .insert([
          {
            caption: caption.trim(),
            image: imageUrl,
            user_id: session.user.id,
            likes: 0
          }
        ]);

      if (postError) {
        throw new Error(`Failed to create post: ${postError.message}`);
      }

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
    <PageContainer>
      <CreatePostContainer>
        <Header>
          <Title>Create New Post</Title>
        </Header>

        <Form onSubmit={handleSubmit}>
          <UserInfo>
            <UserAvatar 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`}
              alt={session.user.name || 'Profile'} 
            />
            <UserName>{session.user.name}</UserName>
          </UserInfo>

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
          
          <MediaSection>
            <FileInput
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              id="image-upload"
            />
            <FileInputLabel htmlFor="image-upload">
              Choose an image
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
                  onClick={() => setImage(null)} 
                  type="button"
                  aria-label="Remove image"
                >
                  <FaTimes />
                </RemoveImageButton>
              </ImagePreviewContainer>
            )}
          </MediaSection>

          <ButtonContainer>
            <CancelButton type="button" onClick={() => router.back()}>
              Cancel
            </CancelButton>
            <SubmitButton 
              type="submit" 
              disabled={loading || !caption.trim()}
            >
              {loading ? 'Posting...' : 'Post'}
            </SubmitButton>
          </ButtonContainer>
        </Form>

        {error && <ErrorMsg>{error}</ErrorMsg>}
      </CreatePostContainer>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: ${props => props.theme.pageBackground};

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const CreatePostContainer = styled.div`
  width: 100%;
  max-width: 700px;
  background: ${props => props.theme.cardBg};
  border-radius: 16px;
  box-shadow: 0 4px 12px ${props => props.theme.shadowColor};
  overflow: hidden;

  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.text};
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${props => props.theme.border};
`;

const UserName = styled.span`
  font-weight: 600;
  color: ${props => props.theme.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  border: 1px solid ${props => props.theme.inputBorder};
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  color: ${props => props.theme.text};
  background: ${props => props.theme.inputBg};
  transition: all 0.2s ease;
  font-family: inherit;

  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    background: ${props => props.theme.cardBg};
  }
`;

const MediaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  width: fit-content;

  &:hover {
    background: ${props => props.theme.primaryHover};
  }
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px ${props => props.theme.shadowColor};
`;

const ImagePreview = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const BaseButton = styled.button`
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  font-family: inherit;

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const SubmitButton = styled(BaseButton)`
  background: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;

  &:hover:not(:disabled) {
    background: ${props => props.theme.primaryHover};
  }

  &:disabled {
    background: ${props => props.theme.disabledBg};
    cursor: not-allowed;
  }
`;

const CancelButton = styled(BaseButton)`
  background: ${props => props.theme.cardBg};
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.border};

  &:hover {
    background: ${props => props.theme.inputBg};
  }
`;

const ErrorMsg = styled.div`
  color: ${props => props.theme.error};
  padding: 1rem;
  margin: 0 1.5rem 1.5rem;
  background: ${props => props.theme.errorBg};
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: ${props => props.theme.text};
`; 