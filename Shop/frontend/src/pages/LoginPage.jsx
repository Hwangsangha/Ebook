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

    //카카오 로그인
    const handleKakaoLogin = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
    };

return (
        // 화면 전체를 덮고 중앙 정렬을 위한 컨테이너
        <div className="flex justify-center items-center min-h-[80vh] bg-base-100 px-4">
            
            {/* 로그인 폼 카드 */}
            <div className="card w-full max-w-md shadow-2xl bg-base-100 border border-base-200">
                <div className="card-body p-8 md:p-10">
                    
                    <h2 className="text-3xl font-extrabold text-center mb-8 text-base-content tracking-tight">로그인</h2>

                    {/* 에러 메시지 경고창 */}
                    {msg && (
                        <div className="alert alert-error text-sm rounded-xl mb-4 p-3 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{msg}</span>
                        </div>
                    )}

                    <div className="form-control w-full gap-4">
                        
                        {/* 이메일 입력 폼 */}
                        <div>
                            <label className="label py-1">
                                <span className="label-text font-bold text-base-content/80">이메일</span>
                            </label>
                            <input
                                type="email"
                                placeholder="example@test.com"
                                className="input input-bordered w-full focus:input-primary transition-colors bg-base-100"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* 비밀번호 입력 폼 */}
                        <div>
                            <label className="label py-1">
                                <span className="label-text font-bold text-base-content/80">비밀번호</span>
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full focus:input-primary transition-colors bg-base-100"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') handleLogin();
                                }}
                                disabled={loading}
                            />
                        </div>

                        {/* 개발자 힌트 텍스트 */}
                        <p className="text-xs text-base-content/40 text-right mt-1">
                            개발용: admin@test.com / 1234
                        </p>

                        {/* 이메일 로그인 버튼 */}
                        <button
                            className="btn btn-primary w-full mt-4 text-lg rounded-xl shadow-lg shadow-primary/30"
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? <span className="loading loading-spinner"></span> : "로그인"}
                        </button>
                    </div>

                    {/* 구분선 */}
                    <div className="divider text-base-content/30 text-sm my-6">또는</div>

                    {/* 카카오 로그인 버튼 */}
                    <button
                        className="btn w-full text-black border-none hover:opacity-90 rounded-xl text-base shadow-sm"
                        style={{ backgroundColor: "#FEE500" }}
                        onClick={handleKakaoLogin}
                        disabled={loading}
                    >
                        {/* 카카오 심볼 말풍선 아이콘 */}
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
                            <path d="M12 3c-5.52 0-10 3.58-10 8 0 2.87 1.93 5.4 4.86 6.83-.51 1.63-1.09 3.8-1.15 4.14-.08.43.15.42.34.3l4-2.65c.63.18 1.29.28 1.95.28 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
                        </svg>
                        카카오로 3초만에 시작하기
                    </button>

                    {/* 회원가입 유도 링크 */}
                    <div className="flex justify-center items-center mt-8">
                        <span className="text-base-content/60 text-sm">아직 계정이 없으신가요?</span>
                        <button
                            className="btn btn-link btn-sm p-0 ml-2 text-primary no-underline hover:underline font-bold"
                            onClick={() => navigate("/register")}
                            disabled={loading}
                        >
                            회원가입
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default LoginPage;