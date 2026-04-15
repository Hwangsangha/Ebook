import { useEffect, useState } from "react";
import { AdminOrderApi } from "../api";

function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        //관리자 권한 체크
        const role = localStorage.getItem("role");
        if(role !== "ADMIN") {
            setMsg("ADMIN만 접근 가능합니다.");
            return;
        }
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setMsg("");
        try {
            const data = await AdminOrderApi.list();

            //데이터 배열 추출 (응답 형태 방어 로직)
            const list = Array.isArray(data) ? data
                : Array.isArray(data?.content) ? data.content
                : Array.isArray(data?.data) ? data.data
                : [];
            
            setOrders(list);
        } catch(e) {
            console.error(e);
            setMsg("주문 내역을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    //권한 없는 경우 가드
    const role = localStorage.getItem("role");
    if(role !== "ADMIN") {
        return(
            <div className="flex justify-center items-center min-h-[60vh] px-4">
                <div className="alert alert-error shadow-lg max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                        <h3 className="font-bold">접근 거부</h3>
                        <div className="text-sm">{msg || "관리자(ADMIN)만 접근할 수 있는 페이지입니다."}</div>
                    </div>
                </div>
            </div>
        );
    }

    //총 매출액 계산 (PAID 상태인 것만)
    const totalRevenue = orders
        .filter(order => order.status === "PAID")
        .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

return(
        <div className="container mx-auto px-4 py-8 max-w-6xl mb-20">
            
            {/* 헤더 영역에 아이콘 추가하고 새로고침 버튼 디자인 강화 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-4 mb-8 gap-4">
                <h2 className="text-3xl font-extrabold text-base-content tracking-tight flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    관리자 대시보드
                </h2>
                <button 
                    className="btn btn-outline btn-primary btn-sm"
                    onClick={fetchOrders} 
                    disabled={loading}
                >
                    {loading ? <span className="loading loading-spinner loading-xs"></span> : "↻ 새로고침"}
                </button>
            </div>

            {msg && <p className="text-error font-bold mb-4">{msg}</p>}

            {/* daisyUI의 'Stats' 컴포넌트로 변경해 진짜 통계 상황판 느낌으로 재구성 */}
            <div className="stats shadow w-full border border-base-200 mb-8 bg-base-100">
                <div className="stat">
                    <div className="stat-title text-base-content/70 font-bold">총 누적 매출 (결제 완료)</div>
                    <div className="stat-value text-primary text-4xl">{totalRevenue.toLocaleString()}원</div>
                    <div className="stat-desc mt-2 text-base-content/50">
                        전체 {orders.length}건 중 결제 완료 {orders.filter(o => o.status === "PAID").length}건
                    </div>
                </div>
            </div>

            {/* 테이블 영역을 둥근 모서리와 그림자가 있는 카드로 감싸서 깔끔하게 묶음 */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
                {orders.length === 0 && !loading ? (
                    <div className="text-center py-20">
                        <p className="text-base-content/50 font-medium">아직 접수된 주문 내역이 없습니다.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {/* 테일윈드 table 클래스로 최적화 */}
                        <table className="table table-zebra w-full">
                            <thead className="bg-base-200/50 text-base-content/70 text-sm">
                                <tr>
                                    <th className="font-bold py-4 pl-6">주문 번호 (Toss)</th>
                                    <th className="font-bold py-4">총 결제 금액</th>
                                    <th className="font-bold py-4 text-center">상태</th>
                                    <th className="font-bold py-4 text-right pr-6">생성 일시</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id || order.orderNumber} className="hover">
                                        <td className="py-4 pl-6 font-mono text-sm text-base-content/80">
                                            {order.orderNumber}
                                        </td>
                                        <td className="py-4 font-bold text-base-content">
                                            {Number(order.totalAmount).toLocaleString()}원
                                        </td>
                                        <td className="py-4 text-center">
                                            {/* 상태별로 뱃지 색상이 다르게 나오도록 daisyUI badge 클래스 조건부 적용 */}
                                            <span className={`badge badge-sm font-bold ${
                                                order.status === 'PAID' ? 'badge-success text-white' : 
                                                order.status === 'PENDING' ? 'badge-warning text-white' : 
                                                'badge-error text-white'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right pr-6 text-sm text-base-content/60">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminOrdersPage;