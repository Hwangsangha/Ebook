import { useEffect, useState } from "react";    //상태/생명주기
import { OrdersApi } from "../api";  //주문 API
import { useNavigate } from "react-router-dom"; //페이지 이동

function OrdersPage() {
    const [orders, setOrders] = useState([]);   //주문 목록 데이터
    const [msg, setMsg] = useState("");     //성공/에러 메시지
    const [loading, setLoading] = useState("");     //로딩 상태
    const navigate = useNavigate();     //화면 이동 함수

    //페이지 진입 시 주문 목록 자동 조회
    useEffect(() => {
        fetchOrders();
    }, []);

    //주문 목록 조회 함수
    const fetchOrders = async () => {
        setMsg("");
        try {
            setLoading(true);
            const data = await OrdersApi.list();  
            setOrders(Array.isArray(data) ? data : []); //방어코드: 배열 아니면 빈 배열
        } catch (e) {
            setMsg(e.message || "주문 목록 조회 실패");     //에러메시지
            setOrders([]);      //목록 초기화
            console.log("[ORDERS LIST ERROR]", e);
        } finally {
            setLoading(false);
        }
    };

    const goDetail = (orderId) => {
        //상세 API는 GET /orders/{id}?userId=1 이라서
        // -url에 orderId만 넣고, userId는 상세 페이지에서 그대로 1로 넘김
        navigate(`/orders/${orderId}`);
    };

    //주문 취소 핸들러
    const handleCancel = async (e, orderId) => {
        e.stopPropagation();        //행 클릭(상세이동) 막기
        if(loading) return;     //중복 클릭 방지
        if(!window.confirm("주문을 취소하시겠습니까?")) return;

        try {
            setLoading(true);
            await OrdersApi.cancel(orderId);        //주문 취소 호출
            setMsg("취소완료");     //성공 메시지
            await fetchOrders();        //목록 갱신
        } catch(err) {
            setMsg(err.message || "취소 실패");     //에러메시지
            console.log("[ORDER CANCEL ERROR]", err);       //콘솔 로그
        } finally {
            setLoading(false);      //로딩 종료
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
            <div style={{marginBottom: 12, display: "flex", gap: 8}}>
                <button onClick={fetchOrders} disabled={loading}>
                    {loading ? "불러오는 중..." : "새로고침"}
                </button>
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
                            <th>액션</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.map((o) => {
                            const id = o.orderId ?? o.id;       //응답 키
                            const status = o.status || "";      //상태
                            const canCancel = status === "PENDING";        //PENDING만 취소 가능

                            return (
                                <tr 
                                    key={id}
                                    style={{cursor: "pointer"}} //클릭 가능한 행처럼 보이게
                                    onClick={() => goDetail(id)} //상세페이지로 이동
                                    title="클릭하면 상세로 이동"
                                >
                                    <td>{id}</td>
                                    <td>{o.orderNumber}</td>
                                    <td>{status}</td>
                                    <td>{o.totalAmount}</td>
                                    <td>{o.finalAmount}</td>
                                    {/* ✅ 백엔드 LocalDateTime이 문자열로 내려오므로 간단히 표시 */}
                                    <td>{String(o.createdAt || "").replace("T", " ")}</td>

                                    <td>
                                        <button
                                            onClick = {(e) => handleCancel(e, id)}        //취소 실행
                                            disabled = {!canCancel || loading}      //조건부 비활성
                                            title = {canCancel ? "주문 취소" : "취소 불가"}
                                        >
                                            취소
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default OrdersPage;