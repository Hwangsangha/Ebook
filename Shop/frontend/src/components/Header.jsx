import { NavLink, useNavigate } from "react-router-dom";
import "../styles/ui.css";  //공통 ui

export default function Header() {
  const navigate = useNavigate(); //이동(로그인/로그아웃 버튼에 사용)

  //토큰 유무로 로그인 여부 판단
  const isLoggedIn = !!localStorage.getItem("accessToken");

  //권한Role 가져오기
  const role = localStorage.getItem("role");

  //링크 활성화 스타일 통일
  const linkClass = ({ isActive }) =>
    isActive ? "ui-link ui-link-active" : "ui-link";

  //로그아웃 처리 : 저장된 로그인 정보 제거 + 로그인 페이지로 이동
  const handleLogout = () => {
    localStorage.removeItem("accessToken"); //토큰 제거
    localStorage.removeItem("role");  //권한 제거
    navigate("/login"); // 로그인 화면으로 이동
  };

  return (
    <div style={{display: "flex", alignItems: "center", padding: "15px", borderBottom: "1px solid #ddd"}}>
      <div style={{marginRight: 20, fontSize: "20px", fontWeight: "bold", color: "#333"}}>Ebook</div>

      {/* 왼쪽 상단 영역 */}
      <NavLink to="/" className={linkClass}>
        전자책
      </NavLink>

      <NavLink to="/cart" className={linkClass}>
        장바구니
      </NavLink>

      {/* 로그인 유저에게만 마이페이지 노출 */}
      {isLoggedIn && (
        <NavLink to="/orders" className={linkClass}>
          마이페이지
        </NavLink>
      )}

      {/* 관리자 전용 메뉴 */}
      {role === "ADMIN" && (
        <div style={{display: "flex", alignItems: "center", marginLeft: 15, paddingLeft: 15, borderLeft: "2px solid #ddd"}}>
          <span style={{fontSize: "14px", fontWeight: "bold", color: "#8a2be2", marginRight: 10}}>
            [관리자]
          </span>
          <NavLink to="/admin/ebooks" className={linkClass}>
            전자책 관리
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            주문 관리
          </NavLink>
        </div>
      )}

      {/* 오른쪽 상단 영역 */}
      <div style={{marginLeft: "auto", display: "flex", gap: 12, alignItems: "center"}}>
        {role && <span style={{fontSize: "12px", color: "#999"}}>role: {role}</span>}
        {isLoggedIn ? (
          //로그인 상태면 로그아웃 버튼 표시
          <button className="ui-link" onClick={handleLogout}>
            로그아웃
          </button>
        ) : (
          //비로그인 상태면 로그인 버튼 표시
          <button className="ui-link" onClick={() => navigate("/login")}>
            로그인
          </button>
        )}
      </div>
    </div>
  );
}
