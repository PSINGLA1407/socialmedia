"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { supabase } from '../../lib/supabase';
import { FaEdit, FaCheck, FaTimes, FaCamera } from 'react-icons/fa';

interface UserProfile {
  bio?: string;
  posts?: string[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [posts, setPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/profile');
    }
  }, [status, router]);

  // Fetch user profile and posts
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;

      try {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('bio')
          .eq('user_id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        // Fetch user posts
        const { data: userPosts, error: postsError } = await supabase
          .from('posts')
          .select('image')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (postsError) {
          throw postsError;
        }

        if (profile) {
          setBio(profile.bio || '');
        }

        setPosts(userPosts?.map(post => post.image).filter(Boolean) || []);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleSaveBio = async () => {
    if (!session?.user?.id) return;

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          bio: bio.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id);

      if (updateError) throw updateError;
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving bio:', err);
      setError('Failed to save bio');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <PageWrapper>
      <ProfileWrapper>
        <ProfileHeader>
          <AvatarSection>
            <AvatarContainer>
              <Avatar 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}&backgroundColor=b6e3f4,c0aede,d1d4f9&backgroundType=gradientLinear&accessories=kurt,prescription01,prescription02,round,sunglasses,wayfarers&clothesColor=545454,65c9ff,262e33,5199e4,25557c,e6e6e6,929598,a7ffc4,ff5050,ffafb9,ffffb1,ffffff&accessoriesProbability=100&clothing=blazerShirt,blazerSweater,collarSweater,graphicShirt,hoodie,overall,shirtCrewNeck,shirtScoopNeck,shirtVNeck&clothingGraphic=bear,cumbia,deer,diamond,hola,pizza,resist,selena,skull,skullOutline&hairColor=2c1b18,4a312c,724133,a55728,b58143,c93305,d6b370,e8e1e1&skinColor=614335,edb98a,ffdbb4,f8d25c&top=dreads01,dreads02,frizzle,longHair,shortHair,shortHairDreads01,shortHairDreads02,shortHairFrizzle,shortHairShaggyMullet,shortHairShortCurly,shortHairShortFlat,shortHairShortRound,shortHairShortWaved,shortHairSides,shortHairTheCaesar,shortHairTheCaesarSidePart&topProbability=100`}
                alt={session.user.name || 'Profile'} 
              />
            </AvatarContainer>
          </AvatarSection>

          <InfoSection>
            <UserNameRow>
              <Username>{session.user.name || session.user.email?.split('@')[0]}</Username>
              <EditProfileButton onClick={() => setIsEditing(true)}>
                Edit Profile
              </EditProfileButton>
            </UserNameRow>

            <StatsRow>
              <StatItem>
                <StatNumber>{posts.length}</StatNumber>
                <StatLabel>posts</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>0</StatNumber>
                <StatLabel>followers</StatLabel>
              </StatItem>
              <StatItem>
                <StatNumber>0</StatNumber>
                <StatLabel>following</StatLabel>
              </StatItem>
            </StatsRow>

            <BioSection>
              {isEditing ? (
                <BioEditContainer>
                  <BioTextArea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write something about yourself..."
                    maxLength={150}
                  />
                  <BioEditButtons>
                    <SaveButton onClick={handleSaveBio}>
                      <FaCheck /> Save
                    </SaveButton>
                    <CancelButton onClick={() => {
                      setIsEditing(false);
                      setBio(bio);
                    }}>
                      <FaTimes />
                    </CancelButton>
                  </BioEditButtons>
                </BioEditContainer>
              ) : (
                <Bio>{bio || 'No bio yet'}</Bio>
              )}
            </BioSection>
          </InfoSection>
        </ProfileHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <PostsGrid>
          {posts.length > 0 ? (
            posts.map((src, i) => (
              <PostItem key={i}>
                <PostImage src={src} alt={`Post ${i + 1}`} />
              </PostItem>
            ))
          ) : (
            <EmptyState>
              <EmptyMessage>No posts yet</EmptyMessage>
              <CreatePostButton onClick={() => router.push('/create')}>
                Create First Post
              </CreatePostButton>
            </EmptyState>
          )}
        </PostsGrid>
      </ProfileWrapper>
    </PageWrapper>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.pageBackground};
  padding-bottom: 80px;
`;

const ProfileWrapper = styled.div`
  max-width: 935px;
  margin: 0 auto;
  padding: 30px 20px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ProfileHeader = styled.header`
  display: flex;
  padding: 20px 0 44px;
  border-bottom: 1px solid ${props => props.theme.border};
  margin-bottom: 44px;

  @media (max-width: 736px) {
  flex-direction: column;
  align-items: center;
    padding: 0;
  }
`;

const AvatarSection = styled.div`
  flex: none;
  margin-right: 30px;
  width: 150px;

  @media (max-width: 736px) {
    margin: 0 0 20px;
  }
`;

const AvatarContainer = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid ${props => props.theme.border};
  background: ${props => props.theme.cardBg};
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const InfoSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserNameRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;

  @media (max-width: 736px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const Username = styled.h1`
  font-size: 28px;
  font-weight: 300;
  color: ${props => props.theme.text};
  margin: 0;
`;

const EditProfileButton = styled.button`
  background: ${props => props.theme.cardBg};
  color: ${props => props.theme.text};
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  padding: 5px 9px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.inputBg};
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 40px;
  margin-bottom: 20px;

  @media (max-width: 736px) {
    justify-content: center;
    gap: 20px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StatNumber = styled.span`
  font-weight: 600;
  color: ${props => props.theme.text};
`;

const StatLabel = styled.span`
  color: ${props => props.theme.textSecondary};
`;

const BioSection = styled.div`
  max-width: 400px;
  margin-bottom: 20px;
`;

const Bio = styled.p`
  margin: 0;
  color: ${props => props.theme.text};
  white-space: pre-wrap;
  word-break: break-word;
`;

const BioEditContainer = styled.div`
  width: 100%;
`;

const BioTextArea = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  background: ${props => props.theme.inputBg};
  color: ${props => props.theme.text};
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
  }

  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }
`;

const BioEditButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${props => props.theme.primaryHover};
  }
`;

const CancelButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.cardBg};
  color: ${props => props.theme.error};
  border: 1px solid ${props => props.theme.border};
  border-radius: 4px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.errorBg};
  }
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 28px;
  padding-top: 20px;

  @media (max-width: 736px) {
    gap: 3px;
  }
`;

const PostItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 4px;
  background: ${props => props.theme.cardBg};
  border: 1px solid ${props => props.theme.border};
`;

const PostImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  background: ${props => props.theme.cardBg};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.border};
`;

const EmptyMessage = styled.p`
  color: ${props => props.theme.textSecondary};
  margin-bottom: 20px;
  font-size: 16px;
`;

const CreatePostButton = styled.button`
  background: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.theme.primaryHover};
    transform: translateY(-1px);
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.error};
  background: ${props => props.theme.errorBg};
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${props => props.theme.pageBackground};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.theme.border};
  border-top-color: ${props => props.theme.primary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`; 