# Ebook Shop (Spring Boot + React)

전자책 목록 조회, 장바구니 담기/수량변경/삭제, 요약(주문 흉내)까지 포함한 간단한 전자책 쇼핑 플로우 프로젝트입니다.

## 기능
- 전자책 목록 조회 (ACTIVE)
- 장바구니 담기
- 장바구니 수량 증감
- 장바구니 항목 삭제
- 장바구니 요약(총 수량/총 금액)
- 결제(가짜) 완료 화면 + 결제 시 장바구니 비우기

## 기술 스택
- Backend: Java, Spring Boot, Spring Data JPA, H2 (dev)
- Frontend: React (Vite), Axios
- 기타: REST API, 간단한 UI 공통 스타일(ui.css)

## 실행 방법

### 1) 백엔드 실행
- Eclipse/VScode에서 `EbookApplication` 실행  
또는
bash
./gradlew bootRun

### 2) 프론트 실행
- VScode에서 실행
cd frontend
npm install
npm run dev
기본 주소 : http://localhost:5173

### 주요 화면 ROUTE
/ 또는 /ebooks : 전자책 목록
/cart : 장바구니
/summary : 주문 요약(결제 흉내)

### API 요약

GET /ebooks

POST /cart/items (body: userId, ebookId, quantity)

GET /cart/items?userId=

PATCH /cart/items (body: userId, ebookId, quantity)

DELETE /cart/items/{ebookId}?userId=

GET /cart/summary?userId=

DELETE /cart/items?userId= (장바구니 비우기)

---
## 인증(JWT) 구현 요약

- JWT 기반 인증/권한 구조 구현 (Spring Security + React)
- axios interceptor를 통한 Authorization 헤더 자동 처리
- Role 기반 접근 제어 (USER / ADMIN)
- 인증 실패(403) 발생 시 Network/Console 로그를 기준으로 원인 추적 및 해결

> 상세 구현 과정 및 트러블슈팅 기록은 `docs/` 참고

