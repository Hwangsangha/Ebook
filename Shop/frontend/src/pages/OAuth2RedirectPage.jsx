import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function OAuth2RedirectPage() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        //주소창(URL)에서 토큰값 가져오기
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if(token) {
            //토큰이 있으면 브라우저 localStorage에 안전하게 보관
            localStorage.setItem("token", token);

            //로그인 처리 후 메인 홈 반환 새로고침으로 상태반영
            window.location.href = "/";
        } else {
            //토큰이 없으면 로그인 실패
            alert("카카오 로그인에 실패했습니다.");
            navigate("/login");
        }
    }, [navigate, location]);

    return(
        <div style={{padding: "100px", textAlign: "center", fontSize: "18px", fontWeight: "bold"}}>
            카카오 로그이 처리 중입니다.
        </div>
    );
}

export default OAuth2RedirectPage;