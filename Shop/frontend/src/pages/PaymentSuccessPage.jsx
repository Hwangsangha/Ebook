import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import Header from "../components/Header";

function PaymentSuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isConfirming, setIsConfirming] = useState(true);

    useEffect(() => {
        //URL에서 토스가 준 정보 꺼내기
        const paymentKey = searchParams.get("paymentKey");
        const orderId = searchParams.get("orderId");
        const amount = searchParams.get("amount");

        //백엔드로 승인 요청 보내기
        async function confirm() {
            try {
                await api.post("/payments/confirm", {
                    paymentKey,
                    orderId,
                    amount: Number(amount),
                });
                alert("결제가 완료되었습니다! 다운로드 버튼이 활성화됩니다.");
                navigate("/orders");    //주문 목록으로 이동
            } catch(err) {
                console.error(err);
                alert(err.response?.data?.message || "결제승인 실패");
                navigate("/orders");
            } finally {
                setIsConfirming(false);
            }
        }
        confirm();
    }, [searchParams, navigate]);

    return (
        <div className="ui-page">
            <Header/>
            <div style={{textAlign: "center", marginTop: 100}}>
                <h2>{isConfirming ? "결제 확인 중" : "결제완료"}</h2>
                <p>잠시만 기다려주세요.</p>
            </div>
        </div>
    )
}
export default PaymentSuccessPage;