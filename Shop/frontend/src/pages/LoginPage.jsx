import { useState } from "react";   //상태 관리 훅
import {useNavigate, useLocation} from "react-router-dom"    //페이지 이동 훅
import {AuthApi, setAuth, clearAuth} from "../api";     //토큰 저장/삭제 공통 유틸 사용

function LoginPage() {
    const navigate = useNavigate(); //로그인 성공 시 다른 페이지로 이동할때 사용
    const location = useLocation();
    
    //입력값(이메일/비밀번호)과 에러메시지를 화면에서 관리하기 위한 state
    const [email, setEmail] = useState(""); //이메일 입력
    const [password, setPassword] = useState("");   //비밀먼호 입력
    const [msg, setMsg] = useState("");     //에러/안내 메시지 상태
    const [loading, setLoading] = useState(false);      //요청 중 상태(중복 클릭 방지)

    //임시 로그인 처리: 서버없이 localStorage에 값 저장
    const handleLogin = async () => {
        if(loading) return;
        setMsg(""); //이전 메시지 초기화

        if(!email.trim()) {
            setMsg("이메일을 입력하세요.");
            return;
        }

        if(!password.trim()) {
            setMsg("비밀번호를 입력하세요.");
            return;
        }

        try {       //로그인 시도
            setLoading(true);       //로딩 시작
            
            const data = await AuthApi.login({      // /auth/login 호출(unwrap 적용)
                email: email.trim(),        //공백제거 이메일
                password: password,
            });

            //서버가 준 accessToken 저장
            const token = data?.accessToken;        //응답에서 토큰 추출
            if(!token) {        //토큰 없을시
                throw new Error("로그인 응답에 accessToken이 없습니다.");       //에러발생
            }

            setAuth(token);     //accessToken + userId(sub) + role 저장

            //로그인 성공 처리: 전자책 목록으로 이동
            const from = location.state?.from?.pathname || "/ebooks";
            navigate(from, {replace: true});
        } catch (e) {       //실패처리
            const message =         //표시할 메시지 우선순위
                e?.message ||       //unwrap이 throw한 Error메시지
                "로그인 실패";      //기본 메시지

            setMsg(message);        //화면 표시
            clearAuth();        //실패시 인증정보 정리

            console.log("[LOGIN ERROR]", e);    //임시 확인용
        } finally {     //항상 실행
            setLoading(false);      //로딩 종료
        }
    };

    return (
        <div style={{ maxWidth: 420, margin: "100px auto", fontFamily: "system-ui" }}>
            <h2>로그인</h2>

                {/*{msg && <p style={{ color: "crimson" }}>{msg}</p>}*/}

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* ✅ 이메일 입력 */}
                    <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // ✅ 입력값을 state에 반영
                    disabled = {loading}
                    />

                    {/* ✅ 비밀번호 입력 */}
                    <input
                    type="password"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // ✅ 입력값을 state에 반영
                    disabled = {loading}
                    />

                    {/* ✅ 로그인 버튼 */}
                    <button onClick={handleLogin} disabled = {loading}>
                        {loading ? "로그인 중..." : "로그인"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/register")}       //회원가입 페이지 이동
                        disabled={loading}      //요청중 비활성화
                    >
                        회원가입
                    </button>
                </div>

                <p style={{ marginTop: 12, color: "#666", fontSize: 12 }}>
                    개발용 계정: admin@test.com / 1234
                </p>
        </div>
    );
}

export default LoginPage;