import { useEffect, useState } from "react"; // 상태/생명주기
import { useNavigate, useParams } from "react-router-dom"; // url 파라미터(:id), 이동
import api, { CartApi, EbookApi, OrdersApi } from "../api"; // api(직접 호출), CartApi(unwrap 적용)

function EbookDetailPage() {
  const { id } = useParams(); // URL의 /ebooks/:id 에서 id 추출
  const navigate = useNavigate(); // 버튼 클릭 시 페이지 이동

  // 상세 데이터
  const [ebook, setEbook] = useState(null);

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
    try {
      // 임시 유저 ID 필요하면 여기서 고정값으로 넣는다
      const userId = 1;

      await CartApi.addItem({
        userId,
        ebookId: Number(id),
        quantity: 1,
      });

      setMsg("장바구니에 담김");
    } catch (e) {
      setMsg(e.message || "담기 실패");
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
      const response = await OrdersApi.create(ebook.id);

      //생성된 주문 번호 가져오기
      const newOrderId = response.id;

      alert("주문서가 생성되었습니다. 결제 페이지로 이동합니다.");
      navigate(`/orders/${newOrderId}`);    //새 주문서 페이지로 이동
    } catch(err) {
      console.error("주문 생성 실패:", err);
      //에러 메시지 보여주기
      const errMsg = err.response?.data?.message || "주문에 실패했습니다.";
      alert(errMsg);
    }

    
  };

  if (loading) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <p>로딩중...</p>
      </div>
    );
  }

  if (!ebook) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h2>전자책 상세</h2>
        <p style={{ color: "crimson" }}>{msg || "데이터 없음"}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 900, margin: "0 auto" }}>
      <h2>전자책 상세</h2>

      {msg && <p style={{ color: msg.includes("담김") ? "green" : "crimson" }}>{msg}</p>}

      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
        {/* 썸네일: 없으면 회색 박스 */}
        <div style={{ width: 200, height: 260, border: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {ebook.thumbnailUrl ? (
            <img
              src={ebook.thumbnailUrl}
              alt="thumbnail"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: "#888" }}>NO IMAGE</span>
          )}
        </div>

        {/* 정보 영역 */}
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 8px" }}>{ebook.title}</h3>

          <p style={{ margin: "0 0 8px" }}>
            <b>가격:</b> {ebook.price}
          </p>

          <p style={{ margin: "0 0 8px" }}>
            <b>상태:</b> {ebook.status}
          </p>

          <p style={{ whiteSpace: "pre-wrap" }}>
            <b>설명:</b>{" "}
            {ebook.description ? ebook.description : "설명 없음"}
          </p>

          {/* 액션 버튼 */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={handleAddToCart}>장바구니 담기</button>
            <button onClick={handleBuyNow}>바로 구매(임시)</button>
            <button onClick={() => navigate(-1)}>뒤로</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EbookDetailPage;
