import { useEffect, useState } from "react";    //상태/생명주기
import { OrdersApi } from "../api";  //주문 API
import { useNavigate } from "react-router-dom"; //페이지 이동

function OrdersPage() {
    const [orders, setOrders] = useState([]);   //주문 목록 데이터
    const [msg, setMsg] = useState("");     //성공/에러 메시지
    const navigate = useNavigate();     //화면 이동 함수

    //임시 userId 호출
    const userId = 1;

    //페이지 진입 시 주문 목록 자동 조회
    useEffect(() => {
        fetchOrders();
    }, []);

    //주문 목록 조회 함수
    const fetchOrders = async () => {
        setMsg("");
        try {
            const data = await OrdersApi.list(userId);  //GET /order?userId=1
            setOrders(Array.isArray(data) ? data : []); //방어코드: 배열 아니면 빈 배열
        } catch (e) {
            setMsg(e.message || "주문 목록 조회 실패");
            setOrders([]);
            console.log("[ORDERS LIST ERROR]", e);
        }

    const goDetail = (orderId) => {
        //상세 API는 GET /orders/{id}?userId=1 이라서
        // -url에 orderId만 넣고, userId는 상세 페이지에서 그대로 1로 넘김
        navigate(`/orders/${orderId}`);
    }
    };

    return(
        <div style={{padding: 24, fontFamily: "system-ui"}}>
            <h2>주문 내역</h2>

            {/* 메시지 표시 */}
            {msg && (
                <p style={{color: msg.includes("완료") ? "green" : "crimson"}}>
                    {msg}
                </p>
            )}

            {/* 새로고침 버튼 */}
            <div style={{marginBottom: 12}}>
                <button onClick={fetchOrders}>새로고침</button>
            </div>

            {/* 주문이 없을때 */}
            {orders.length === 0 ? (
                <p style={{color: "#666"}}>주문 내역이 없습니다.</p>
            ) : (
                <table
                    border="1"
                    cellPadding="8"
                    style={{borderCollapse: "collapse", width: "100%"}}
                >
                    <thead>
                        <tr>
                            <th>주문ID</th>
                            <th>주문번호</th>
                            <th>상태</th>
                            <th>총액</th>
                            <th>최종금액</th>
                            <th>생성일시</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => (
                            <tr 
                                key={o.orderId}
                                style={{cursor: "pointer"}} //클릭 가능한 행처럼 보이게
                                onClick={() => goDetail(o.orderId)} //상세페이지로 이동
                                title="클릭하면 상세로 이동"
                            >
                                <td>{o.orderId}</td>
                                <td>{o.orderNumber}</td>
                                <td>{o.status}</td>
                                <td>{o.totalAmount}</td>
                                <td>{o.finalAmount}</td>
                                {/* ✅ 백엔드 LocalDateTime이 문자열로 내려오므로 간단히 표시 */}
                                <td>{String(o.createdAt || "").replace("T", " ")}</td>
                            </tr>
                            ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default OrdersPage;