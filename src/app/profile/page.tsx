"use client";
import styled from 'styled-components';

const user = {
  name: 'Jane Doe',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  bio: 'Photographer & Traveler. Love to explore new places! 🌍📸',
};

const posts = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
];

const ProfileWrapper = styled.div`
  max-width: 480px;
  margin: 0 auto;
  padding: 32px 0 96px 0;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
`;

const Avatar = styled.img`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #6366f1;
  margin-bottom: 12px;
`;

const Name = styled.h2`
  font-size: 1.5rem;
  color: #22223b;
  margin: 0 0 8px 0;
`;

const Bio = styled.p`
  color: #444;
  font-size: 1rem;
  text-align: center;
  margin: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const GridImage = styled.img`
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 10px;
`;

export default function ProfilePage() {
  return (
    <ProfileWrapper>
      <Header>
        <Avatar src={user.avatar} alt={user.name} />
        <Name>{user.name}</Name>
        <Bio>{user.bio}</Bio>
      </Header>
      <Grid>
        {posts.map((src, i) => (
          <GridImage key={i} src={src} alt={`Post ${i + 1}`} />
        ))}
      </Grid>
    </ProfileWrapper>
  );
} 