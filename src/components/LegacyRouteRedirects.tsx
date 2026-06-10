import { Navigate } from 'react-router-dom';

/** Old bookmarked member URLs must not expose or restore IDs from the path. */
export function LegacyMemberDetailRedirect() {
  return <Navigate to="/members" replace />;
}

export function LegacyDeceasedDetailRedirect() {
  return <Navigate to="/deceased" replace />;
}

export function LegacyRecordDeathRedirect() {
  return <Navigate to="/deceased/record" replace />;
}
