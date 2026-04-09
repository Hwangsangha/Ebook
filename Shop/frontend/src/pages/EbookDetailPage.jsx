import { useEffect, useState } from "react"; // 상태/생명주기
import { useNavigate, useParams } from "react-router-dom"; // url 파라미터(:id), 이동
import api from "../api"; // api(직접 호출)
import Header from "../components/Header";

function EbookDetailPage() {
  const { id } = useParams(); // URL의 /ebooks/:id 에서 id 추출
  const navigate = useNavigate(); // 버튼 클릭 시 페이지 이동
  const [ebook, setEbook] = useState(null);  //상세 데이터

  const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8080";

  // 로딩/메시지
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // 상세 조회: GET /ebooks/{id}
  const fetchDetail = async () => {
    setLoading(true);
    setMsg("");

    try {
      const res = await api.get(`/api/ebooks/${id}`); // axios 직접 호출
      setEbook(res.data); // 응답 데이터 저장
    } catch (e) {
      setMsg("상세 조회 실패");
      console.log("[DETAIL ERROR]", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // 담기 버튼: CartApi.addItem 사용(unwrap 적용)
  const handleAddToCart = async () => {
    setMsg("");

    //백엔드에 userId보여주기
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("accessToken");

    if(!userId) {
      alert("로그인이 필요합니다. 다시 로그인해주세요.");
      navigate("/login");
      return;
    }

    try {
      // POST /carts?ebookId=
      await api.post("/cart/items", {
        userId: Number(userId),
        ebookId: Number(id),
        quantity: 1
      },
      {
        headers: {
          Authorization: `Bearer ${token}`  //스프링에 토큰 보여주기
        }
      }
    );

      if(window.confirm("장바구니에 담겼습니다. 이동하시겠습니까?")) {
        navigate("/cart");
      } else {
        setMsg("장바구니에 담김");
      }
    } catch (e) {
      const errMsg = e.response?.data?.message || "담기 실패";
      setMsg(errMsg);
      console.log("[ADD CART ERROR]", e);
    }
  };

  // 바로 구매 버튼
  const handleBuyNow = async () => {
    //데이터가 아직 로딩 안됐으면 클릭 방지
    if(!ebook) return;

    //사용자 의사 확인
    if(!window.confirm(`${ebook.title}을(를) 바로 구매하시겠습니까?`)) {
      return;
    }

    try {
      //주문 생성 API호출(백엔드 ebook.id를 보냄)
      const response = await api.post("/orders", null, {
        params: {ebookId: Number(id)}
      });

      //생성된 주문 번호 가져오기
      const newOrderId = response.data.orderId || response.data.id;

      alert("주문서가 생성되었습니다. 결제 페이지로 이동합니다.");
      navigate(`/orders/${newOrderId}`);    //새 주문서 페이지로 이동
    } catch(err) {
      console.error("주문 생성 실패:", err);
      //에러 메시지 보여주기
      const errMsg = err.response?.data?.message || "주문에 실패했습니다.";
      alert(errMsg);

      //만약 로그인이 안되어 실패한거면(401), 로그인 페이지로 이동
      if(err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  //로딩화면
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // 에러 또는 데이터 없을 때 디자인
  if (!ebook) {
    return (
        <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-base-content/20 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-base-content mb-4">전자책을 찾을 수 없습니다</h2>
            <p className="text-error mb-8">{msg || "삭제되었거나 존재하지 않는 상품입니다."}</p>
            <button className="btn btn-primary px-8" onClick={() => navigate(-1)}>이전 페이지로 돌아가기</button>
        </div>
    );
  }

// 3. 메인 상세 페이지 디자인
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* 뒤로가기 버튼 */}
        <button 
            onClick={() => navigate(-1)} 
            className="btn btn-ghost btn-sm px-0 mb-6 text-base-content/60 hover:text-base-content hover:bg-transparent"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            목록으로 돌아가기
        </button>

        {/* 상단 알림 메시지 영역 (토스트 스타일) */}
        {msg && (
            <div className={`alert mb-8 shadow-sm ${msg.includes("성공적으로") ? "alert-success text-white" : "alert-error text-white"}`}>
                <span>{msg}</span>
            </div>
        )}

        {/* 메인 콘텐츠 영역 (PC는 좌우, 모바일은 상하 배치) */}
        <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
            
            {/* 좌측: 책 표지 (썸네일) 영역 */}
            <div className="w-full md:w-1/3 lg:w-[35%] shrink-0">
                <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-base-200 bg-base-200 flex items-center justify-center relative">
                    {ebook.thumbnail ? (
                        <img
                            src={`${BASE_URL}/uploads/${ebook.thumbnail}`}
                            alt={ebook.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        // 이미지가 없을 때 보여줄 예쁜 플레이스홀더 (목록 페이지와 통일)
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-base-200 to-base-300 opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4 text-base-content/30">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                            </svg>
                            <span className="text-sm font-bold text-base-content/50 break-keep">{ebook.title}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 우측: 책 정보 및 결제 버튼 영역 */}
            <div className="flex-1 flex flex-col pt-2">
                {/* 상태 뱃지 */}
                <div className="mb-4">
                    <span className={`badge badge-lg ${ebook.status === '판매중' || !ebook.status ? 'badge-primary badge-outline' : 'badge-error badge-outline'}`}>
                        {ebook.status || "판매중"}
                    </span>
                </div>

                {/* 책 제목 */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-base-content mb-6 leading-tight break-keep">
                    {ebook.title}
                </h1>

                {/* 가격 정보 */}
                <div className="mb-8">
                    <span className="text-4xl font-black text-primary tracking-tight">
                        {Number(ebook.price).toLocaleString()}<span className="text-2xl font-bold ml-1 text-base-content">원</span>
                    </span>
                </div>

                <div className="divider mb-8"></div>

                {/* 책 설명 영역 */}
                <div className="mb-10 flex-1">
                    <h3 className="text-xl font-bold mb-4 text-base-content/80 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        책 소개
                    </h3>
                    <div className="bg-base-200/50 p-6 rounded-2xl text-base-content/80 leading-loose whitespace-pre-wrap text-[15px] shadow-inner border border-base-200">
                        {ebook.description ? ebook.description : "이 책에 대한 상세 설명이 아직 등록되지 않았습니다."}
                    </div>
                </div>

                {/* 하단 액션 버튼 (장바구니 / 바로 구매) */}
                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                    <button 
                        onClick={handleAddToCart} 
                        className="btn btn-outline border-2 border-primary text-primary hover:bg-primary hover:text-white btn-lg flex-1 rounded-xl text-lg transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                        </svg>
                        장바구니 담기
                    </button>
                    <button 
                        onClick={handleBuyNow} 
                        className="btn btn-primary btn-lg flex-1 rounded-xl text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
                    >
                        바로 구매하기
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}

export default EbookDetailPage;
