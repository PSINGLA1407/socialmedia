"use client";
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { FaHeart, FaRegHeart, FaRegCalendarAlt } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Post {
  id: number;
  caption: string;
  image: string | null;
  created_at: string;
  user_id: string;
  likes: number;
  liked_by_user?: boolean;
}

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.pageBackground};
  padding-bottom: 7rem;
`;

const PageTitle = styled.h1`
  color: ${props => props.theme.text};
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  padding: 2rem 0 1rem 0;
`;

const FeedContainer = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 1rem;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.text};
`;

const ErrorContainer = styled.div`
  color: ${props => props.theme.error};
  text-align: center;
  padding: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.textSecondary};
`;

const PostCard = styled.div`
  background: ${props => props.theme.cardBg};
  border-radius: 18px;
  box-shadow: 0 4px 24px ${props => props.theme.shadowColor};
  margin-bottom: 2rem;
  overflow: hidden;
  border: 1.5px solid ${props => props.theme.border};
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 8px 32px ${props => props.theme.shadowColor};
    transform: translateY(-2px);
  }
`;

const PostImageContainer = styled.div`
  width: 100%;
  position: relative;
  overflow: hidden;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  background: ${props => props.theme.inputBg};
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PostImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const PostContent = styled.div`
  padding: 1.5rem 1.2rem 1.2rem 1.2rem;
`;

const Caption = styled.p`
  margin: 0 0 1.2rem 0;
  font-size: 1.15rem;
  line-height: 1.6;
  color: ${props => props.theme.text};
  font-weight: 500;
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 1.5rem;
  color: ${props => props.theme.primary};
  font-size: 1rem;
  align-items: center;
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${props => props.theme.text};
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const PostDate = styled.span`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${props => props.theme.text};
`;

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const getCorrectImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes('supabase.co/storage/v1/object/public')) {
      return url;
    }
    return url.replace(
      'storage.googleapis.com',
      'supabase.co/storage/v1/object/public'
    );
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) {
        throw postsError;
      }

      const postsWithCorrectUrls = (postsData || []).map(post => ({
        ...post,
        image: post.image ? getCorrectImageUrl(post.image) : null
      }));

      setPosts(postsWithCorrectUrls);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setErrorMsg('Failed to fetch posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: number, currentLikes: number) => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/feed');
      return;
    }

    try {
      const newLikeCount = currentLikes + 1;
      
      // Optimistically update UI
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, likes: newLikeCount }
            : post
        )
      );

      // Update post likes count
      const { error: updateError } = await supabase
        .from('posts')
        .update({ likes: newLikeCount })
        .eq('id', postId);

      if (updateError) {
        throw updateError;
      }

    } catch (err) {
      console.error('Error updating like:', err);
      // Revert optimistic update on error
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, likes: currentLikes }
            : post
        )
      );
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Invalid date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <PageTitle>Home</PageTitle>
        <LoadingContainer>Loading posts...</LoadingContainer>
      </PageWrapper>
    );
  }

  if (errorMsg) {
    return (
      <PageWrapper>
        <PageTitle>Home</PageTitle>
        <ErrorContainer>{errorMsg}</ErrorContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageTitle>Home</PageTitle>
      <FeedContainer>
        {posts.length === 0 ? (
          <EmptyState>No posts yet. Be the first to post!</EmptyState>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id}>
              {post.image && (
                <PostImageContainer>
                  <PostImage
                    src={post.image}
                    alt={`Post ${post.id}`}
                    onError={(e) => {
                      console.error(`Error loading image for post ${post.id}:`, post.image);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                    loading="lazy"
                  />
                </PostImageContainer>
              )}
              <PostContent>
                <Caption>{post.caption || 'No caption'}</Caption>
                <PostMeta>
                  <LikeButton
                    onClick={() => handleLike(post.id, post.likes)}
                    aria-label="Like post"
                  >
                    <FaHeart style={{ color: '#ff4b4b' }} />
                    {post.likes || 0}
                  </LikeButton>
                  <PostDate>
                    <FaRegCalendarAlt style={{ color: '#0095f6' }}/>
                    {formatDate(post.created_at)}
                  </PostDate>
                </PostMeta>
              </PostContent>
            </PostCard>
          ))
        )}
      </FeedContainer>
    </PageWrapper>
  );
} 