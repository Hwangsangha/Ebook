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
## 인증 구현 중 주요 이슈 정리

- H2 DB에서 user 테이블명 예약어 충돌 → users로 변경
- 임시 로그인(dev-token) 잔재로 Authorization 헤더 오류 발생
- axios interceptor 템플릿 문자열 오류(`${token}` 미치환)
- 로그인 페이지 런타임 에러(setMsg 누락)로 인증 요청 미실행

상세 내용은 커밋 로그 및 코드 주석으로 관리
