'use client';

import React from 'react';
import styled from 'styled-components';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../lib/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <ToggleButton onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
    </ToggleButton>
  );
}

const ToggleButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: ${props => props.theme.inputBg};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.theme.primary};
  }
`; 