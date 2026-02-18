import "../styles/ui.css";      //공통 UI스타일
import {useEffect, useState, useRef} from "react"      //React 훅
import {useNavigate, useParams} from "react-router-dom";        //라우팅 훅
import api, {OrdersApi} from "../api";       //주문 API(상세)
import Header from "../components/Header";      //헤더
import {loadTossPayments} from "@tosspayments/payment-sdk";

const CLIENT_KEY = "test_ck_6BYq7GWPVvNBGAjnaEZ4VNE5vbo1";

//주문 상세 페이지 컴포넌트
function OrderDetailPage() {
    const {id} = useParams();       //URL의 /orders/:id 값
    const navigate = useNavigate();     //페이지 이동
    const [detail, setDetail] = useState(null);     //주문 상세 테이터
    const [loading, setLoading] = useState(true);      //로딩 상태

    //주문상세정보
    useEffect(() => {       //페이지 진입 시 1회 호출
        const fetchDetail = async () => {       //상세 조회 함수
            try {
                setLoading(true);       //로딩 시작
                const data = await OrdersApi.detail(id);        //GET /orders/{id}
                setDetail(data);        //상태 저장
            } catch (e) {
                console.error(e);
                alert("주문 정보를 불러오지 못했습니다.");
            } finally {
                setLoading(false);      //로딩 종료
            }
        };
        fetchDetail();      //실행
    }, [id]);       //id 바뀌면 재조회


    //다운로드 버튼 클릭 핸들러
    const handleDownload = async(ebookId) => {
        if(!detail || detail.status !== "PAID") return;     //방어

        try {
            //다운로드 토큰 발급: POST /downloads/tokens?orderId=...&ebookId=...
            const res = await api.post("/downloads/tokens", null, {//바디 업싱 쿼리만 전송
                params: {orderId: detail.orderId || detail.id, ebookId},        //orderId/ebookId 전달
            });
            //다운로드 호출: 브라우저가 파일 다운로드 처리하도록 location 이동
            window.location.href = `${api.defaults.baseURL}/downloads/${res.data.token}`;        //파일 다운로드
        } catch(e) {
            alert("다운로드 실패")
        }
    };

    //결제 버튼
    const handlePay = async () => {

        try {
            //토스 객체 로드
            const tossPayment = await loadTossPayments(CLIENT_KEY);

            await tossPayment.requestPayment("카드", {
                amount: detail.totalAmount,
                orderId: detail.orderNumber,    //주문번호
                orderName: detail.items[0].title + (detail.items.length > 1 ? `외 ${detail.items.length - 1}건` : ""),
                customerName: "익명 구매자",
                //결제 성공/실패 시 이동할 페이지
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
            });
        } catch(error) {
            console.error("결제 에러:", error);
            if(error.code === "USER_CANCEL") {
                //사용자가 창을 닫거나 취소한 경우
            } else {
                alert("결제 요청 중 오류가 발생했습니다.")
            }
        }
    };

    if(loading) return <div style={{padding: 20}}>로딩중</div>       //초기 로딩
    if(!detail) return <div style={{padding: 20}}>주문 정보가 없습니다.</div>        //없음 처리

    return (
        <div className="ui-page">
            <Header/>
            <div style={{maxWidth: 800, margin: "0 auto", padding: 20}}>
                <h2 className="ui-title">주문 상세</h2>
                {msg && <p className="ui-muted" style={{color: "crimson"}}>{msg}</p>}

                {/*주문 정보 테이블*/}
                <div className="ui-grid">
                    <div className="ui-row">
                        <div className="col-title">주문번호</div>
                        <div className="col-price">{detail.orderNumber}</div>
                    </div>
                    <div className="ui-row">
                        <div className="col-title">상태</div>
                        <div className="col-price">
                            {/* 상태에 따라 색상 다르게 표시 */}
                            <span style={{
                                color: detail.status === "PAID" ? "green" : "orange",
                                fontWeight: "bold"
                            }}>
                                {detail.status}
                            </span>
                        </div>
                    </div>
                    <div className="ui-row">
                        <div className="col-title">총 금액</div>
                        <div className="col-price">{Number(detail.totalAmount).toLocaleString()}원</div>
                    </div>
                </div>
                {/* 구매 상품 목록 */}
                <h3 style={{marginTop: 30}}>구매 목록</h3>
                <ul style={{listStyle: "none", padding: 0}}>
                    {detail.items.map((item) => (
                        <li key={item.id} style={{borderBottom: "1px solid #eee", padding: "10px 0", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <span>{item.title}</span>
                            {detail.status === "PAID" ? (
                                <button className="ui-btn" onClick={() => handleDownload(item.ebookId)}>다운로드</button>
                            ) : (
                                <span style={{fontSize: 12, color: "#999"}}>결제 후 다운로드 가능</span>
                            )}
                        </li>
                    ))}
                </ul>

                {/* 결제 위젯 영역 */}
                {detail.status === "PENDING" && (
                    <div style={{marginTop: 40, textAlign: "center"}}>
                        <button
                            className="ui-btn"
                            style={{width: "100%", backgroundColor: "#3366FF", color: "white", height: 50, fontSize: 16}}
                            onClick={handlePay}
                        >
                            결제하기
                        </button>
                    </div>
                )}

                <div style={{marginTop: 20, textAlign: "right"}}>
                    <button className="ui-btn" onClick={() => navigate("/orders")}>목록으로</button>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailPage;