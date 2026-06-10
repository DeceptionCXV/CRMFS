const MEMBER_ID_KEY = 'crmfs_workspace_member_id';
const MEMBER_VIEW_KEY = 'crmfs_workspace_member_view';
const DECEASED_MEMBER_ID_KEY = 'crmfs_workspace_deceased_member_id';
const DECEASED_VIEW_KEY = 'crmfs_workspace_deceased_view';
const RECORD_DEATH_MEMBER_ID_KEY = 'crmfs_workspace_record_death_member_id';
const DRAFT_REF_KEY = 'crmfs_workspace_draft_ref';

export type MemberViewOptions = {
  tab?: string;
  edit?: boolean;
  action?: 'pause' | 'delete';
};

export type DeceasedViewOptions = {
  edit?: boolean;
};

export function setActiveMemberId(id: string) {
  sessionStorage.setItem(MEMBER_ID_KEY, id);
}

export function getActiveMemberId(): string | null {
  return sessionStorage.getItem(MEMBER_ID_KEY);
}

export function clearActiveMemberId() {
  sessionStorage.removeItem(MEMBER_ID_KEY);
}

export function setMemberViewOptions(options: MemberViewOptions) {
  sessionStorage.setItem(MEMBER_VIEW_KEY, JSON.stringify(options));
}

export function consumeMemberViewOptions(): MemberViewOptions {
  const raw = sessionStorage.getItem(MEMBER_VIEW_KEY);
  sessionStorage.removeItem(MEMBER_VIEW_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as MemberViewOptions;
  } catch {
    return {};
  }
}

export function setActiveDeceasedMemberId(id: string) {
  sessionStorage.setItem(DECEASED_MEMBER_ID_KEY, id);
}

export function getActiveDeceasedMemberId(): string | null {
  return sessionStorage.getItem(DECEASED_MEMBER_ID_KEY);
}

export function clearActiveDeceasedMemberId() {
  sessionStorage.removeItem(DECEASED_MEMBER_ID_KEY);
}

export function setDeceasedViewOptions(options: DeceasedViewOptions) {
  sessionStorage.setItem(DECEASED_VIEW_KEY, JSON.stringify(options));
}

export function consumeDeceasedViewOptions(): DeceasedViewOptions {
  const raw = sessionStorage.getItem(DECEASED_VIEW_KEY);
  sessionStorage.removeItem(DECEASED_VIEW_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as DeceasedViewOptions;
  } catch {
    return {};
  }
}

export function setRecordDeathMemberId(id: string) {
  sessionStorage.setItem(RECORD_DEATH_MEMBER_ID_KEY, id);
}

export function getRecordDeathMemberId(): string | null {
  return sessionStorage.getItem(RECORD_DEATH_MEMBER_ID_KEY);
}

export function clearRecordDeathMemberId() {
  sessionStorage.removeItem(RECORD_DEATH_MEMBER_ID_KEY);
}

export function setAddMemberDraftRef(ref: string) {
  sessionStorage.setItem(DRAFT_REF_KEY, ref);
}

export function getAddMemberDraftRef(): string | null {
  return sessionStorage.getItem(DRAFT_REF_KEY);
}

export function clearAddMemberDraftRef() {
  sessionStorage.removeItem(DRAFT_REF_KEY);
}
