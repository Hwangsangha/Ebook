import { Routes, Route, Link } from "react-router-dom";
import SummaryPage from "./pages/SummaryPage";
import Cartpage from "./pages/CartPage";
import EbookListPage from "./pages/EbookListPage";

function App() {
  return (
    <div style={{padding: 24, fontFamily: "system-ui"}}>
      <nav style={{marginBottom: 20}}>
        <Link to="/" style={{marginRight: 16}}>요약</Link>
        <Link to="/cart">장바구니</Link>
        <Link to="/ebooks" style={{marginRight: 16}}>전자책</Link>
      </nav>

      <Routes>
        <Route path="/" element={<SummaryPage/>}/>
        <Route path="/cart" element={<Cartpage/>}/>
        <Route path="/ebooks" element={<EbookListPage />} />
      </Routes>
    </div>
  );
}

export default App;

//앱 전체의 라우팅을 담당하는 컴포넌트
//각 페이지들을 Routes로 연결