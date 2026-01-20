import { Routes, Route, Link, useNavigate } from "react-router-dom";
import SummaryPage from "./pages/SummaryPage";
import CartPage from "./pages/CartPage";
import EbookListPage from "./pages/EbookListPage";
import LoginPage from "./pages/LoginPage";
import AdminEbooksPage from "./admin/AdminEbooksPage";
import EbookDetailPage from "./pages/EbookDetailPage"
import { Navigate } from "react-router-dom";
import OrdersPage from "./pages/OrdersPage";
import RequireAuth from "./auth/RequireAuth";   //로그인 필요 가드
import RegisterPage from "./pages/RegisterPage";
import { clearAuth } from "./api";


function App() {
  const navigate = useNavigate();   //페이지 이동 여부
  const isAuthed = !!localStorage.getItem("accessToken");   //로그인 여부
  const role = localStorage.getItem("role");    //권한(USER/ADMIN)

  const handleLogout = () => {    //로그아웃 처리
    clearAuth();    //토큰/userId/role 삭제
    navigate("/login");   //로그인으로 이동
  }

  return (
    <div style={{padding: 24, fontFamily: "system-ui"}}>
      <nav style={{marginBottom: 20, display: "flex", gap: 16, alignItems: "center"}}>
        <Link to="/">Home</Link>
        <Link to="/ebooks">전자책</Link>

        {isAuthed && (    //로그인 했을때만
          <>
            <Link to="/cart">장바구니</Link>
            <Link to="/orders">주문</Link>
            <Link to="/summary">요약</Link>
          </>
        )}

        {isAuthed && role === "ADMIN" && (    //ADMIN만 노출
          <Link to="/admin/ebooks">관리자</Link>
        )}

        <div style={{marginLeft: "auto", display: "flex", gap: 12, alignItems: "center"}}>
          {isAuthed ? (   //로그인 상태면
            <>
              <span style={{fontSize: 12, color: "#666"}}>role: {role}</span>   //역할 표시
              <button onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login">로그인</Link>
              <Link to="/register">회원가입</Link>
            </>
          )}
        </div>
      </nav>

      <Routes>

        {/* 공개 라우트 */}
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/" element={<EbookListPage/>}/>
        <Route path="/ebooks" element={<EbookListPage/>}/>
        <Route path="/ebooks/:id" element={<EbookDetailPage/>}/>
        <Route path="/register" element={<RegisterPage/>}/>

        {/* 로그인 필요 */}
        <Route
          path="/summary"
          element={<RequireAuth> <SummaryPage/> </RequireAuth>}/>
        <Route 
          path="/cart"
          element={<RequireAuth> <CartPage/> </RequireAuth>}/>
        <Route
          path="/orders"
          element={<RequireAuth> <OrdersPage/> </RequireAuth>}/>

        {/* 관리자 라우트 */}
        <Route
          path="/admin/ebooks"
          element={<RequireAdmin> <AdminEbooksPage /> </RequireAdmin>}/>
      </Routes>
    </div>
  );
}

function RequireAdmin({children}) {
  const token = localStorage.getItem("accessToken");  //로그인 여부
  const role = localStorage.getItem("role");  //권한

  //로그인 상태 아닐시 로그인 페이지로 이동
  if(!token) {
    return <Navigate to="/login" replace />;
  }

  // ADMIN 아니면 접근 차단
  if(role !== "ADMIN") {
    return <div style={{padding: 24}}>ADMIN 권한이 필요합니다.</div>;
  }

  return children;  //통과 시 실제 페이지 렌더링
}


export default App;

//앱 전체의 라우팅을 담당하는 컴포넌트
//각 페이지들을 Routes로 연결