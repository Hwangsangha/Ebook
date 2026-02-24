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
            <div style={{padding: 24, fontFamily: "system-ui"}}>
                <h2>전체 주문 관리</h2>
                <p style={{color: "crimson"}}>{msg || "ADMIN만 접근 가능"}</p>
            </div>
        );
    }

    //총 매출액 계산 (PAID 상태인 것만)
    const totalRevenue = orders
        .filter(order => order.status === "PAID")
        .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

    return(
        <div style={{padding: 24, fontFamily: "system-ui", maxWidth: "1000px", margin: "0 auto"}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20}}>
                <h2>관리자: 전체 주문 관리</h2>
                <button onClick={fetchOrders} disabled={loading} style={{padding: "8px 16px", cursor: "pointer"}}>
                    {loading ? "불러오는 중" : "↻ 새로고침"}
                </button>
            </div>

            {msg && <p style={{color: "crimson", fontWeight: "bold"}}>{msg}</p>}

            {/* 매출 요약 카드 */}
            <div style={{background: "#f8f9fa", padding: "20px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "20px"}}>
                <h3 style={{margin: "0 0 10px 0"}}>총 매출액(결제 완료 기준)</h3>
                <p style={{fontSize: "24px", fontWeight: "bold", color: "#3366FF", margin: 0}}>
                    {totalRevenue.toLocaleString()}원
                </p>
                <p style={{fontSize: "14px", color: "#666", marginTop: "5px", marginBottom: "0"}}>
                    총 주문 건수: {orders.length}건 / 결제완료: {orders.filter(o => o.status === "PAID").length}건
                </p>
            </div>

            {/* 주문 내역 테이블 */}
            {orders.length === 0 && !loading ? (
                <div style={{textAlign: "center", padding: 50, border: "1px solid #ddd", borderRadius: 8}}>
                    <p style={{color: "#666"}}>아직 결제/주문 내역이 없습니다.</p>
                </div>
            ) : (
                <table style={{borderCollapse: "collapse", width: "100%", border: "1px solid #ddd", textAlign: "left", fontSize: "14px"}}>
                    <thead style={{background: "#f1f1f1"}}>
                        <tr>
                            <th style={{padding: 12, borderBottom: "1px solid #ddd"}}>주문 번호(Toss)</th>
                            <th style={{padding: 12, borderBottom: "1px solid #ddd"}}>총 금액</th>
                            <th style={{padding: 12, borderBottom: "1px solid #ddd"}}>상태</th>
                            <th style={{padding: 12, borderBottom: "1px solid #ddd"}}>생성 일시</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id || order.orderNumber} style={{borderBottom: "1px solid #eee"}}>
                                <td style={{padding: 12, fontFamily: "monospace"}}>{order.orderNumber}</td>
                                <td style={{padding: 12, fontWeight: "bold"}}>{Number(order.totalAmount).toLocaleString()}원</td>
                                <td style={{padding: 12}}>
                                    <span style={{
                                        color: order.status === 'PAID' ? 'green' : order.status === 'PENDING' ? 'orange' : 'red',
                                        fontWeight: "bold",
                                        background: order.status === 'PAID' ? '#e6f4ea' : order.status === 'PENDING' ? '#fef7e0' : '#fce8e6',
                                        padding: "4px 8px",
                                        borderRadius: "4px"
                                    }}>
                                        {order.status}
                                    </span>
                                </td>
                                <td style={{padding: 12, color: "#666"}}>
                                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
export default AdmingOrdersPage;