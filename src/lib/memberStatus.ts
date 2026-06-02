import { supabase } from './supabase';
import {
  getMemberActivationEligibility,
  type AppType,
  type MemberPaymentRow,
} from './memberActivationRequirements';
import type { PaymentLike } from './paymentDisplay';

export type MemberStatus =
  | 'pending'
  | 'active'
  | 'inactive'
  | 'paused'
  | 'deceased';

export const MEMBER_STATUSES: MemberStatus[] = [
  'pending',
  'active',
  'inactive',
  'paused',
  'deceased',
];

export class MemberStatusError extends Error {
  readonly blockers: string[];

  constructor(message: string, blockers: string[] = []) {
    super(message);
    this.name = 'MemberStatusError';
    this.blockers = blockers;
  }
}

export interface MemberStatusContext {
  member: {
    id: string;
    status: string;
    app_type?: string;
    main_photo_id_url?: string | null;
    main_proof_address_url?: string | null;
    joint_photo_id_url?: string | null;
    joint_proof_address_url?: string | null;
    late_warnings_count?: number | null;
    paused_date?: string | null;
    paused_reason?: string | null;
  };
  children: Array<{
    first_name?: string;
    last_name?: string;
    birth_certificate_url?: string | null;
  }>;
  payments: MemberPaymentRow[];
}

export interface StatusTransitionResult {
  allowed: boolean;
  blockers: string[];
}

/** Load member + children + payments for status validation. */
export async function fetchMemberStatusContext(
  memberId: string
): Promise<MemberStatusContext | null> {
  const [
    { data: member, error: memberError },
    { data: children },
    { data: payments },
  ] = await Promise.all([
    supabase
      .from('members')
      .select(
        'id, status, app_type, main_photo_id_url, main_proof_address_url, joint_photo_id_url, joint_proof_address_url, late_warnings_count, paused_date, paused_reason'
      )
      .eq('id', memberId)
      .maybeSingle(),
    supabase
      .from('children')
      .select('first_name, last_name, birth_certificate_url')
      .eq('member_id', memberId),
    supabase
      .from('payments')
      .select(
        'id, payment_type, payment_status, total_amount, payment_date, created_at'
      )
      .eq('member_id', memberId),
  ]);

  if (memberError) throw memberError;
  if (!member) return null;

  return {
    member,
    children: children || [],
    payments: (payments || []) as PaymentLike[],
  };
}

function normalizeStatus(status: string | undefined | null): MemberStatus | null {
  if (!status) return null;
  if (MEMBER_STATUSES.includes(status as MemberStatus)) {
    return status as MemberStatus;
  }
  return null;
}

/** Pure validation — use before UI actions or DB writes. */
export function validateMemberStatusTransition(
  from: string,
  to: MemberStatus,
  context: MemberStatusContext,
  options: { system?: boolean } = {}
): StatusTransitionResult {
  const fromStatus = normalizeStatus(from);

  if (!fromStatus) {
    return { allowed: false, blockers: [`Unknown current status: ${from}`] };
  }

  if (fromStatus === to) {
    return { allowed: true, blockers: [] };
  }

  if (fromStatus === 'deceased') {
    return {
      allowed: false,
      blockers: ['Deceased members cannot have their status changed.'],
    };
  }

  if (to === 'deceased') {
    return { allowed: true, blockers: [] };
  }

  if (to === 'active') {
    const eligibility = getMemberActivationEligibility(
      {
        app_type: (context.member.app_type as AppType) || 'single',
        main_photo_id_url: context.member.main_photo_id_url,
        main_proof_address_url: context.member.main_proof_address_url,
        joint_photo_id_url: context.member.joint_photo_id_url,
        joint_proof_address_url: context.member.joint_proof_address_url,
      },
      context.children,
      context.payments
    );
    if (!eligibility.canActivate) {
      return { allowed: false, blockers: eligibility.blockers };
    }
    if (!['pending', 'inactive', 'paused'].includes(fromStatus)) {
      return {
        allowed: false,
        blockers: [
          `Cannot activate membership from status "${fromStatus}".`,
        ],
      };
    }
    return { allowed: true, blockers: [] };
  }

  if (to === 'pending') {
    if (fromStatus === 'active' && options.system) {
      return { allowed: true, blockers: [] };
    }
    if (fromStatus === 'active' && !options.system) {
      return {
        allowed: false,
        blockers: [
          'Use Pause to suspend an active member, or upload missing documents (system will set Pending when required docs are missing).',
        ],
      };
    }
    if (['pending', 'inactive', 'paused'].includes(fromStatus)) {
      return { allowed: true, blockers: [] };
    }
    return {
      allowed: false,
      blockers: [`Cannot set status to Pending from "${fromStatus}".`],
    };
  }

  if (to === 'paused') {
    if (['active', 'pending', 'inactive'].includes(fromStatus)) {
      return { allowed: true, blockers: [] };
    }
    return {
      allowed: false,
      blockers: [`Cannot pause membership from status "${fromStatus}".`],
    };
  }

  if (to === 'inactive') {
    if (fromStatus === 'active') {
      return { allowed: true, blockers: [] };
    }
    return {
      allowed: false,
      blockers: [
        `Cannot set status to Inactive from "${fromStatus}". Use Pause or Pending as appropriate.`,
      ],
    };
  }

  return { allowed: false, blockers: [`Unsupported status transition to "${to}".`] };
}

export interface UpdateMemberStatusOptions {
  changeReason?: string;
  /** Automated enforcement (overdue pause, missing documents). */
  system?: boolean;
  pausedReason?: string;
  /** Additional member columns to merge (e.g. late_warnings_count on unpause). */
  patch?: Record<string, unknown>;
}

/**
 * Single app entry point for changing members.status.
 * Throws MemberStatusError when the transition is not allowed.
 */
export async function updateMemberStatus(
  memberId: string,
  newStatus: MemberStatus,
  options: UpdateMemberStatusOptions = {}
): Promise<void> {
  const context = await fetchMemberStatusContext(memberId);
  if (!context) {
    throw new MemberStatusError('Member not found.');
  }

  const validation = validateMemberStatusTransition(
    context.member.status,
    newStatus,
    context,
    { system: options.system }
  );

  if (!validation.allowed) {
    throw new MemberStatusError(
      validation.blockers[0] || 'Status change not allowed.',
      validation.blockers
    );
  }

  const updatePayload: Record<string, unknown> = {
    status: newStatus,
    ...(options.patch || {}),
  };

  if (newStatus === 'paused') {
    updatePayload.paused_date = new Date().toISOString();
    updatePayload.paused_reason =
      options.pausedReason ||
      (options.system ? 'System: membership paused' : 'Membership paused');
  }

  if (newStatus === 'active') {
    updatePayload.paused_date = null;
    updatePayload.paused_reason = null;
  }

  const { error } = await supabase
    .from('members')
    .update(updatePayload)
    .eq('id', memberId);

  if (error) {
    throw new MemberStatusError(
      error.message || 'Failed to update member status.'
    );
  }
}

/** Convenience for activation checks without changing status. */
export function getActivationBlockersForMember(
  context: MemberStatusContext
): string[] {
  return getMemberActivationEligibility(
    {
      app_type: (context.member.app_type as AppType) || 'single',
      main_photo_id_url: context.member.main_photo_id_url,
      main_proof_address_url: context.member.main_proof_address_url,
      joint_photo_id_url: context.member.joint_photo_id_url,
      joint_proof_address_url: context.member.joint_proof_address_url,
    },
    context.children,
    context.payments
  ).blockers;
}
