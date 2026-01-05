//인증관련 유틸 모음

export function isLoggedIn() {
    //토큰이 있으면 로그인 상태로 간주
    return !!localStorage.getItem("accessToekn");
}

export function getRole() {
    //USER/ADMIN (없으면 null)
    return localStorage.getItem("role");
}

export function logout() {
    //로그아웃 처리
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
}