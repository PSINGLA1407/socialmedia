"use client";
import styled from 'styled-components';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import NextLink from 'next/link';

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.background};
`;

const Card = styled.div`
  background: ${props => props.theme.cardBg};
  border-radius: 24px;
  box-shadow: 0 8px 32px ${props => props.theme.shadowColor};
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 350px;
  width: 100%;
  border: 1px solid ${props => props.theme.border};
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme.text};
  margin-bottom: 24px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid ${props => props.theme.border};
  border-radius: 8px;
  font-size: 1rem;
  background: ${props => props.theme.inputBg};
  color: ${props => props.theme.text};
  transition: all 0.2s ease;
  
  &:focus {
    border: 1.5px solid ${props => props.theme.primary};
    outline: none;
  }

  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }
`;

const SignInButton = styled.button`
  background: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 12px;
  padding: 14px 0;
  width: 100%;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.primaryHover};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${props => props.theme.disabledBg};
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMsg = styled.div`
  color: ${props => props.theme.error};
  margin-top: 12px;
  font-size: 1rem;
`;

const NavigationLink = styled(NextLink)`
  color: ${props => props.theme.primary};
  margin-top: 18px;
  display: block;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.primaryHover};
    text-decoration: underline;
  }
`;

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/feed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Card>
        <Title>Sign In</Title>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <SignInButton type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </SignInButton>
        </form>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <NavigationLink href="/auth/signup">
          Don&apos;t have an account? Sign up
        </NavigationLink>
      </Card>
    </Wrapper>
  );
} 