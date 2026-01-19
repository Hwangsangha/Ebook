import { useNavigate } from "react-router-dom";     //페이지 이동 훅
import { clearAuth } from "../api";         //인증정보 삭제 유틸

function LogoutButton() {
    const navigate = useNavigate();

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    return (
        <button onClick={handleLogout}>
            로그아웃
        </button>
    );
}

export default LogoutButton;