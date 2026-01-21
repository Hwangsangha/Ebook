import "../styles/ui.css";
import { useEffect, useState } from "react";
import {CartApi, OrdersApi} from "../api";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

function SummaryPage(){
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);
    const [paid, setPaid] = useState(false);
    const [orderId, setOrderId] = useState(null);       //생성된 주문 id저장
    const [processing, setProcessing] = useState(false);        //버튼 중복 클릭 방지
    const navigate = useNavigate();
    
    useEffect(() => {
        CartApi.summary()
            .then(setSummary)
            .catch((err) => setError(err.message || String(err)));
    }, []);

    if (error) return <p className="ui-muted">에러: {error}</p>;
    if (!summary) return <p className="ui-muted">불러오는 중...</p>;

    if(paid) {
        return (
            <div className="ui-page">
                <Header/>
                <h1 className="ui-title">결제 완료</h1>
                <p className="ui-muted">주문이 완료되었습니다.</p>

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12}}>
                    <button className="ui-btn" onClick={() => navigate("/orders")}>
                        주문 목록 보기
                    </button>
                    <button className="ui-btn" onClick={() => navigate("/")}>
                        전자책 목록으로
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="ui-page">
            <Header />
            <h1 className="ui-title">장바구니 요약</h1>

            <div className="ui-grid">
                <div className="ui-row ui-header">
                    <div className="col-title">항목</div>
                    <div className="col-price">값</div>
                </div>

                <div className="ui-row">
                    <div className="col-title">총 수량</div>
                    <div className="col-price">{summary.totalQuantity}</div>
                </div>

                <div className="ui-row">
                    <div className="col-title">총 금액</div>
                    <div className="col-price">
                        {Number(summary.totalAmount).toLocaleString()}원
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12}}>
                <button
                    className="ui-btn"
                    disabled={processing || !summary || summary.totalQuantity === 0 || !!orderId}
                    onClick={async () => {
                        try {
                            setError(null);     //에러 초기화

                            const created = await OrdersApi.create();       //주문 생성
                            const id = created?.id ?? created?.orderId;
                            
                            if(!id) throw new Error("주문 생성 응답에 id가 없습니다.");
                            setOrderId(id);      //orderId저장
                        } catch(err) {
                            setError(err?.message || "주문 생성 실패");      //에러 표시
                        }
                    }}
                >
                    {processing ? "처리중..." : orderId ? `주문생성됨(#${orderId})` : "주문 생성"}
                </button>

                <button 
                    className="ui-btn"
                    disabled={processing || !orderId}       //주문 있어야 결제가능
                    onClick={async () => {
                        try {
                            setError(null);
                            await OrdersApi.pay(orderId);       //결제(PAID)
                            setPaid(true);      //완료화면
                        } catch (err) {
                            setError(err?.message || "결제 실패")
                        }
                    }}
                >
                    {processing ? "처리중..." : "결제"}
                </button>
            </div>
        </div>
);

}

export default SummaryPage;