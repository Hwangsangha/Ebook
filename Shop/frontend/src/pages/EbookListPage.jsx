//전자책 목록 페이지

import "../styles/ui.css";
import { useEffect, useState } from "react";
import { CartApi, EbookApi } from "../api";
import Header from "../components/Header";
import Toast from "../components/Toast";

function EbookListPage() {
    const [ebooks, setEbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = 1;
    const [toast, setToast] = useState("");

    useEffect(() => {
        console.log("API BASE:", import.meta.env.VITE_API_BASE);

        EbookApi.list()
            .then(data => {
                console.log("응답 전체: ", data);
                setEbooks(data.items);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>불러오는 중...</p>;
    if (error) return <p>에러: {error}</p>;
    if (!ebooks || ebooks.length === 0) return <p>등록된 전자책이 없습니다.</p>;

    return (
        <div className="ui-page">
            <Header />
            <Toast message={toast}/>
            <h1 className="ui-title">전자책 목록</h1>

            <div className="ui-grid">
                <div className="ui-row ui-header">
                    <div className="col-title">제목</div>
                    <div className="col-author">저자</div>
                    <div className="col-price">가격</div>
                    <div className="col-action"></div>
            </div>

            {ebooks.map((e) => (
                <div className="ui-row" key={e.id}>
                    <div className="col-title ellipsis">{e.title}</div>
                    <div className="col-author ellipsis">{e.author}</div>
                    <div className="col-price">{Number(e.price).toLocaleString()}원</div>
                    <div className="col-action">
                        <button
                            className="ui-btn"
                            onClick={async () => {
                                try {
                                    await CartApi.addItem({userId, ebookId: e.id, quantity: 1});
                                    setToast("장바구니에 담았습니다.");
                                    setTimeout(() => setToast(""), 1200);
                                } catch (err) {
                                    setToast(err.message || "실패");
                                    setTimeout(() => setToast(""), 1600);
                                }
                            }}
                        >
                            담기
                        </button>
                    </div>
                </div>
            ))}
            </div>
        </div>

    )
}

export default EbookListPage;