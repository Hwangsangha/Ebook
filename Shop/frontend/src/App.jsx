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
import OrderDetailPage from "./pages/OrderDetailPage";
import OrderListPage from "./pages/OrderListPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import AdminOrdersPage from "./admin/AdminOrdersPage";
import Header from "./components/Header";
import MyOrderListPage from "./pages/MyOrderListPage";
import OAuth2RedirectPage from "./pages/OAuth2RedirectPage";

function App() {
  return (
    <div style={{padding: 24, fontFamily: "system-ui"}}>
      <Header/>

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
          path="/orders/:id"
          element={<RequireAuth><OrderDetailPage/></RequireAuth>}/>

        {/* <Route
          path="/orders"
          element={<RequireAuth><OrderListPage/></RequireAuth>}/> */}

        <Route
          path= "/payment/success"
          element= {<RequireAuth><PaymentSuccessPage/></RequireAuth>} />
        
        <Route
          path="/payment/fail"
          element={<RequireAuth><div style={{padding:50, textAlign:"center"}}>결제가 취소되었습니다.</div></RequireAuth>}/>

        <Route
          path="/orders"
          element={<RequireAuth><MyOrderListPage/></RequireAuth>} />

        <Route path="/oauth2/redirect" element={<OAuth2RedirectPage/>} />


        {/* 관리자 라우트 */}
        <Route
          path="/admin/ebooks"
          element={<RequireAdmin> <AdminEbooksPage /> </RequireAdmin>}/>

        <Route
          path="/admin/orders" element={<RequireAdmin><AdminOrdersPage /></RequireAdmin>} />
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