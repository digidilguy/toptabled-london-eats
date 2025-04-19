
import { useState, useEffect } from 'react';

export const useMockUserVotes = (userId: string | undefined) => {
  const [mockUserVotes, setMockUserVotes] = useState<Record<string, 'up' | 'down'>>({});

  const isMockUser = (userId: string | undefined): boolean => {
    if (!userId) return false;
    return ['1', '2', '3', '4', '5'].includes(userId);
  };

  useEffect(() => {
    if (isMockUser(userId)) {
      const savedVotes = localStorage.getItem(`mockUserVotes_${userId}`);
      if (savedVotes) {
        try {
          const parsedVotes = JSON.parse(savedVotes);
          const validVotes: Record<string, 'up' | 'down'> = {};
          Object.entries(parsedVotes).forEach(([key, value]) => {
            if (value === 'up' || value === 'down') {
              validVotes[key] = value as 'up' | 'down';
            }
          });
          setMockUserVotes(validVotes);
        } catch (error) {
          console.error('Error parsing saved votes:', error);
        }
      }
    }
  }, [userId]);

  useEffect(() => {
    if (isMockUser(userId) && Object.keys(mockUserVotes).length > 0) {
      localStorage.setItem(`mockUserVotes_${userId}`, JSON.stringify(mockUserVotes));
    }
  }, [mockUserVotes, userId]);

  return {
    mockUserVotes,
    setMockUserVotes,
    isMockUser
  };
};
