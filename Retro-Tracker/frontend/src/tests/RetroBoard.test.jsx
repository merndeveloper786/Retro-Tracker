import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RetroBoard from '../pages/RetroBoard.jsx';

// Mock the API and contexts
vi.mock('../utils/api.js', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: {
        retro: {
          _id: '1',
          name: 'Test Retro',
          sprintNumber: '23',
        },
        board: {
          'Went Well': [
            {
              _id: '1',
              content: 'Great sprint!',
              column: 'Went Well',
              author: { _id: 'user1', name: 'Test User' },
              createdAt: new Date(),
              isDeleted: false,
            },
          ],
          'Needs Improvement': [],
          'Kudos': [],
        },
      },
    })),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: { id: 'user1', name: 'Test User' },
  }),
}));

vi.mock('../context/TeamContext.jsx', () => ({
  useTeam: () => ({
    selectedTeam: { _id: 'team1', name: 'Test Team' },
  }),
}));

describe('RetroBoard', () => {
  it('renders retro board with columns', () => {
    render(
      <BrowserRouter>
        <RetroBoard />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Retro')).toBeInTheDocument();
    expect(screen.getByText('Went Well')).toBeInTheDocument();
    expect(screen.getByText('Needs Improvement')).toBeInTheDocument();
    expect(screen.getByText('Kudos')).toBeInTheDocument();
  });

  it('displays cards in the correct columns', () => {
    render(
      <BrowserRouter>
        <RetroBoard />
      </BrowserRouter>
    );

    expect(screen.getByText('Great sprint!')).toBeInTheDocument();
  });
});

