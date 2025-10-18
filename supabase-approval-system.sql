-- ========================================
-- 회원 승인 시스템 SQL 스크립트
-- 기존 profiles 테이블에 승인 기능 추가
-- ========================================

-- 1. profiles 테이블에 승인 관련 필드 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS approval_requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS approval_processed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS approval_processed_by UUID REFERENCES auth.users(id);

-- 2. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS profiles_approval_status_idx ON public.profiles(approval_status);

-- 3. 기존 사용자들을 승인된 상태로 변경 (선택사항)
-- UPDATE public.profiles 
-- SET approval_status = 'approved', 
--     approval_requested_at = created_at,
--     approval_processed_at = created_at
-- WHERE approval_status = 'pending';

-- 4. 회원가입 시 자동으로 profile 생성하는 함수 (업데이트)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, approval_status, approval_requested_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'user',  -- 기본 역할
    'pending',  -- 기본값: 승인 대기
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, public.profiles.name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 기존 트리거 삭제 후 재생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. RLS 정책 업데이트: 승인된 사용자만 posts 작성 가능
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;
CREATE POLICY "Authenticated users can insert posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = author_id AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND approval_status = 'approved'
  )
);

-- 7. RLS 정책 업데이트: 승인된 사용자만 posts 수정 가능
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts"
ON public.posts FOR UPDATE
TO authenticated
USING (
  auth.uid() = author_id AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND approval_status = 'approved'
  )
);

-- 8. RLS 정책 업데이트: 승인된 사용자만 posts 삭제 가능
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts"
ON public.posts FOR DELETE
TO authenticated
USING (
  auth.uid() = author_id AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND approval_status = 'approved'
  )
);

-- 9. RLS 정책: 관리자는 모든 프로필 볼 수 있음
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 10. RLS 정책: 관리자는 모든 프로필 수정 가능
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ========================================
-- 초기 관리자 설정 (필수!)
-- ========================================
-- 첫 번째 사용자를 관리자로 만들려면:
-- 1. 회원가입 완료 후
-- 2. 아래 쿼리 실행 (your-admin-email@example.com을 실제 이메일로 변경)

-- UPDATE public.profiles
-- SET role = 'admin', approval_status = 'approved'
-- WHERE email = 'your-admin-email@example.com';

-- ========================================
-- 유용한 쿼리
-- ========================================

-- 모든 승인 대기 중인 사용자 조회
-- SELECT id, email, name, approval_requested_at
-- FROM public.profiles 
-- WHERE approval_status = 'pending'
-- ORDER BY approval_requested_at DESC;

-- 사용자 승인
-- UPDATE public.profiles
-- SET approval_status = 'approved',
--     approval_processed_at = NOW(),
--     approval_processed_by = auth.uid()
-- WHERE id = 'user-uuid-here';

-- 사용자 거부
-- UPDATE public.profiles
-- SET approval_status = 'rejected',
--     approval_processed_at = NOW(),
--     approval_processed_by = auth.uid()
-- WHERE id = 'user-uuid-here';

-- 관리자 추가
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'new-admin@example.com';

-- 통계 조회
-- SELECT 
--   approval_status,
--   COUNT(*) as count
-- FROM public.profiles
-- GROUP BY approval_status;
