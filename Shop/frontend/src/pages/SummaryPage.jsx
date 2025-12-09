import { useEffect, useState } from "react";
import {CartApi} from "../api";

function SummaryPage(){
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        CartApi.summary(1)
            .then(setSummary)
            .catch((err) => setError(err.message || String(err)));
    }, []);

    if(error) return <p>에러: {error}</p>;
    if(!summary) return <p>불러오는 중...</p>;

    return (
        <div>
            <h1>장바구니 요약</h1>
            <p>총 수량: {summary.totalQuantity}</p>
            <p>총 금액: {summary.totalAmount}</p>
        </div>
    );
}

export default SummaryPage;