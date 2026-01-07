import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8080",
    headers: { "Content-Type": "application/json"},
});

//요청 인터셉터 - API 요청이 나가기 전에 로직을 한번 거치고 나감
api.interceptors.request.use((config) => {
    //localStorage에 저장된 토큰 가져오기
    const token = localStorage.getItem("accessToken");

    //토큰이 있으면 Authorization헤더 자동 추가
    // -> 나중에 백엔드 JWT 붙여도 그대로 사용 가능
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        //토큰 업으면 Authorization 헤더 제거
        delete config.headers.Authorization;
    }

    //임시 로그인 단계에서 role 확인용
    const role = localStorage.getItem("role");
    if(role) {
        config.headers["X-DEV-ROLE"] = role;
    }

    console.log("[API REQ]", (config.method || "GET").toUpperCase(), config.url);
    return config;
});

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

//전자책 관련 API
export const EbookApi = {
    list() {
        return unwrap(api.get("/ebooks"));
    }
};

//장바구니 관련 API
export const CartApi = {
    addItem: ({userId, ebookId, quantity = 1}) =>
        unwrap(api.post("/cart/items", {userId, ebookId, quantity})),

    listItems: (userId) =>
        unwrap(api.get("/cart/items", {params: {userId}})),

    setQuantity: ({userId, ebookId, quantity}) =>
        unwrap(api.patch("/cart/items", {userId, ebookId, quantity})),

    summary: (userId) =>
        unwrap(api.get("/cart/summary", {params: {userId}})),

    removeItem: ({userId, ebookId}) =>
        unwrap(api.delete(`/cart/items/${ebookId}`, {params: {userId}})),

    clear: (userId) =>
        unwrap(api.delete("/cart/items", {params: {userId}})),
};

//관리자 전자책 관련 API
export const AdminEbookApi = {
    //전자책 등록
    create: ({title, price, status}) =>
        unwrap(api.post("/admin/ebooks", {title, price, status})),

    //전자책 수정
    update: (id, {title, price, status}) =>
        unwrap(api.put(`/admin/ebooks/${id}`, {title, price, status})),
    
    //전자책 삭제
    remove: (id) => unwrap(api.delete(`/admin/ebooks/${id}`)),
}
export default api;