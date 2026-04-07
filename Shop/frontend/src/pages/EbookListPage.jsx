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

    //카테고리 상태(기본값 ALL)
    const [category, setCategory] = useState("ALL");

    //화면에 보여줄 카테고리 목록 정의
    const CATEGORIES = [
        {id: "ALL", label: "전체"},
        {id: "IT", label: "IT/프로그래밍"},
        {id: "NOVEL", label: "소설/문학"},
        {id: "BUSINESS", label: "경제/경영"},
        {id: "ETC", label: "기타"}
    ];

    //데이터 불러오는 로직을 별도 함수로 분리(검색어 q를 받음)
    const fetchEbooks = (q = "", page = 0, category = "ALL") => {
        setLoading(true);
        //EbookApi.list에 검색어 전달
        EbookApi.list(q, page, 10, category)
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
        fetchEbooks(keyword, currentPage, category);    //처음에 빈 검색어로 전체 목록 호출
    }, [currentPage, category]);

    //검색 버튼 눌렀을 때 실행되는 함수
    const handleSearch = () => {
        setCurrentPage(0);
        fetchEbooks(keyword, 0, category);
    };

    //카테고리 버튼
    const handleCategoryClick = (catId) => {
        setCategory(catId);
        setCurrentPage(0);  //카테고리 바뀌면 무조건 1페이지로 리셋
    };

    //로딩 화면 디자인 적용(daisyUI 스피너)
    if (loading) return(
        <div className="flex justtify-center items-center min-h-[50vh]">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );

    // 에러 화면 디자인 적용
    if (error) return(
        <div className="container mx-auto p-4 mt-10">
            <div className="alert alert-error shadow-lg max-w-2xl mx-auto">
                <span>에러: {error}</span>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Toast message={toast}/>

            <div className="flex justify-between items-end mb-6">
                <h1 className="text-3xl font-bold text-gray-800">전자책 목록</h1>
            </div>

            {/* 카테고리 탭 ui */}
            <div className="flex flex-nowrap gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map(c => (
                    <button
                        className={`btn btn-sm rounded-full px-5 ${
                            category === c.id
                            ? "btn-primary"
                            : "btn-outline border-gray-300 text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {/* 검색창 ui */}
            <div className="flex gap-2 mb-8">
                <input
                    type="text"
                    placeholder="책 제목을 검색해보세요"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => {
                        //엔터키 쳤을때 검색
                        if(e.key === 'Enter') fetchEbooks(keyword);
                    }}
                    className="input input-bordered w-full max-w-md focus:border-primary focus:ring-primary"
                />
                <button className="btn btn-primary px-8" onClick={handleSearch}>검색</button>
            </div>

            {/* 결과가 없을 때 처리 */}
            {!ebooks || ebooks.length === 0 ? (
                <div className="py-20 text-center bg-base-200 rounded-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-lg text-gray-500">검색 결과가 없습니다.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* 데스크톱 전용헤더(모바일에선 숨김) */}
                    <div className="hidden md:flex bg-gray-50 p-4 font-bold text-gray-500 text-sm border-b border-gray-200">
                        <div className="flex-1 pl-2">제목</div>
                        <div className="w-32 text-center">저자</div>
                        <div className="w-32 text-right pr-6">가격</div>
                        <div className="w-24 text-center">장바구니</div>
                    </div>

                    {/* 전자책 리스트 */}
                    <div className="flex flex-col">
                        {ebooks.map((e) => (
                            <div className="flex flex-col md:flex-row items-start md:items-center p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200" key={e.id}>
                                {/* 책 제목 영역 */}
                                <div 
                                    className="flex-1 w-full flex flex-col mb-3 md:mb-0 cursor-pointer pl-2"
                                    onClick={() => navigate(`/ebooks/${e.id}`)}
                                    >
                                    <div className="mb-1">
                                        {/* 카테고리 뱃지 */}
                                        <span className="badge badge-ghost badge-sm text-xs text-gray-500 border-gray-300">
                                            {CATEGORIES.find(c => c.id === (e.category || "ETC"))?.label || "기타"}
                                        </span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-800 hover:text-primay transition=colors">
                                        {e.title}
                                    </span>
                                </div>
                                {/* 저자, 가격, 버튼 영역 */}
                                <div className="w-full md:w-32 text-sm text-gray-500 md:text-center mb-2 md:mb-0">
                                    {e.author}
                                </div>
                                <div className="w-full md:w-32 text-lg font-bold text-gray-900 md:pr-6 mb-3 md:mb-0">
                                    {Number(e.price).toLocaleString()}원
                                </div>
                                <div className="w-full md:w-24 md:text-center">
                                    <button
                                        className="btn btn-sm btn-primary w-full md:w-auto"
                                        onClick={async (event) => {
                                            event.stopPropagation();    //장바구니 버튼 클릭시 상세페이지로 이동 현상 방지
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
