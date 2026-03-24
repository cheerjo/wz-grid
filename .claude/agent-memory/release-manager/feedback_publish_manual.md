---
name: npm publish 수동 진행
description: npm publish는 사용자가 직접 수행하며 릴리즈 파이프라인에서 제외
type: feedback
---

npm publish 단계는 건너뛰고 git 태그 생성 및 push까지만 완료한다.

**Why:** 사용자가 npm publish를 수동으로 직접 진행하는 것을 선호함. 2026-03-17 v1.3.3 릴리즈 시 명시적으로 요청.
**How to apply:** 릴리즈 요청 시 Step 6(npm publish) 및 Step 7(push) 중 push만 수행. publish 확인 질문도 생략 가능.
