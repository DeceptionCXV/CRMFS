/*
  Enforce membership status transitions at the database layer.
  - Adds 'paused' to members.status CHECK
  - Blocks changes from deceased
  - Blocks transition to active unless documents + payments satisfy rules
*/

-- Allow paused status
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_status_check;
ALTER TABLE members ADD CONSTRAINT members_status_check
  CHECK (status IN ('active', 'pending', 'inactive', 'paused', 'deceased'));

CREATE OR REPLACE FUNCTION public.member_has_required_documents(p_member_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m RECORD;
  child_missing integer;
BEGIN
  SELECT
    app_type,
    main_photo_id_url,
    main_proof_address_url,
    joint_photo_id_url,
    joint_proof_address_url
  INTO m
  FROM members
  WHERE id = p_member_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF m.main_photo_id_url IS NULL OR trim(m.main_photo_id_url) = '' THEN
    RETURN false;
  END IF;

  IF m.main_proof_address_url IS NULL OR trim(m.main_proof_address_url) = '' THEN
    RETURN false;
  END IF;

  IF m.app_type = 'joint' THEN
    IF m.joint_photo_id_url IS NULL OR trim(m.joint_photo_id_url) = '' THEN
      RETURN false;
    END IF;
    IF m.joint_proof_address_url IS NULL OR trim(m.joint_proof_address_url) = '' THEN
      RETURN false;
    END IF;
  END IF;

  SELECT count(*)::integer
  INTO child_missing
  FROM children c
  WHERE c.member_id = p_member_id
    AND (c.birth_certificate_url IS NULL OR trim(c.birth_certificate_url) = '');

  IF child_missing > 0 THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.member_payment_activation_ok(p_member_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH totals AS (
    SELECT
      coalesce(sum(
        CASE WHEN payment_type IS DISTINCT FROM 'receipt' THEN coalesce(total_amount, 0) ELSE 0 END
      ), 0) AS total_due,
      coalesce(sum(
        CASE WHEN payment_type = 'receipt' THEN coalesce(total_amount, 0) ELSE 0 END
      ), 0) AS total_paid
    FROM payments
    WHERE member_id = p_member_id
  )
  SELECT total_paid > 0 AND greatest(total_due - total_paid, 0) = 0
  FROM totals;
$$;

CREATE OR REPLACE FUNCTION public.enforce_member_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'deceased' THEN
    RAISE EXCEPTION 'Cannot change status of a deceased member';
  END IF;

  IF NEW.status = 'active' AND OLD.status IS DISTINCT FROM 'active' THEN
    IF NOT public.member_has_required_documents(NEW.id) THEN
      RAISE EXCEPTION 'Cannot set member to active: required documents are missing';
    END IF;

    IF NOT public.member_payment_activation_ok(NEW.id) THEN
      RAISE EXCEPTION 'Cannot set member to active: payment requirements not met';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_member_status ON members;
CREATE TRIGGER trg_enforce_member_status
  BEFORE UPDATE OF status ON members
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_member_status_transition();
