import { Routes, Route, Link } from "react-router-dom";
import SummaryPage from "./pages/SummaryPage";
import Cartpage from "./pages/Cartpage";

function App() {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui"}}>
      <nav style={{ marginBottom: 20}}>
        <Link to="/" style={{ marginRight: 16}}>요약</Link>
        <Link to="/cart">장바구니</Link>
      </nav>

      <Routes>
        <Route path="/" element={<SummaryPage/>}/>
        <Route path="/cart" element={<Cartpage/>}/>
      </Routes>
    </div>
  );
}

export default App;