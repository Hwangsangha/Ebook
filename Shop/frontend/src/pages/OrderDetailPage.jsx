import "../styles/ui.css";      //공통 UI스타일
import {useEffect, useState} from "react"      //React 훅
import {useNavigate, useParams} from "react-router-dom";        //라우팅 훅
import {OrdersApi} from "../api";       //주문 API(상세)
import api from "../api";       //axios 인스턴스(다운로드 토큰 발급은 임시로 직접 호출)
import Header from "../components/Header";      //헤더

//주문 상세 페이지 컴포넌트
function OrderDetailPage() {
    const {id} = useParams();       //URL의 /orders/:id 값
    const navigate = useNavigate();     //페이지 이동
    const [detail, setDetail] = useState(null);     //주문 상세 테이터
    const [msg, setMsg] = useState("");     //안내/에러 메시지
    const [loading, setLoading] = useState(false);      //로딩 상태

    useEffect(() => {       //페이지 진입 시 1회 호출
        const fetchDetail = async () => {       //상세 조회 함수
            setMsg("");     //메시지 초기화
            try {
                setLoading(true);       //로딩 시작
                const data = await OrdersApi.detail(id);        //GET /orders/{id}
                setDetail(data);        //상태 저장
            } catch (e) {
                setMsg(e.message || "주문 상세 조회 실패");     //에러 표시
            } finally {
                setLoading(false);      //로딩 종료
            }
        };
        fetchDetail();      //실행
    }, [id]);       //id 바뀌면 재조회

    const handleDownload = async(ebookId) => {      //다운로드 버튼 클릭 핸들러
        if(!detail) return;     //방어
        if(loading) return;        //중복 클릭 방지

        const status = (detail.status || "").toUpperCase();     //주문 상태
        if(status !== "PAID") {     //PAID만 허용
            setMsg("결제 완료(PAID) 상태에서만 다운로드 가능합니다.");
            return;
        }

        try {
            setLoading(true);       //로딩 시작
            setMsg("");     //메시지 초기화

            //다운로드 토큰 발급: POST /downloads/tokens?orderId=...&ebookId=...
            const res = await api.post("/downloads/tokens", null, {//바디 업싱 쿼리만 전송
                params: {orderId: detail.orderId ?? detail.id, ebookId},        //orderId/ebookId 전달
            });

            const token = res.data?.token;      //응답에서 token 추출
            if(!token) throw new Error("토큰 발급 응답에 token이 없습니다.");   //검증

            //다운로드 호출: 브라우저가 파일 다운로드 처리하도록 location 이동
            window.location.href = `${api.defaults.baseURL}/downloads/${token}`;        //파일 다운로드
        } catch(e) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "다운로드 실패";
            setMsg(message);        //에러 메시지 표시
        } finally {
            setLoading(false);      //로딩 종료
        }
    };

    //결제 버튼
    const handlePay = async () => {
        const confirmPay = window.confirm("결제하시겠습니까?(가상결제)");
        if(!confirmPay) return;

        try {
            //백엔드에 알림
            const response = await fetch(`http://localhost:8080/api/orders/${id}/pay`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    //토큰이 필요하면 Authorization헤더 추가
                },
            });

            if(response.ok) {
                alert("결제가 완료되었습니다.");
                window.location.reload();   //페이지 세로고침해서 상태 변경 확인
            } else {
                alert("결제 실패");
            }
        } catch(error) {
            console.error("Payment Error:", error);
            alert("에러가 발생했습니다.");
        }
    };
    if(!order) return <div>로딩중</div>;

    if(loading && !detail) return <p className="ui-muted">불러오는 중...</p>        //초기 로딩
    if(!detail) return <p className="ui-muted">주문 정보가 없습니다.</p>        //없음 처리

    const status = (detail.status || "").toUpperCase();     //상태 표기용
    const lines = Array.isArray(detail.items) ? detail.items : [];      //주문라인 목록

    return (
        <div className="ui-page">
            <Header/>
            <h1 className="ui-title">주문 상세</h1>

            {msg && <p className="ui-muted" style={{color: "crimson"}}>{msg}</p>}

            <div className="ui-grid">
                <div className="ui-row ui-header">
                    <div className="col-title">항목</div>
                    <div className="col-price">값</div>
                </div>

                <div className="ui-row">
                    <div className="col-title">주문번호</div>
                    <div className="col-price">{detail.orderNumber}</div>
                </div>

                <div className="ui-row">
                    <div className="col-title">상태</div>
                    <div className="col-price">{status}</div>
                </div>
            </div>

            <h3 style={{marginTop: 16}}>구매 항목</h3>

            {lines.length === 0 ? (
                <p className="ui-muted">구매 항목이 없습니다.</p>
            ) : (
                <table border="1" cellPadding="8" style={{borderCollapse: "collapse", width: "100%"}}>
                    <thead>
                        <tr>
                            <th>ebookId</th>
                            <th>제목</th>
                            <th>수량</th>
                            <th>소계</th>
                            <th>액셕</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.map((l) => (
                            <tr key={l.ebookId}>
                                <td>{l.ebookId}</td>
                                <td>{l.title}</td>
                                <td>{l.quantity}</td>
                                <td>{l.subTotal}</td>
                                <td>
                                    <button
                                        onClick={() => handleDownload(l.ebookId)}       //다운로드
                                        disabled={status !== "PAID" || loading}     //PAID만 활성
                                        title={status === "PAID" ? "다운로드" : "결제 완료 후 다운로드 가능"}
                                    >
                                        다운로드
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div style={{marginTop: 20, display: "flex", justifyContent: "flex-end", gap: "10px"}}>
                {/* 상태가 PENDING일 때만 결제 버튼 표시 */}
                {status === "PENDING" && (
                    <button
                        className="ui-btn"
                        style={{backgroundColor: "#007bff", color: "white", border: "none"}}
                        onClick={handlePay}
                    >
                        결제하기
                    </button>
                )}
                <button className="ui-btn" onClick={() => navigate("/orders")}>
                    목록으로
                </button>
            </div>
        </div>
    );
}

export default OrderDetailPage;