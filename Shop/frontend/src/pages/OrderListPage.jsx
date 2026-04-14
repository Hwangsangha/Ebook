import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function OrderListPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                // /orders 호출하면 백엔드가 토큰 보고 주문
                const res = await api.get("/orders");
                setOrders(res.data);
            } catch(e) {
                setMsg(e.message || "목록 조회 실패");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleRowClick = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    //로딩 중 화면
    if(loading) return(
        <div className="flex flex-col justify-center items-center min-h-[60vh-]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-base-content/50 font-medium">주문 내역을 불러오는 중입니다.</p>
        </div>
    );

return(
        <div className="container mx-auto px-4 py-8 max-w-5xl mb-20">
            
            {/* 타이틀 영역 */}
            <div className="flex justify-between items-end mt-8 mb-8">
                <h1 className="text-3xl font-extrabold text-base-content tracking-tight flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    내 서재 (주문 내역)
                </h1>
                <button className="btn btn-ghost btn-sm text-base-content/60" onClick={() => navigate("/")}>
                    쇼핑 홈으로
                </button>
            </div>

            {/* 에러 메시지 */}
            {msg && (
                <div className="alert alert-error shadow-sm mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{msg}</span>
                </div>
            )}

            {/* 주문 내역이 없을 때 */}
            {!loading && orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-base-200/30 rounded-3xl border border-base-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-base-content/20 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-xl font-bold text-base-content mb-2">아직 구매한 전자책이 없습니다.</p>
                    <p className="text-base-content/50 mb-8">관심 있는 책을 찾아 첫 주문을 해보세요!</p>
                    <button className="btn btn-primary px-8" onClick={() => navigate("/")}>
                        전자책 구경하러 가기
                    </button>
                </div>
            ) : (
                /* 주문 내역이 있을 때 (테이블 레이아웃) */
                <div className="bg-base-100 rounded-3xl shadow-sm border border-base-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-lg w-full">
                            {/* 테이블 헤더 */}
                            <thead className="bg-base-200/50 text-base-content/60 text-sm border-b border-base-200">
                                <tr>
                                    <th className="font-bold py-4 pl-6">주문번호</th>
                                    <th className="font-bold py-4">주문일시</th>
                                    <th className="font-bold py-4 text-right">결제 금액</th>
                                    <th className="font-bold py-4 text-center pr-6">주문 상태</th>
                                </tr>
                            </thead>
                            
                            {/* 테이블 본문 */}
                            <tbody className="divide-y divide-base-100">
                                {orders.map((order) => (
                                    <tr 
                                        key={order.id} 
                                        onClick={() => handleRowClick(order.id)}
                                        className="hover:bg-base-200/30 transition-colors duration-200 cursor-pointer group"
                                    >
                                        <td className="py-5 pl-6">
                                            <span className="font-semibold text-base-content group-hover:text-primary transition-colors">
                                                {order.orderNumber}
                                            </span>
                                        </td>
                                        <td className="py-5 text-base-content/70">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </td>
                                        <td className="py-5 text-right font-bold text-base-content text-lg">
                                            {order.totalAmount.toLocaleString()}원
                                        </td>
                                        <td className="py-5 text-center pr-6">
                                            {/* 상태 뱃지 */}
                                            <span className={`badge badge-lg font-bold shadow-sm ${
                                                order.status === "PAID" ? "badge-success text-white" : 
                                                order.status === "PENDING" ? "badge-warning text-white" : 
                                                "badge-ghost"
                                            }`}>
                                                {order.status === "PAID" ? "결제완료" : 
                                                 order.status === "PENDING" ? "결제대기" : order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderListPage;