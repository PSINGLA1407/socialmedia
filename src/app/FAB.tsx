"use client";
import styled from 'styled-components';
import { FaPlus } from 'react-icons/fa';

const FabButton = styled.button`
  position: fixed;
  right: 24px;
  bottom: 88px;
  z-index: 200;
  background: linear-gradient(90deg, #6366f1 0%, #60a5fa 100%);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 4px 24px rgba(99,102,241,0.18);
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  &:hover {
    background: linear-gradient(90deg, #4f46e5 0%, #2563eb 100%);
    transform: scale(1.08);
  }
`;

export default function FAB() {
  return (
    <FabButton aria-label="Create Post">
      <FaPlus />
    </FabButton>
  );
} 