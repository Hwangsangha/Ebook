import "../styles/ui.css";
import { useEffect, useState } from "react";
import {CartApi} from "../api";
import Header from "../components/Header";

function SummaryPage(){
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);
    const userId = 1;
    const [paid, setPaid] = useState(false);
    
    useEffect(() => {
        CartApi.summary(1)
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
                    <button className="ui-btn" onClick={() => setPaid(false)}>
                        다시 보기
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
        </div>
);

}

export default SummaryPage;