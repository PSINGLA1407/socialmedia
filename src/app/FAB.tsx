"use client";
import styled from 'styled-components';
import { FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const FabButton = styled.button`
  position: fixed;
  right: 24px;
  bottom: 88px;
  z-index: 200;
  background: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 4px 24px ${props => props.theme.shadowColor};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.primaryHover};
    transform: scale(1.08);
    box-shadow: 0 8px 32px ${props => props.theme.shadowColor};
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    right: 16px;
    bottom: 80px;
    width: 52px;
    height: 52px;
    font-size: 1.75rem;
  }
`;

export default function FAB() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleClick = () => {
    if (session) {
      router.push('/create');
    } else {
      router.push('/auth/signin?callbackUrl=/create');
    }
  };

  return (
    <FabButton 
      onClick={handleClick}
      aria-label="Create Post"
    >
      <FaPlus />
    </FabButton>
  );
} 