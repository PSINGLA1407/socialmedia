"use client";
import { useEffect, useState } from "react";
import styled from 'styled-components';
import { FaHeart } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';

interface Post {
  id: string;
  user_id: string;
  caption: string;
  likes: number;
  created_at: string;
  image: string | null;
}

// Helper function to validate image URL
const isValidImageUrl = (url: string | null): boolean => {
  if (!url) return false;
  // Check if it's a timestamp that was incorrectly saved as an image URL
  if (url.match(/^\d{4}-\d{2}-\d{2}/)) return false;
  // Check if it's a valid Supabase storage URL
  return url.includes('supabase.co/storage');
};

const FeedWrapper = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 32px 0 96px 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const PostCard = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(99,102,241,0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 0 16px;
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #6366f1;
`;

const Username = styled.div`
  font-weight: 600;
  color: #22223b;
`;

const PostImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  margin: 12px 0;
`;

const PostFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px 16px 16px;
`;

const LikeButton = styled.button`
  background: none;
  border: none;
  color: #e11d48;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: transform 0.1s;
  &:active {
    transform: scale(1.2);
  }
`;

const LikeCount = styled.span`
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 45px;
`;

const Caption = styled.div`
  color: #444;
  font-size: 1rem;
  flex: 1;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 1.1rem;
  color: #6366f1;
`;

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;

        // Clean up invalid image URLs
        const cleanedPosts = await Promise.all((data || []).map(async (post) => {
          // If the image field contains a timestamp, set it to null
          if (post.image && post.image.match(/^\d{4}-\d{2}-\d{2}/)) {
            const { error: updateError } = await supabase
              .from('posts')
              .update({ image: null })
              .eq('id', post.id);
            
            if (updateError) {
              console.error('Error cleaning up post:', updateError);
            }
            return { ...post, image: null };
          }
          return post;
        }));
        
        setPosts(cleanedPosts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  // --- CLAP FEATURE ---
  const handleLike = async (postId: string) => {
    // Optimistically update UI
    setPosts(posts =>
      posts.map(post =>
        post.id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post
      )
    );
    // Update in DB (atomic increment)
    const { error } = await supabase.rpc('increment_likes', { post_id: postId });
    if (error) {
      // Optionally, revert UI or show error
      console.error('Error updating likes:', error);
    }
  };

  if (loading) {
    return (
      <FeedWrapper>
        <LoadingWrapper>Loading posts...</LoadingWrapper>
      </FeedWrapper>
    );
  }

  if (error) {
    return (
      <FeedWrapper>
        <LoadingWrapper style={{ color: '#e11d48' }}>
          Error: {error}
        </LoadingWrapper>
      </FeedWrapper>
    );
  }

  return (
    <FeedWrapper>
      {posts.length === 0 ? (
        <LoadingWrapper>No posts yet. Be the first to post!</LoadingWrapper>
      ) : (
        posts.map(post => {
          console.log(`Rendering post ${post.id}:`, {
            image: post.image,
            hasImage: !!post.image,
            isValid: isValidImageUrl(post.image)
          });
          
          return (
            <PostCard key={post.id}>
              <PostHeader>
                <Username>{post.user_id}</Username>
              </PostHeader>
              {post.image && isValidImageUrl(post.image) && (
                <PostImage 
                  src={post.image} 
                  alt="Post content" 
                  onError={(e) => {
                    console.error('Image failed to load:', post.image);
                    // Hide broken images
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <PostFooter>
                <LikeButton 
                  aria-label={`Like this post (${post.likes || 0} likes)`}
                  onClick={() => handleLike(post.id)}
                >
                  <FaHeart />
                </LikeButton>
                <LikeCount>
                  {post.likes || 0} {post.likes === 1 ? 'like' : 'likes'}
                </LikeCount>
                <Caption>{post.caption}</Caption>
              </PostFooter>
            </PostCard>
          );
        })
      )}
    </FeedWrapper>
  );
} 