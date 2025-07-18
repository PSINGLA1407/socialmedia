"use client";
import styled from 'styled-components';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { signIn } from 'next-auth/react';
import NextLink from 'next/link';

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%);
`;

const Card = styled.div`
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(99,102,241,0.12);
  padding: 40px 24px 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 370px;
  width: 100%;
  margin: 16px;
`;

const Title = styled.h1`
  font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
  font-size: 2rem;
  color: #22223b;
  margin-bottom: 8px;
  text-align: center;
`;

const SubTitle = styled.p`
  color: #6366f1;
  font-size: 1.08rem;
  margin-bottom: 24px;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 18px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  background: #f3f4f6;
  transition: border 0.2s;
  &:focus {
    border: 1.5px solid #6366f1;
    outline: none;
  }
`;

const SignUpButton = styled.button`
  background: linear-gradient(90deg, #6366f1 0%, #60a5fa 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 14px 0;
  width: 100%;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(99,102,241,0.08);
  transition: background 0.2s;
  &:hover {
    background: linear-gradient(90deg, #4f46e5 0%, #2563eb 100%);
  }
`;

const ErrorMsg = styled.div`
  color: #e11d48;
  margin-top: 8px;
  margin-bottom: 8px;
  font-size: 1rem;
  text-align: center;
`;

const StyledAnchor = styled.a`
  color: #6366f1;
  margin-top: 12px;
  display: block;
  text-align: center;
  cursor: pointer;
  text-decoration: underline;
  font-size: 1rem;
`;

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: ${props => props.theme.pageBackground};
`;

const AuthCard = styled.div`
  background: ${props => props.theme.cardBg};
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 24px ${props => props.theme.shadowColor};
  width: 100%;
  max-width: 420px;
  transition: all 0.3s ease;

  @media (max-width: 480px) {
    padding: 2rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${props => props.theme.text};
  font-weight: 500;
  font-size: 0.95rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  margin-top: 0.5rem;
  background: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover:not(:disabled) {
    background: ${props => props.theme.primaryHover};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${props => props.theme.disabledBg};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.error};
  background: ${props => props.theme.errorBg};
  padding: 0.875rem 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  font-size: 0.95rem;
`;

const SignInLink = styled.p`
  margin-top: 2rem;
  text-align: center;
  color: ${props => props.theme.text};
  font-size: 0.95rem;
`;

const NavigationLink = styled(NextLink)`
  color: ${props => props.theme.primary};
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;

  &:hover {
    text-decoration: underline;
  }
`;

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // First create user in Supabase
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message || 'Sign up failed');
      setLoading(false);
      return;
    }

    // Then sign in with NextAuth
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Failed to sign in after registration');
      setLoading(false);
    } else {
      router.push('/feed');
    }
  };

  return (
    <PageContainer>
      <AuthCard>
        <Title>Create Account</Title>
        <SubTitle>Sign up to join Future Social</SubTitle>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              required
            />
          </InputGroup>

          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </SubmitButton>

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Form>

        <SignInLink>
          Already have an account?{' '}
          <NavigationLink href="/auth/signin">Sign in</NavigationLink>
        </SignInLink>
      </AuthCard>
    </PageContainer>
  );
} 