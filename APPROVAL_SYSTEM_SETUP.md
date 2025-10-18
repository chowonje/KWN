# 🔐 회원 승인 시스템 설정 가이드

관리자 승인 기반 회원가입 시스템을 설정하는 방법입니다.

---

## 📋 목차

1. [Supabase 데이터베이스 설정](#1-supabase-데이터베이스-설정)
2. [Supabase 이메일 인증 설정](#2-supabase-이메일-인증-설정)
3. [첫 번째 관리자 계정 생성](#3-첫-번째-관리자-계정-생성)
4. [관리자 페이지 접속](#4-관리자-페이지-접속)
5. [작동 흐름](#5-작동-흐름)
6. [문제 해결](#6-문제-해결)

---

## 1. Supabase 데이터베이스 설정

### Step 1: SQL 스크립트 실행

1. **Supabase Dashboard 접속**
   ```
   https://supabase.com/dashboard
   ```

2. **KWN 프로젝트 선택**

3. **SQL Editor로 이동**
   - 왼쪽 메뉴 → "SQL Editor"

4. **New Query 클릭**

5. **SQL 스크립트 실행**
   - 프로젝트 루트의 `supabase-approval-system.sql` 파일 내용을 복사
   - SQL Editor에 붙여넣기
   - **"Run"** 버튼 클릭

6. **실행 결과 확인**
   - 오류 없이 완료되면 성공!

---

## 2. Supabase 이메일 인증 설정

### Option A: 이메일 인증 활성화 (권장)

**장점**: 봇 가입 방지, 이메일 소유권 확인

**설정 방법**:
1. Supabase Dashboard → Authentication → Providers
2. **Email** 클릭
3. **"Enable email confirmation"** ✅ 체크
4. **Save** 클릭

**작동 방식**:
```
회원가입 → 인증 이메일 전송 → 사용자가 이메일 클릭 → 승인 대기 → 관리자 승인 → 로그인 가능
```

---

### Option B: 이메일 인증 비활성화 (빠른 테스트용)

**주의**: 프로덕션 환경에서는 권장하지 않음

**설정 방법**:
1. Supabase Dashboard → Authentication → Providers
2. **Email** 클릭
3. **"Enable email confirmation"** ❌ 체크 해제
4. **Save** 클릭

**작동 방식**:
```
회원가입 → 즉시 승인 대기 → 관리자 승인 → 로그인 가능
```

---

## 3. 첫 번째 관리자 계정 생성

### Step 1: 회원가입
1. 웹사이트 접속
2. **회원가입** 클릭
3. 정보 입력 후 가입

### Step 2: 이메일 인증 (활성화한 경우)
1. 이메일 확인
2. 인증 링크 클릭

### Step 3: 관리자로 설정
1. **Supabase Dashboard** → SQL Editor
2. 다음 쿼리 실행:

```sql
-- 이메일을 본인 이메일로 변경!
UPDATE public.profiles
SET role = 'admin', approval_status = 'approved'
WHERE email = 'your-email@example.com';
```

3. **Run** 클릭

### Step 4: 확인
```sql
SELECT email, role, approval_status
FROM public.profiles
WHERE email = 'your-email@example.com';
```

**결과**:
```
email                    | role  | approval_status
------------------------|-------|----------------
your-email@example.com  | admin | approved
```

---

## 4. 관리자 페이지 접속

### URL
```
https://your-site.vercel.app/admin/users
```

### 기능
- ✅ 전체 사용자 목록 조회
- ✅ 승인 대기/승인됨/거부됨 필터링
- ✅ 사용자 승인/거부
- ✅ 실시간 통계

### 화면 구성
```
┌─────────────────────────────────┐
│ 🔐 사용자 관리                   │
├─────────────────────────────────┤
│ [전체: 10] [대기: 3] [승인: 6] [거부: 1] │
├─────────────────────────────────┤
│ [전체] [대기 중] [승인됨] [거부됨]    │
├─────────────────────────────────┤
│ 이메일 | 이름 | 상태 | 요청일 | 작업 │
│ user@   | 김철수 | ⏳대기 | 2025... | [✓승인][×거부] │
│ ...                              │
└─────────────────────────────────┘
```

---

## 5. 작동 흐름

### 🔄 전체 프로세스

```
1. 사용자 회원가입
   ↓
2. (옵션) 이메일 인증
   ↓
3. profiles 테이블에 자동 생성
   - approval_status = 'pending'
   - approval_requested_at = NOW()
   ↓
4. 로그인 시도 → ⏳ "승인 대기 중" 메시지
   ↓
5. 관리자가 /admin/users 접속
   ↓
6. 승인 또는 거부 결정
   ↓
7. 승인된 경우
   - 사용자 로그인 가능
   - 글 작성/수정/삭제 가능
   ↓
8. 거부된 경우
   - 로그인 불가
   - "거부됨" 메시지 표시
```

---

## 6. 문제 해결

### ❓ "프로필 조회 오류" 메시지가 나와요
**원인**: profiles 테이블이 없거나 RLS 정책 문제  
**해결**:
1. SQL 스크립트 다시 실행
2. RLS 정책 확인:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

---

### ❓ 관리자 페이지에 접근할 수 없어요
**원인**: role이 'admin'이 아님  
**해결**:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

### ❓ 회원가입 후 자동으로 profiles가 생성되지 않아요
**원인**: 트리거가 작동하지 않음  
**해결**:
1. 트리거 확인:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

2. 트리거 재생성:
```sql
-- SQL 스크립트의 4-5번 부분 재실행
```

---

### ❓ 승인했는데도 로그인이 안 돼요
**해결**:
1. approval_status 확인:
```sql
SELECT email, approval_status
FROM public.profiles
WHERE email = 'user-email@example.com';
```

2. 'approved'가 아니면 수동 승인:
```sql
UPDATE public.profiles
SET approval_status = 'approved'
WHERE email = 'user-email@example.com';
```

---

### ❓ 이메일 인증 메일이 안 와요
**해결**:
1. Supabase Dashboard → Authentication → Email Templates
2. SMTP 설정 확인
3. 스팸 메일함 확인

**임시 해결** (테스트용):
```sql
-- 이메일 인증 건너뛰기
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user-email@example.com';
```

---

## 📊 유용한 SQL 쿼리

### 모든 승인 대기 중인 사용자
```sql
SELECT email, name, approval_requested_at
FROM public.profiles
WHERE approval_status = 'pending'
ORDER BY approval_requested_at DESC;
```

### 통계 조회
```sql
SELECT 
  approval_status,
  COUNT(*) as count
FROM public.profiles
GROUP BY approval_status;
```

### 관리자 목록
```sql
SELECT email, name, role
FROM public.profiles
WHERE role = 'admin';
```

### 사용자 일괄 승인 (주의!)
```sql
UPDATE public.profiles
SET approval_status = 'approved',
    approval_processed_at = NOW()
WHERE approval_status = 'pending';
```

---

## 🎯 체크리스트

배포 전 확인사항:

- [ ] SQL 스크립트 실행 완료
- [ ] 이메일 인증 설정 완료
- [ ] 첫 번째 관리자 계정 생성
- [ ] 관리자 페이지 접속 확인
- [ ] 테스트 계정으로 회원가입 테스트
- [ ] 승인/거부 기능 테스트
- [ ] 승인된 계정 로그인 테스트
- [ ] 거부된 계정 로그인 차단 확인

---

## 📚 추가 설정

### 이메일 템플릿 커스터마이징
Supabase Dashboard → Authentication → Email Templates에서:
- 회원가입 확인 메일
- 비밀번호 재설정 메일
- 이메일 변경 확인 메일

을 원하는 대로 수정할 수 있습니다.

---

## 🆘 도움이 필요하면?

1. Supabase 문서: https://supabase.com/docs
2. RLS 가이드: https://supabase.com/docs/guides/auth/row-level-security
3. 프로젝트 내 다른 MD 파일들 참고

---

**작성일**: 2025년 10월 18일  
**버전**: 1.0

