//전자책 목록 페이지

import "../styles/ui.css";
import { useEffect, useState } from "react";
import { CartApi, EbookApi } from "../api";
import Header from "../components/Header";
import Toast from "../components/Toast";
import { useNavigate } from "react-router-dom"; //상세페이지 이동용
import LogoutButton from "../components/LogoutButton";      //로그아웃 버튼

function EbookListPage() {
    const [ebooks, setEbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = 1;
    const [toast, setToast] = useState("");
    const navigate = useNavigate();

    //검색어 상태 추가
    const [keyword, setKeyword] = useState("");
    //데이터 불러오는 로직을 별도 함수로 분리(검색어 q를 받음)
    const fetchEbooks = (q = "") => {
        setLoading(true);
        //EbookApi.list에 검색어 전달
        EbookApi.list(q)
            .then(data => {
                setEbooks(data.items || []); //결과가 없을 대를 대비해 빈 배열 풀백
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }

    if (loading) return <p>불러오는 중...</p>;
    if (error) return <p>에러: {error}</p>;

    return (
        <div className="ui-page">
            <Toast message={toast}/>
            <h1 className="ui-title">전자책 목록</h1>

            {/* 검색창 ui */}
            <div style={{display: "flex", gap: "10px", marginBottom: "20px"}}>
                <input
                    type="text"
                    placeholder="책 제목을 검색해보세요"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => {
                        //엔터키 쳤을때 검색
                        if(e.key === 'Enter') fetchEbooks(keyword);
                    }}
                    style={{flex: 1, padding: "10px", border: "1px solid #ddd", borderRadius: "5px"}}
                />
                <button
                    className="ui-btn"
                    onClick={() => fetchEbooks(keyword)}
                >
                    검색
                </button>
            </div>

            {/* 결과가 없을 때 처리 */}
            {!ebooks || ebooks.length === 0 ? (
                <div style={{textAlign: "center", padding: "50px", color: "#666"}}>
                    검색 결과가 없습니다.
                </div>
            ) : (
                <div className="ui-grid">
                    <div className="ui-row ui-header">
                        <div className="col-title ellipsis">제목</div>
                        <div className="col-author ellipsis">저자</div>
                        <div className="col-price">가격</div>
                        <div className="col-action"></div>
                    </div>

                    {ebooks.map((e) => (
                        <div className="ui-row" key={e.id}>
                            <div 
                                className="col-title ellipsis"
                                style={{cursor: "pointer"}}
                                onClick={() => navigate(`/ebooks/${e.id}`)}
                                >
                                    {e.title}
                            </div>
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
            )}
        </div>
    )
}
export default EbookListPage;
