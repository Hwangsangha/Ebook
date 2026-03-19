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

    //페이징 처리 상태
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);    //전체 페이지 수

    //데이터 불러오는 로직을 별도 함수로 분리(검색어 q를 받음)
    const fetchEbooks = (q = "", page = 0) => {
        setLoading(true);
        //EbookApi.list에 검색어 전달
        EbookApi.list(q, page)
            .then(data => {
                //응답 구조가 달라졌을까봐 안전장치 추가
                if(data && data.items) {
                    setEbooks(data.items);
                } else if(data && data.content) {
                    setEbooks(data.content);    //items가 아니라 content일 경우 
                } else {
                    setEbooks([]);
                }

                //전체 페이지 수 계산 로직
                if(data && data.totalPages !== undefined) {
                    setTotalPages(data.totalPages);
                } else if(data && data.total !== undefined && data.size) {
                    setTotalPages(Math.ceil(data.total / data.size));
                } else {
                    setTotalPages(1);
                }

                setLoading(false);
            })
            .catch(err => {
                setError(err.message || "데이터를 불러오지 못했습니다.");
                setLoading(false);
            });
    };

    //처음 렌더링 되거나, currentPage가 바뀔때마다 데이터를 다시 불러옴
    useEffect(() => {
        fetchEbooks(keyword, currentPage);    //처음에 빈 검색어로 전체 목록 호출
    }, [currentPage]);

    //검색 버튼 눌렀을 때 실행되는 함수
    const handleSearch = () => {
        setCurrentPage(0);
        fetchEbooks(keyword, 0);
    };

    if (loading) return <p style={{padding: 20}}>불러오는 중...</p>;
    if (error) return <p style={{padding: 20, color: "red"}}>에러: {error}</p>;

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
                <button className="ui-btn" onClick={handleSearch}>검색</button>
            </div>

            {/* 결과가 없을 때 처리 */}
            {!ebooks || ebooks.length === 0 ? (
                <div style={{textAlign: "center", padding: "50px", color: "#666"}}>
                    검색 결과가 없습니다.
                </div>
            ) : (
                <div>
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
                                    style={{cursor: "pointer", fontWeight: "bold"}}
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

                    {/* 페이징 버튼 영역 */}
                    <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", marginTop: "30px"}}>
                        <button
                            className="ui-btn"
                            disabled={currentPage === 0}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            style={{opacity: currentPage === 0 ? 0.5 : 1, cursor: currentPage === 0 ? "not-allowed" : "pointer"}}
                        >
                            이전
                        </button>

                        <span style={{fontWeight: "bold", fontSize: "16px"}}>
                            {currentPage + 1} / {totalPages === 0 ? 1 : totalPages}
                        </span>

                        <button
                            className="ui-btn"
                            disabled={currentPage >= totalPages - 1}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            style={{opacity: currentPage >= totalPages - 1 ? 0.5 : 1, cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer"}}
                        >
                            다음
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
export default EbookListPage;
