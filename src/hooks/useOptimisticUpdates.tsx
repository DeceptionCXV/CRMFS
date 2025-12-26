// ============================================
// OPTIMISTIC UPDATES
// Instant UI feedback before server confirms
// ============================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// ============================================
// EXAMPLE 1: Optimistic Member Status Update
// ============================================

export function useMemberStatusUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, newStatus }: { memberId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('members')
        .update({ member_status: newStatus })
        .eq('id', memberId);

      if (error) throw error;
    },

    // BEFORE the server responds:
    onMutate: async ({ memberId, newStatus }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['members'] });
      await queryClient.cancelQueries({ queryKey: ['member-detail', memberId] });

      // Get current data
      const previousMembers = queryClient.getQueryData(['members']);
      const previousMember = queryClient.getQueryData(['member-detail', memberId]);

      // Optimistically update members list
      queryClient.setQueryData(['members'], (old: any) => {
        if (!old) return old;
        return old.map((m: any) =>
          m.id === memberId ? { ...m, member_status: newStatus } : m
        );
      });

      // Optimistically update member detail
      queryClient.setQueryData(['member-detail', memberId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          member: { ...old.member, member_status: newStatus },
        };
      });

      // Return context for rollback
      return { previousMembers, previousMember };
    },

    // If mutation fails, rollback:
    onError: (err, variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(['members'], context.previousMembers);
      }
      if (context?.previousMember) {
        queryClient.setQueryData(
          ['member-detail', variables.memberId],
          context.previousMember
        );
      }
    },

    // After success, refetch to be sure:
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['member-detail', variables.memberId] });
    },
  });
}

// Usage in component:
function MemberCard({ member }: { member: any }) {
  const updateStatus = useMemberStatusUpdate();

  const handlePause = () => {
    updateStatus.mutate({
      memberId: member.id,
      newStatus: 'paused',
    });
    // UI updates INSTANTLY! No waiting for server!
  };

  return (
    <button onClick={handlePause}>
      Pause Membership
    </button>
  );
}

// ============================================
// EXAMPLE 2: Optimistic Payment Addition
// ============================================

export function useAddPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: any) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    onMutate: async (newPayment) => {
      await queryClient.cancelQueries({ queryKey: ['payments'] });

      const previousPayments = queryClient.getQueryData(['payments']);

      // Add optimistic payment with temporary ID
      const optimisticPayment = {
        ...newPayment,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(['payments'], (old: any) => {
        return old ? [optimisticPayment, ...old] : [optimisticPayment];
      });

      return { previousPayments };
    },

    onError: (err, variables, context) => {
      if (context?.previousPayments) {
        queryClient.setQueryData(['payments'], context.previousPayments);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

// ============================================
// EXAMPLE 3: Optimistic Delete
// ============================================

export function useDeleteMember() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
    },

    onMutate: async (memberId) => {
      await queryClient.cancelQueries({ queryKey: ['members'] });

      const previousMembers = queryClient.getQueryData(['members']);

      // Remove from list immediately
      queryClient.setQueryData(['members'], (old: any) => {
        return old ? old.filter((m: any) => m.id !== memberId) : old;
      });

      // Navigate away immediately (feels instant!)
      navigate('/members');

      return { previousMembers };
    },

    onError: (err, variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(['members'], context.previousMembers);
        // Navigate back
        navigate(`/members/${variables}`);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

// ============================================
// EXAMPLE 4: Optimistic Like/Favorite
// (For future features like "starred members")
// ============================================

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, isFavorite }: any) => {
      const { error } = await supabase
        .from('members')
        .update({ is_favorite: !isFavorite })
        .eq('id', memberId);

      if (error) throw error;
    },

    onMutate: async ({ memberId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ['members'] });

      const previousMembers = queryClient.getQueryData(['members']);

      queryClient.setQueryData(['members'], (old: any) => {
        return old
          ? old.map((m: any) =>
              m.id === memberId ? { ...m, is_favorite: !isFavorite } : m
            )
          : old;
      });

      return { previousMembers };
    },

    onError: (err, variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(['members'], context.previousMembers);
      }
    },
  });
}

// ============================================
// PRO TIPS FOR OPTIMISTIC UPDATES
// ============================================

/*
1. Always cancel outgoing queries first (prevent race conditions)
2. Save previous state for rollback
3. Update all related queries (list + detail)
4. Show loading indicators on buttons (but UI updates instantly)
5. Use toast notifications for success/error
6. Invalidate queries after success to sync with server

WHEN TO USE:
✅ Status changes (pause, activate, archive)
✅ Simple updates (name, email, phone)
✅ Toggles (favorite, starred, hidden)
✅ Deletes (remove from list)
✅ Quick additions (add note, tag)

WHEN NOT TO USE:
❌ Complex forms with validation
❌ File uploads
❌ Critical financial transactions
❌ Multi-step processes
*/

// ============================================
// AGGRESSIVE CACHING CONFIG
// ============================================

// Update your QueryClient config in App.tsx:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes (good!)
      cacheTime: 30 * 60 * 1000, // 30 minutes (aggressive!)
      
      // NEW aggressive settings:
      refetchOnMount: false, // Don't refetch if data exists
      refetchOnReconnect: false, // Don't refetch on reconnect
    },
  },
});

// For specific queries that change rarely, be even more aggressive:
const { data } = useQuery({
  queryKey: ['fee-structure'],
  queryFn: fetchFeeStructure,
  staleTime: Infinity, // Never consider stale!
  cacheTime: Infinity, // Keep in cache forever!
});

// For real-time data, be more conservative:
const { data } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: fetchStats,
  staleTime: 30 * 1000, // 30 seconds
  refetchInterval: 60 * 1000, // Auto-refetch every minute
});