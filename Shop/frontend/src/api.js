import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8080",
    headers: { "Content-Type": "application/json"},
});

api.interceptors.request.use((config) => {
  console.log("[API REQ]", (config.method || "GET").toUpperCase(), config.baseURL, config.url);
  return config;
});

//공통 에러 처리
function unwrap(promise){
    return promise.then(r => r.data).catch(err => {
        const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Network error";
        throw new Error(msg);
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

export default api;