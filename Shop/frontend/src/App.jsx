import { Routes, Route, Link } from "react-router-dom";
import SummaryPage from "./pages/SummaryPage";
import CartPage from "./pages/CartPage";
import EbookListPage from "./pages/EbookListPage";
import LoginPage from "./pages/LoginPage";
import AdminEbooksPage from "./admin/AdminEbooksPage";
import EbookDetailPage from "./pages/EbookEdtailPage"
import { Navigate } from "react-router-dom";
import OrdersPage from "./pages/OrdersPage";

function App() {
  return (
    <div style={{padding: 24, fontFamily: "system-ui"}}>
      <nav style={{marginBottom: 20}}>
        <Link to="/" style={{margin: 16}}>Home</Link>
        <Link to="/cart" style={{margin: 16}}>장바구니</Link>
        <Link to="/ebooks" style={{marginRight: 16}}>전자책</Link>
        <Link to="/admin/ebooks" style={{marginRight: 16}}>관리자</Link>
      </nav>

      <Routes>

        {/* 공개 라우트 */}
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/" element={<EbookListPage/>}/>
        <Route path="/ebooks" element={<EbookListPage/>}/>
        <Route path="/ebooks/:id" element={<EbookDetailPage/>}/>

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

function RequireAuth({children}) {
  if(!localStorage.getItem("accessToken")) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default App;

//앱 전체의 라우팅을 담당하는 컴포넌트
//각 페이지들을 Routes로 연결