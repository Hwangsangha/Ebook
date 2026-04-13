import {useEffect, useState, useRef} from "react"      //React 훅
import {useNavigate, useParams} from "react-router-dom";        //라우팅 훅
import api, {OrdersApi} from "../api";       //주문 API(상세)
import {loadTossPayments} from "@tosspayments/payment-sdk";
import Header from "../components/Header";

const CLIENT_KEY = "test_ck_6BYq7GWPVvNBGAjnaEZ4VNE5vbo1";

//주문 상세 페이지 컴포넌트
function OrderDetailPage() {
    const {id} = useParams();       //URL의 /orders/:id 값
    const navigate = useNavigate();     //페이지 이동
    const [detail, setDetail] = useState(null);     //주문 상세 테이터
    const [loading, setLoading] = useState(true);      //로딩 상태

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

    //주문상세정보
    useEffect(() => {       //페이지 진입 시 1회 호출
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
                alert("결제 요청 중 오류가 발생했습니다.")
            }
        }
    };

    // 결제 취소 핸들러
    const handleCancel = async () => {
        if(!window.confirm("정말로 결제를 취소하고 환불받으시겠습니까?")) return;

        try {
            //api(axios)객체를 활용해 취소 api 호출
            await api.post(`/payments/${id}/cancel`, {
                cancelReason: "사용자 단순 변심(화면에서 직접 취소)"
            });

            alert("결제 취소 및 환불이 정상적으로 완료되었습니다.");

            //상태를 다시 불러오기 위해 화면을 새로고침(CANCELLED로 변경됨)
            window.location.reload();
        } catch(error) {
            //백엔드에서 던진 메시지가 있다면 보여주고, 아니면 기본 메시지
            const errMsg = error.response?.data?.message || "결제 취소 중 오류가 발생했습니다.";
            alert("환불 실패: " + errMsg);
        }
    };

    if(loading) return(
        <div className="flex justify-center items-center min-h-[60vh]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );
    if(!detail) return(
        <div className="container mx-auto p-10 text-center">
            <p className="text-xl font-bold opacity-50">주문 정보가 없습니다.</p>
            <button className="btn btn-ghost mt-4" onClick={() => navigate("/orders")}>목록으로 돌아가기</button>
        </div>
    );

return (
        <div className="container mx-auto px-4 py-8 max-w-3xl mb-20">
            
            <div className="flex justify-between items-center mt-10 mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight">주문 상세 내역</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/orders")}>목록으로</button>
            </div>

            {/* 1. 주문 요약 정보 (daisyUI Stats) */}
            <div className="stats shadow w-full border border-base-200 mb-8 bg-base-100">
                <div className="stat">
                    <div className="stat-title text-xs font-bold uppercase">주문번호</div>
                    <div className="stat-value text-lg break-all">{detail.orderNumber}</div>
                </div>
                <div className="stat">
                    <div className="stat-title text-xs font-bold uppercase">상태</div>
                    <div className="stat-value text-lg">
                        <div className={`badge badge-lg font-bold ${
                            detail.status === "PAID" ? "badge-success text-white" : 
                            detail.status === "PENDING" ? "badge-warning text-white" : "badge-ghost"
                        }`}>
                            {detail.status}
                        </div>
                    </div>
                </div>
                <div className="stat">
                    <div className="stat-title text-xs font-bold uppercase">총 금액</div>
                    <div className="stat-value text-primary text-2xl font-black">
                        {Number(detail.totalAmount).toLocaleString()}원
                    </div>
                </div>
            </div>

            {/* 2. 구매 상품 목록 */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
                <div className="card-body p-0">
                    <h3 className="text-xl font-bold p-6 bg-base-200/30 border-b border-base-200">구매 상품 목록</h3>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-base-200/10">
                                    <th className="py-4 pl-6">상품명</th>
                                    <th className="py-4 text-right pr-6">액션</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-100">
                                {detail.items.map((item) => (
                                    <tr key={item.id} className="hover:bg-base-200/20 transition-colors">
                                        <td className="py-6 pl-6">
                                            <div className="font-bold text-base">{item.title}</div>
                                        </td>
                                        <td className="py-6 text-right pr-6">
                                            {detail.status === "PAID" ? (
                                                <button 
                                                    className="btn btn-primary btn-sm rounded-lg"
                                                    onClick={() => handleDownload(item.ebookId)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                    </svg>
                                                    다운로드
                                                </button>
                                            ) : (
                                                <span className="text-xs text-base-content/40 font-medium">결제 대기 중</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 3. 하단 액션 버튼 영역 */}
            <div className="mt-12 space-y-4">
                {/* 결제하기 (PENDING 상태일 때만) */}
                {detail.status === "PENDING" && (
                    <button
                        className="btn btn-primary btn-lg w-full rounded-2xl shadow-lg shadow-primary/30 text-lg font-bold"
                        onClick={handlePay}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                        </svg>
                        지금 결제하기
                    </button>
                )}

                {/* 결제 취소/환불 (PAID 상태일 때만) */}
                {detail.status === "PAID" && (
                    <div className="bg-error/5 p-6 rounded-2xl border border-error/20 text-center">
                        <p className="text-sm text-error/70 mb-4">상품을 이미 다운로드했다면 환불이 어려울 수 있습니다.</p>
                        <button
                            className="btn btn-error btn-outline btn-sm px-8 rounded-xl"
                            onClick={handleCancel}
                        >
                            결제 취소 및 환불 요청
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderDetailPage;