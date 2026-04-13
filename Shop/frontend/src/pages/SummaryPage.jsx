import { useEffect, useState } from "react";
import { CartApi, OrdersApi } from "../api";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

function SummaryPage(){
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);
    const [orderId, setOrderId] = useState(null);       // 생성된 주문 id 저장
    const [processing, setProcessing] = useState(false); // 버튼 중복 클릭 방지
    const navigate = useNavigate();
    
    useEffect(() => {
        CartApi.summary()
            .then(setSummary)
            .catch((err) => setError(err.message || String(err)));
    }, []);

    if (error) return (
        <div className="container mx-auto p-4 mt-10 max-w-2xl">
            <div className="alert alert-error shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>에러: {error}</span>
            </div>
        </div>
    );

    if (!summary) return (
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-base-content/50 font-medium">결제 정보를 불러오는 중입니다...</p>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl mb-20">
            
            <h1 className="text-3xl font-extrabold text-base-content tracking-tight mt-8 mb-8 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                주문 요약
            </h1>

            <div className="bg-base-100 rounded-3xl shadow-sm border border-base-200 overflow-hidden mb-8">
                <div className="p-8 md:p-10">
                    <h2 className="text-xl font-bold mb-6 border-b border-base-200 pb-4 text-base-content/80">최종 결제 정보</h2>
                    
                    <div className="flex justify-between items-center mb-4 text-lg">
                        <span className="text-base-content/60 font-medium">총 주문 수량</span>
                        <span className="font-bold text-base-content">{summary.totalQuantity}권</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-10">
                        <span className="text-base-content/60 font-medium text-lg">총 결제 금액</span>
                        <div className="text-right">
                            <span className="text-4xl font-black text-primary tracking-tight">
                                {Number(summary.totalAmount).toLocaleString()}
                            </span>
                            <span className="text-2xl font-bold ml-1 text-base-content">원</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-base-200">
                        {/* Step 1. 주문 생성 버튼 */}
                        <button
                            className={`btn btn-lg flex-1 rounded-xl text-lg transition-all ${
                                orderId 
                                ? 'bg-success/10 text-success border-success/20 hover:bg-success/20 hover:border-success/30 cursor-default' 
                                : 'btn-outline border-2 border-primary text-primary hover:bg-primary hover:text-white'
                            }`}
                            disabled={processing || summary.totalQuantity === 0 || !!orderId}
                            onClick={async () => {
                                try {
                                    setProcessing(true);
                                    const created = await OrdersApi.create();
                                    const id = created?.id ?? created?.orderId;
                                    if(!id) throw new Error("주문 ID를 받지 못했습니다.");
                                    setOrderId(id);
                                } catch(err) {
                                    setError(err?.message || "주문 생성 실패");
                                } finally {
                                    setProcessing(false);
                                }
                            }}
                        >
                            {processing && !orderId ? (
                                <><span className="loading loading-spinner"></span>처리중...</>
                            ) : orderId ? (
                                <><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> 주문서 생성됨</>
                            ) : (
                                "1. 주문서 생성하기"
                            )}
                        </button>

                        {/* Step 2. 결제 페이지 이동 버튼 (가짜 결제 대신 실제 결제창으로 이동) */}
                        <button 
                            className="btn btn-primary btn-lg flex-1 rounded-xl text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
                            disabled={!orderId}
                            onClick={() => {
                                // 💡 핵심: 가짜 결제 API 호출 대신, 토스 위젯이 있는 상세 페이지로 이동!
                                navigate(`/orders/${orderId}`);
                            }}
                        >
                            2. 실제 결제하기 (Toss)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SummaryPage;