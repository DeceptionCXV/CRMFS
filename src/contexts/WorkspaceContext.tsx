import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  setActiveMemberId,
  setMemberViewOptions,
  setActiveDeceasedMemberId,
  setDeceasedViewOptions,
  setRecordDeathMemberId,
  setAddMemberDraftRef,
  type MemberViewOptions,
  type DeceasedViewOptions,
} from '../lib/workspaceStorage';

type WorkspaceContextValue = {
  openMember: (memberId: string, options?: MemberViewOptions) => void;
  openDeceased: (memberId: string, options?: DeceasedViewOptions) => void;
  openRecordDeath: (memberId?: string) => void;
  openAddMemberWithDraft: (applicationReference: string) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const openMember = useCallback(
    (memberId: string, options?: MemberViewOptions) => {
      setActiveMemberId(memberId);
      if (options && Object.keys(options).length > 0) {
        setMemberViewOptions(options);
      }
      navigate('/members/detail');
    },
    [navigate]
  );

  const openDeceased = useCallback(
    (memberId: string, options?: DeceasedViewOptions) => {
      setActiveDeceasedMemberId(memberId);
      if (options?.edit) {
        setDeceasedViewOptions(options);
      }
      navigate('/deceased/detail');
    },
    [navigate]
  );

  const openRecordDeath = useCallback(
    (memberId?: string) => {
      if (memberId) {
        setRecordDeathMemberId(memberId);
      }
      navigate('/deceased/record');
    },
    [navigate]
  );

  const openAddMemberWithDraft = useCallback(
    (applicationReference: string) => {
      setAddMemberDraftRef(applicationReference);
      navigate('/members/new');
    },
    [navigate]
  );

  return (
    <WorkspaceContext.Provider
      value={{ openMember, openDeceased, openRecordDeath, openAddMemberWithDraft }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return ctx;
}
