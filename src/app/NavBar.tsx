"use client";
import styled from 'styled-components';
import { FaHome, FaPlusSquare, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from '../components/ThemeToggle';

interface NavButtonProps {
  $active?: boolean;
}

const NavBar = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  min-height: 64px;
  background: ${props => props.theme.cardBg};
  border-top: 1px solid ${props => props.theme.border};
  box-shadow: 0 -2px 16px ${props => props.theme.shadowColor};
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem 0;
  z-index: 100;
`;

const NavButtonContainer = styled.div<NavButtonProps>`
  background: none;
  border: none;
  color: ${props => props.$active ? props.theme.primary : props.theme.text};
  font-size: 1.75rem;
  padding: 0.5rem;
  margin: 0 0.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 48px;
  border-radius: 12px;

  &:hover, &:focus {
    color: ${props => props.theme.primary};
    background: ${props => props.theme.inputBg};
  }
`;

const ThemeToggleContainer = styled.div`
  margin: 0 0.5rem;
`;

export default function StyledNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <NavBar>
      <Link href="/feed">
        <NavButtonContainer $active={pathname === '/feed'}>
          <FaHome />
        </NavButtonContainer>
      </Link>
      <Link href="/create">
        <NavButtonContainer $active={pathname === '/create'}>
          <FaPlusSquare />
        </NavButtonContainer>
      </Link>
      <Link href="/profile">
        <NavButtonContainer $active={pathname === '/profile'}>
          <FaUserCircle />
        </NavButtonContainer>
      </Link>
      {session ? (
        <NavButtonContainer as="button" onClick={() => signOut()}>
          <FaSignOutAlt />
        </NavButtonContainer>
      ) : (
        <Link href="/auth/signin">
          <NavButtonContainer>
            <FaSignOutAlt />
          </NavButtonContainer>
        </Link>
      )}
      <ThemeToggleContainer>
        <ThemeToggle />
      </ThemeToggleContainer>
    </NavBar>
  );
} 