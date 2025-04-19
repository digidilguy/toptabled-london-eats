
import { Restaurant } from '@/types/restaurant';
import { supabase } from '@/integrations/supabase/client';

export function isValidUUID(id: string | undefined): boolean {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export const handleMockVote = async (
  restaurantId: string,
  voteType: 'up' | 'down',
  currentVotes: Record<string, 'up' | 'down'>,
  setMockUserVotes: (votes: Record<string, 'up' | 'down'>) => void
) => {
  const currentVote = currentVotes[restaurantId];

  if (currentVote === voteType) {
    const newVotes = { ...currentVotes };
    delete newVotes[restaurantId];
    setMockUserVotes(newVotes);
    return { action: 'removed', type: voteType };
  }

  setMockUserVotes({
    ...currentVotes,
    [restaurantId]: voteType
  });

  return { action: 'voted', type: voteType };
};

export const handleDatabaseVote = async (
  userId: string,
  restaurantId: string,
  voteType: 'up' | 'down',
  currentVote: 'up' | 'down' | undefined
) => {
  if (!isValidUUID(userId)) {
    throw new Error('Your user ID is not a valid UUID');
  }

  // If the user is removing their vote (clicking the same type they already voted)
  if (currentVote === voteType) {
    const { error: deleteError } = await supabase
      .from('restaurant_votes')
      .delete()
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId);

    if (deleteError) throw deleteError;
    return { action: 'removed', type: voteType };
  }

  // First, ensure any existing vote is removed to prevent constraint violation
  if (currentVote) {
    const { error: deleteError } = await supabase
      .from('restaurant_votes')
      .delete()
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId);

    if (deleteError) throw deleteError;
  }

  // Now insert the new vote
  const { error: voteError } = await supabase
    .from('restaurant_votes')
    .insert({
      user_id: userId,
      restaurant_id: restaurantId,
      vote_type: voteType
    });

  if (voteError) throw voteError;
  return { action: 'voted', type: voteType };
};
