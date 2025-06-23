"use client";
import styled from 'styled-components';
import { FaHome, FaPlusSquare, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavButtonProps {
  $active?: boolean;
}

const NavBar = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  min-height: 64px;
  background: #fff;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.06);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem 0;
  z-index: 100;
  @media (min-width: 700px) {
    top: 0;
    bottom: unset;
    box-shadow: 0 2px 16px rgba(0,0,0,0.06);
  }
`;

const NavButtonContainer = styled.div<NavButtonProps>`
  background: none;
  border: none;
  color: ${props => props.$active ? '#4f46e5' : '#6366f1'};
  font-size: 2rem;
  padding: 0.5rem 1.2rem;
  margin: 0 0.2rem;
  cursor: pointer;
  transition: color 0.2s;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 48px;
  border-radius: 50%;
  &:hover, &:focus {
    color: #4f46e5;
    background: #f3f4f6;
  }
`;

export default function StyledNav() {
  const pathname = usePathname();

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
      <Link href="/auth/signin">
        <NavButtonContainer>
          <FaSignOutAlt />
        </NavButtonContainer>
      </Link>
    </NavBar>
  );
} 