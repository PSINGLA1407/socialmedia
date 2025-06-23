"use client";
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { FaHeart, FaRegCalendarAlt } from 'react-icons/fa';

interface Post {
  id: number;
  caption: string;
  image: string | null;
  created_at: string;
  user_id: string;
  likes: number;
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to ensure correct image URL format
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
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the image URLs in the posts
      const postsWithCorrectUrls = (data || []).map(post => ({
        ...post,
        image: post.image ? getCorrectImageUrl(post.image) : null
      }));

      console.log('Posts with corrected URLs:', postsWithCorrectUrls);
      setPosts(postsWithCorrectUrls);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to fetch posts');
      setPosts([]);
    } finally {
      setLoading(false);
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

  if (loading) {
    return <LoadingContainer>Loading posts...</LoadingContainer>;
  }

  if (error) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }

  return (
    <FeedContainer>
      {posts.length === 0 ? (
        <EmptyState>No posts yet. Be the first to post!</EmptyState>
      ) : (
        posts.map((post) => {
          // Log each post's image URL for debugging
          console.log(`Post ${post.id} image URL:`, post.image);
          
          return (
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
                  <LikeCount>
                    <FaHeart style={{color:'#ff1744'}}/>
                    {post.likes || 0}
                  </LikeCount>
                  <PostDate>
                    <FaRegCalendarAlt style={{color:'#0070f3'}}/>
                    {formatDate(post.created_at)}
                  </PostDate>
                </PostMeta>
              </PostContent>
            </PostCard>
          );
        })
      )}
    </FeedContainer>
  );
}

const FeedContainer = styled.div`
  max-width: 700px;
  margin: 0 auto;
  padding: 2.5rem 1rem;
  background: linear-gradient(135deg, #0f2027 0%, #2c5364 100%);
  min-height: 100vh;
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const ErrorContainer = styled.div`
  color: red;
  text-align: center;
  padding: 2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const PostCard = styled.div`
  background: rgba(255,255,255,0.13);
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.15);
  margin-bottom: 2rem;
  overflow: hidden;
  border: 1.5px solid rgba(255,255,255,0.18);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover {
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.25);
    transform: translateY(-2px) scale(1.01);
  }
`;

const PostImageContainer = styled.div`
  width: 100%;
  position: relative;
  overflow: hidden;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  background: rgba(0, 0, 0, 0.05);
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
  color: var(--foreground);
  font-weight: 500;
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 1.5rem;
  color: #0070f3;
  font-size: 1rem;
  align-items: center;
`;

const LikeCount = styled.span`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
`;

const PostDate = styled.span`
  display: flex;
  align-items: center;
  gap: 0.4rem;
`; 