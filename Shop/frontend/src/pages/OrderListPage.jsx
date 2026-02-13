import "../styles/ui.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Header from "../components/Header";

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

    return(
        <div className="ui-page">
            <Header/>
            <h1 className="ui-title">내 주문 목록</h1>

            {msg && <p style={{color: "red"}}>{msg}</p>}
            
            {loading && <p>로딩 중</p>}

            {!loading && orders.length === 0 ? (
                <p className="ui-muted">주문 내역이 없습니다.</p>
            ) : (
                <table
                    border="1"
                    cellPadding="10"
                    style={{
                        borderCollapse: "collapse",
                        width: "100%",
                        marginTop: "20px",
                        cursor: "pointer", //클릭 가능 표시
                    }}
                >
                    <thead style={{backgroundColor: "#f4f4f4"}}>
                        <tr>
                            <th>주문번호</th>
                            <th>주문일시</th>
                            <th>금액</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr
                                key={order.id}
                                onClick={() => handleRowClick(order.id)}    //클릭 시 상세페이지 이동
                                className="order-row"   // css hover효과용
                                style={{transition: "background 0.2s"}}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f9f9f9")}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
                            >
                                <td>{order.orderNumber}</td>
                                <td>{new Date(order.createdAt).toLocaleString()}</td>
                                <td>{order.totalAmount.toLocaleString()}원</td>
                                <td>
                                    <span
                                        style={{
                                            fontWeight: "bold",
                                            color: order.status === "PAID" ? "green" : "orange",
                                        }}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div style={{marginTop: 20}}>
                <button className="ui-btn" onClick={() => navigate("/")}>
                    홈으로
                </button>
            </div>
        </div>
    );
}

export default OrderListPage;