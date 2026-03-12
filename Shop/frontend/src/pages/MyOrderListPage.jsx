import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import api from "../api";
import Header from "../components/Header";
import "../styles/ui.css";

function MyOrderListPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                // 백엔드 컨트롤러 경로로 요청
                const response = await api.get("/orders/my");
                setOrders(response.data);
            } catch (error) {
                console.error("주문 목록 조회 실패: ", error);
                alert("주문 내역을 불러오는 중 문제가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, []);

    if(loading) return <div style={{padding: 20}}>로딩중</div>;

    return(
        <div className="ui-btn">
            <Header/>
            <div style={{maxWidth: 800, margin: "0 auto", padding: 20}}>
                <h2 className="ui-title">내 주문 내역</h2>

                {orders.length === 0 ? (
                    <div style={{textAlign: "center", padding: 50, color: "#666"}}>
                        주문 내역이 없습니다. 전자책을 구매해보세요.
                    </div>
                ) : (
                    <ul style={{listStyle: "none", padding: 0}}>
                        {orders.map((order) => (
                            <li
                                key={order.id}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: 8,
                                    padding: "15px 20px",
                                    marginBottom: 15,
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                                //클릭시 상세페이지(/order/:id)로 이동
                                onClick={() => navigate(`/orders/${order.id}`)}
                            >
                                <div>
                                    <div style={{fontSize: 12, color: "#888", marginBottom: 5}}>
                                        {new Date(order.createdAt).toLocaleString()}
                                    </div>
                                    <div style={{fontSize: 16, fontWeight: "bold"}}>
                                        주문번호: {order.orderNumber}
                                    </div>
                                    <div style={{marginTop: 5, fontSize: 14}}>
                                        {/* 최종 결제 금액 사용 */}
                                        결제금액: {Number(order.finalAmount).toLocaleString()}원
                                    </div>
                                </div>

                                <div>
                                    <span style={{
                                        padding: "5px 10px",
                                        borderRadius: 20,
                                        fontSize: 12,
                                        fontWeight: "bold",
                                        //상태값(PENDING, PAID, CANCELLED)에 맞춰 색상 다르게 표시
                                        backgroundColor: order.status === "PAID" ? "#e6f4ea" : order.status === "CANCELLED" ? "#fce8e6" : "#fef7e0",
                                        color: order.status === "PAID" ? "green" : order.status === "CANCELLED" ? "red" : "orange"
                                    }}>
                                        {order.status === "PENDING" ? "결제대기" : order.status === "PAID" ? "결제완료" : "결제취소"}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
export default MyOrderListPage;