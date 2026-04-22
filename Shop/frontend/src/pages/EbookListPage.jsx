//전자책 목록 페이지

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
                        key={c.id}
                        onClick={() => handleCategoryClick(c.id)}
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
            <div className="flex gap-2 mb-10 max-w-xl">
                <div className="relative w-full">
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
                    {/* 돋보기 아이콘 */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-3.5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 s1l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <button className="btn btn-primary px-8 shadow-sm" onClick={handleSearch}>검색</button>
            </div>

            {/* 결과가 없을 때 처리 */}
            {!ebooks || ebooks.length === 0 ? (
                <div className="py-24 text-center bg-base-200/50 rounded-3xl border border-base-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-base-content/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    <p className="text-lg text-base-content/60 font-medium">검색 결과가 없습니다.</p>
                </div>
            ) : (
                /* 바둑판 그리드 적용: 폰 2줄, 태블릿 3줄, PC 4~5줄 */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gird-cols-5 gap-x-6 gap-y-10">
                    {ebooks.map((e) => (
                        <div 
                            key={e.id} 
                            className="flex flex-col group cursor-pointer"
                            onClick={() => navigate(`/ebooks/${e.id}`)}
                        >
                            {/* 1. 책 표지 썸네일 영역 (비율 2:3 적용) */}
                            <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden border border-base-200 bg-gradient-to-br from-base-200 to-base-300 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 mb-4">
                                
                                {/* 가짜 표지 디자인 (이미지 URL이 없을 때 보여줌) */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center opacity-60">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-10 h-10 mb-2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                    </svg>
                                    <span className="text-xs font-bold line-clamp-3">{e.title}</span>
                                </div>

                                {/* 마우스 올렸을 때 어두워지면서 나타나는 오버레이 효과 */}
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            
                            {/* 2. 책 정보 영역 */}
                            <div className="flex flex-col flex-1 px-1">
                                {/* 카테고리 뱃지 */}
                                <div className="mb-1.5">
                                    <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                                        {CATEGORIES.find(c => c.id === (e.category || "ETC"))?.label || "기타"}
                                    </span>
                                </div>
                                
                                {/* 제목 (두 줄 넘어가면 ... 처리) */}
                                <h3 className="text-base font-bold text-base-content leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                    {e.title}
                                </h3>
                                
                                {/* 저자 */}
                                <p className="text-sm text-base-content/50 truncate mb-3">
                                    {e.author}
                                </p>
                                
                                {/* 3. 가격 및 장바구니 버튼 (하단 고정) */}
                                <div className="mt-auto flex items-end justify-between">
                                    <span className="text-lg font-extrabold text-base-content">
                                        {Number(e.price).toLocaleString()}원
                                    </span>
                                    
                                    {/* 깔끔한 아이콘 장바구니 버튼 */}
                                    <button
                                        className="btn btn-circle btn-sm bg-base-200 border-none hover:bg-primary hover:text-white text-base-content/70 transition-colors"
                                        onClick={async (event) => {
                                            event.stopPropagation(); // 상세페이지 이동 방지
                                            try {
                                                await CartApi.addItem({userId, ebookId: e.id, quantity: 1});
                                                setToast("장바구니에 담았습니다.");
                                                setTimeout(() => setToast(""), 1200);
                                            } catch (err) {
                                                setToast(err.message || "실패");
                                                setTimeout(() => setToast(""), 1600);
                                            }
                                        }}
                                        title="장바구니 담기"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 페이징 버튼 영역 */}
            {ebooks && ebooks.length > 0 && (
                <div className="flex justify-center items-center gap-2 mt-16 mb-10">
                    <button
                        className="btn btn-circle btn-outline btn-sm border-base-300"
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="font-semibold text-base-content/70 px-4">
                        {currentPage + 1} <span className="text-base-content/30 mx-1">/</span> {totalPages === 0 ? 1 : totalPages}
                    </span>
                    <button
                        className="btn btn-circle btn-outline btn-sm border-base-300"
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            )}
        </div>
    )
}
export default EbookListPage;