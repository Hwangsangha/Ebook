import { Navigate, useLocation } from "react-router-dom";       //라우팅 유틸

function RequireAuth({children}) {
    const location = useLocation();     //현 위치(로그인 후 복귀용)
    const token = localStorage.getItem("accessToken");      //토큰 읽기

    if(!token) {        //토큰 없으면 로그아웃
        return <Navigate to="/login" replace state={{from: location}}/>     //로그인으로 강제이동
    }

    return children;
}

export default RequireAuth;