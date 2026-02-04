import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8080",
    headers: { "Content-Type": "application/json"},
});

//이전에 남아있을수 있어서 정리
delete api.defaults.headers.common.Authorization;

//요청 인터셉터 - API 요청이 나가기 전에 로직을 한번 거치고 나감
api.interceptors.request.use((config) => {
    //localStorage에 저장된 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    //토큰이 있으면 Authorization헤더 자동 추가
    // -> 나중에 백엔드 JWT 붙여도 그대로 사용 가능
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;  //토큰 있든 없든 항상 반환
});

//응압 인터셉터(응답 받은 직후)
api.interceptors.response.use(
    (res) => res,   //정상 등답 통화
    (err) => {      //에러 응답 처리
        const status = err?.response?.status;       //HTTP상태코드 추출
        if(status ===401 || status === 403) {       //인증/권한 에러면?(만료 포함)
            //현재 로그인 페이지가 아니라면(무한 루프 방지)
            if(!window.location.pathname.startsWith("/login")) {
                //사용자에게 이유 알려줌
                alert("로그인 세션이 만료되었습니다.\n다시 로그인 해주세요.")
                clearAuth();      //로컬 인증정보 삭제
                window.location.assign("/login");       //로그인 페이지로 강제이동
            }
        }
        return Promise.reject(err);     //에러는 호출한 쪽에서도 처리 가능하게
    }
);

//공통 에러 처리
function unwrap(promise){
    return promise.then(r => r.data).catch(err => {
        const status = err?.response?.status;   //HTTP 상태코드
        const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Network error"
        //상태코드까지 포함해서 throw
        throw new Error(status ? `[${status}] ${msg}` : msg);
    });
}

function getUserIdOrThrow() {
    const userId = localStorage.getItem("userId");      //저장딘 userId
    if(!userId) throw new Error("로그인이 필요합니다. (userId 없음)");      //없으면 에러
    return Number(userId);
}

//JWT payload파싱
export function parseJwt(token) {
    if(!token) return null;     //인증토큰 없으면 null
    const parts = token.split(".");     //JWT는 header.payload.signature로 구성
    if(parts.length !== 3) return null;     //형식이 아니면 null
    try {   //파싱 시도
        const base64Url = parts[1];     //payload 2번째 부분
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g,"/");  //문자 치환
        const json = decodeURIComponent(        //UTF-8 안전 디코딩
            atob(base64)
                .split("")  
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))  //퍼센트 인코딩 문자열로 변환
                .join("")   //다시 문자열로 합치기
        );
        return JSON.parse(json);    //JSON문자열 -> 객체
    } catch (e) {   
        return null;    //실패시 null
    }
}

//localStorage인증 상태 저장/삭제
export function setAuth(accessToken) {      //accessToken을 저장하고 userId/role도 같이 저장
    localStorage.setItem("accessToken", accessToken);       //토큰 저장
    const payload = parseJwt(accessToken);      //토큰 payload 파싱
    if(payload?.sub) localStorage.setItem("userId", payload.sub);       //sub를 userId로 저장
    if(payload?.role) localStorage.setItem("role", payload.role);       //role 저장(USER/ADMIN)
}

export function clearAuth() {       //인증정보 제거(만료/로그아웃 시)
    localStorage.removeItem("accessToken");     //토큰 삭제
    localStorage.removeItem("userId");      //userId삭제
    localStorage.removeItem("role");        //role 삭제
}

//Auth API
export const AuthApi = {
    register: ({email, password, name}) =>     //회원가입 API
        unwrap(api.post("/auth/register", {email, password, name})),       //POST 후 unwrap으로 data만 반환
    login: ({email, password}) =>       //로그인API
        unwrap(api.post("/auth/login", {email, password})),        //POST 후 unwrap
};

//전자책 관련 API
export const EbookApi = {
    list() {return unwrap(api.get("/api/ebooks"))},

    get(id) {return unwrap(api.get(`/api/ebooks/${id}`))}
};

//장바구니 관련 API
export const CartApi = {
    addItem: ({ebookId, quantity = 1}) =>
        unwrap(api.post("/cart/items", {
            userId: getUserIdOrThrow(),
            ebookId,
            quantity,
        })),

    listItems: () =>
        unwrap(api.get("/cart/items",
            {params: {userId: getUserIdOrThrow()},
        })),

    setQuantity: ({ebookId, quantity}) =>
        unwrap(api.patch("/cart/items", {
            userId: getUserIdOrThrow(),
            ebookId,
            quantity,
        })),

    summary: () =>
        unwrap(api.get("/cart/summary",
            {params: {userId: getUserIdOrThrow()}, 
        })),

    removeItem: ({ebookId}) =>
        unwrap(api.delete(`/cart/items/${ebookId}`,
            {params: {userId: getUserIdOrThrow()},
        })),

    clear: () =>
        unwrap(api.delete("/cart/items",
            {params: {userId: getUserIdOrThrow()},
        })),
};

//관리자 전자책 관련 API
export const AdminEbookApi = {
    //관리자 목록 조회
    list: (params) => 
        unwrap(api.get("/admin/ebooks", {params})),

    //전자책 등록
    create: (formData) =>
        unwrap(api.post("/admin/ebooks", formData, {
            headers: {"Content-Type": "multipart/form-data"},
        })),

    //전자책 수정
    update: (id, {title, price, status}) =>
        unwrap(api.patch(`/admin/ebooks/${id}`, {title, price, status})),
    
    //전자책 삭제
    remove: (id) => unwrap(api.delete(`/admin/ebooks/${id}`)),
}

//주문 관련 API
//백엔드 : GET /orders?userId=1
//unwrap()을 통해 data만 반환
export const OrdersApi = {
    //장바구니 -> 주문생성
    create: (ebookId = null) => {
        const params = {userId: getUserIdOrThrow()};

        //ebookId가 넘어왔다면 파라미터에 추가
        if(ebookId) {
            params.ebookId = ebookId;
        }

        return unwrap(api.post("/orders", null, {params}));
    },

    //주문 목록 조회
    list: () =>
        unwrap(api.get("/orders", 
            {params: {userId: getUserIdOrThrow()},   //쿼리스트링으로 ?userId=1 형태로 나감
    })),

    //주문 상세
    get: (id) =>
        unwrap(api.get(`/orders/${id}`, {params: {userId: getUserIdOrThrow()}})),

    //결제 처리
    pay: (id) =>
        unwrap(api.patch(`/orders/${id}/pay`, null, {params: {userId: getUserIdOrThrow()}})),

    //주문 취소
    cancel: (id) =>
        unwrap(api.patch(`/orders/${id}/cancel`, null, {params: {userId: getUserIdOrThrow()}})),

    detail: (orderId) =>
        unwrap(api.get(`/orders/${orderId}`, 
            {params: {userId: getUserIdOrThrow()}}
        )),
};

export default api;