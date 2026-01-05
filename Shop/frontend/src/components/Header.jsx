import { NavLink, useNavigate } from "react-router-dom";
import "../styles/ui.css";  //공통 ui

export default function Header() {
  const navigate = useNavigate(); //이동(로그인/로그아웃 버튼에 사용)

  //토큰 유무로 로그인 여부 판단
  const isLoggedIn = !!localStorage.getItem("accessToken");

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
    <div className="ui-headerbar">
      <div className="ui-brand">Ebook</div>

      {/* 왼쪽 상단 영역 */}
      <NavLink to="/" className={linkClass}>
        전자책
      </NavLink>

      <NavLink to="/cart" className={linkClass}>
        장바구니
      </NavLink>

      {/* 오른쪽 상단 영역 */}
      <div style={{marginLeft: "auto", display: "flex", gap: 12}}>
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
