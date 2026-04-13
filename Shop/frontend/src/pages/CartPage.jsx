import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CartApi } from "../api";
import Toast from "../components/Toast";

function CartPage(){
    const [items, setItems] = useState([]); //장바구니 항목 배열
    const [error, setError] = useState(null); //에러 저장
    const [loading, setLoading] = useState(true); //로딩 상태
    const [toast, setToast] = useState("");
    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 1200);
        };
    const navigate = useNavigate();

    //페이지 처음 로딩 시 실행
    useEffect(() => {
        setLoading(true);

        CartApi.listItems(1)  //userId = 1 가정
            .then(data => {
                setItems(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || String(err));
                setLoading(false);
            });
    }, []);

    // 수량 증가
    function handleIncrease(item){
        const newQty = item.quantity + 1;
        CartApi.setQuantity({
            userId: 1,
            ebookId: item.ebookId,
            quantity: newQty
        })
        .then(() => {
            //성공하면 화면에 즉시 업뎃
            setItems(prev =>
                prev.map(i => 
                    i.ebookId === item.ebookId ? {...i, quantity: newQty, subTotal: i.price * newQty} : i
                )
            );
        })
        .catch(err => alert("증가 실패: " + err.message));
    };


    // 수량 감소
    function handleDecrease(item){
        const newQty = Math.max(1, item.quantity - 1);

        CartApi.setQuantity({
            userId: 1,
            ebookId: item.ebookId,
            quantity: newQty
        })
        .then(() => {
            setItems(prev =>
                prev.map(i =>
                    i.ebookId === item.ebookId ? { ...i, quantity: newQty, subTotal: i.price * newQty} : i
                )
            );
        })
        .catch(err => alert("감소 실패: " + err.message));
    }

    //항목 삭제
    function handleRemove(item){
        if(!confirm("이 항목을 삭제하시겠습니까?")) return;

        //로컬 스토리지에서 현재 로그인한 유저의 아이디 꺼내기
        const currentUserId = localStorage.getItem("userId");

        if(!currentUserId) {
            alert("로그인 정보가 없습니다.");
            return;
        }

        CartApi.removeItem({
            userId: Number(currentUserId),  //꺼내온 아이디를 숫자로 변환해서 넣기
            ebookId: item.ebookId
        })
        .then(() => {
            //화면에서 즉시 제거
            setItems(prev =>
                prev.filter(i => i.ebookId !== item.ebookId)
            );
        })
        .catch(err => alert("삭제 실패: " + err.message));
    }

    //에러 발생시 ui
    if(error) return(
        <div className="container mx-auto p-4 mt-10 max-w-3xl">
            <div className="alert alert-error shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>에러: {error}</span>
            </div>
        </div>
    );

    //로딩 중 ui
    if(loading) return(
        <div className="flex justify-center items-center min-h-[60vh]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );

    //장바구니 비었을 때 ui
    if(items.length === 0) {
        return(
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                
                <div className="flex flex-col items-center justify-center py-20 bg-base-200/30 rounded-3xl mt-8 border border-base-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-base-content/20 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <h2 className="text-2xl font-bold text-base-content mb-2">장바구니가 비어있습니다.</h2>
                    <p className="text-base-content/60 mb-8">원하는 전자책을 찾아 장바구니에 담아보세요.</p>
                    <button className="btn btn-primary px-8" onClick={() => navigate("/")}>쇼핑 계속하기</button>
                </div>
            </div>
        );
    }

    //항목 있을때
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl mb-20">
            <Toast message={toast}/>
            
            <h1 className="text-3xl font-extrabold text-base-content tracking-tight mt-8 mb-8 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                장바구니
            </h1>

            {/* 장바구니 리스트 영역 */}
            <div className="bg-base-100 rounded-3xl shadow-sm border border-base-200 overflow-hidden mb-8">
                
                {/* 데스크톱 헤더 */}
                <div className="hidden md:flex bg-base-200/50 p-4 font-bold text-base-content/60 text-sm border-b border-base-200">
                    <div className="flex-1 pl-4">상품정보</div>
                    <div className="w-32 text-center">수량</div>
                    <div className="w-32 text-right">상품금액</div>
                    <div className="w-24 text-center">선택</div>
                </div>

                {/* 개별 아이템 렌더링 */}
                <div className="flex flex-col divide-y divide-base-200">
                    {items.map((item) => (
                        <div className="flex flex-col md:flex-row items-start md:items-center p-5 gap-4 hover:bg-base-200/20 transition-colors" key={item.ebookId}>
                            
                            {/* 상품 썸네일 & 제목 */}
                            <div className="flex-1 w-full flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/ebooks/${item.ebookId}`)}>
                                {/* 가짜 표지 썸네일 (책 느낌) */}
                                <div className="w-16 h-24 bg-gradient-to-br from-base-200 to-base-300 rounded-md border border-base-300 flex items-center justify-center shrink-0 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-base-content hover:text-primary transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-base-content/60 mt-1">{Number(item.price).toLocaleString()}원</p>
                                </div>
                            </div>

                            {/* 수량 조절 버튼 (daisyUI Join) */}
                            <div className="w-full md:w-32 flex justify-start md:justify-center mt-2 md:mt-0">
                                <div className="join border border-base-300 shadow-sm">
                                    <button 
                                        className="btn btn-sm join-item bg-base-100 px-3 hover:bg-base-200" 
                                        disabled={item.quantity <= 1} 
                                        onClick={() => handleDecrease(item)}
                                    >
                                        −
                                    </button>
                                    <div className="btn btn-sm join-item bg-base-100 pointer-events-none px-4 font-bold">
                                        {item.quantity}
                                    </div>
                                    <button 
                                        className="btn btn-sm join-item bg-base-100 px-3 hover:bg-base-200" 
                                        onClick={() => handleIncrease(item)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* 소계 (상품별 총액) */}
                            <div className="w-full md:w-32 text-left md:text-right text-lg font-extrabold text-base-content mt-2 md:mt-0">
                                {Number(item.subTotal).toLocaleString()}원
                            </div>

                            {/* 삭제 버튼 */}
                            <div className="w-full md:w-24 flex justify-end md:justify-center mt-2 md:mt-0">
                                <button 
                                    className="btn btn-ghost btn-sm text-base-content/40 hover:text-error hover:bg-error/10" 
                                    onClick={() => handleRemove(item)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

            {/* 결제 요약 푸터 (영수증 스타일) */}
            <div className="bg-base-200/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 border border-base-200">
                <div className="flex flex-col items-center md:items-start w-full md:w-auto">
                    <span className="text-base-content/60 font-medium mb-1">
                        총 수량: {items.reduce((sum, i) => sum + i.quantity, 0)}권
                    </span>
                    <div className="text-2xl md:text-3xl font-black text-base-content">
                        총 결제 예상 금액: <span className="text-primary">{items.reduce((sum, i) => sum + Number(i.subTotal), 0).toLocaleString()}</span>원
                    </div>
                </div>
                
                <button
                    className="btn btn-primary btn-lg w-full md:w-auto rounded-xl px-10 shadow-lg shadow-primary/30"
                    disabled={!items || items.length === 0}
                    onClick={() => navigate("/summary")}
                >
                    주문 요약 및 결제하기
                </button>
            </div>
        </div>
    );
}

export default CartPage;