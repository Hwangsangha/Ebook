import { useState } from "react";       //상태관리 훅
import {useNavigate} from "react-router-dom";       //페이지 이동 훅
import { AuthApi, setAuth, clearAuth } from "../api";      //회원가입 API + 토큰 저장 유틸

function RegisterPage() {       //회원가입 컴포넌트
    const navigate = useNavigate();      //페이지 이동 함수 준비
    const [email, setEmail] = useState("");     //이메일 입력상태
    const [password, setPassword] = useState("");       //비밀번호 입력상태
    const [name, setName] = useState("");       //이름 입력상태
    const [msg, setMsg] = useState("");     //안내/에러 메시지
    const [loading, setLoading] = useState(false);      //요청 중 상태(버튼 비활성화)

    const onSubmit = async (e) => {     //폼 제출 핸들어
        e.preventDefault();     //폼 기본 제출(새로고침) 막기
        if(loading) return;     //중복 클릭 방지
        setMsg("");     //메시지 초기화
        if(!email.trim()) return setMsg("이메일을 입력해주세요.");     //간단검증
        if(!password.trim()) return setMsg("비밀번호를 입력해주세요.");
        if(!name.trim()) return setMsg("이름을 입력해주세요.");

        try {
            setLoading(true);
            const data = await AuthApi.register({
                email: email.trim(),
                password: password,
                name: name.trim(),
            });
            setAuth(data.accessToken);
            navigate("/ebooks");
        } catch (err) {
            setMsg(err?.message || "회원가입 실패");    //unwrap이 이미 메시지 만들어서 Error로 던짐
            clearAuth();    // 실패 시 꼬임 방지
        } finally {
            setLoading(false);
        }
    };


return (
        // 화면 중앙 정렬을 위한 테일윈드 컨테이너 적용
        <div className="flex justify-center items-center min-h-[80vh] bg-base-100 px-4">
            
            {/* 흰색 카드 레이아웃으로 감쌈 */}
            <div className="card w-full max-w-md shadow-2xl bg-base-100 border border-base-200">
                <div className="card-body p-8 md:p-10">
                    
                    {/* 제목 폰트 크기 및 두께 강화 (로그인 페이지와 디자인 통일) */}
                    <h2 className="text-3xl font-extrabold text-center mb-8 text-base-content tracking-tight">회원가입</h2>

                    {/* 아이콘이 포함된 빨간색 경고 박스(alert-error)로 업그레이드 */}
                    {msg && (
                        <div className="alert alert-error text-sm rounded-xl mb-4 p-3 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{msg}</span>
                        </div>
                    )}

                    {/* flex/gap 조합의 daisyUI form-control 적용 */}
                    <form onSubmit={onSubmit} className="form-control w-full gap-4">
                        
                        {/* 각 입력창 위에 시각적인 안정감을 주는 라벨(label) 추가 */}
                        <div>
                            <label className="label py-1">
                                <span className="label-text font-bold text-base-content/80">이메일</span>
                            </label>
                            {/* input-bordered 클래스 적용 및 클릭 시 테두리 색상 변경(focus:input-primary) 효과 추가 */}
                            <input
                                type="email"
                                placeholder="example@test.com"
                                className="input input-bordered w-full focus:input-primary transition-colors bg-base-100"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

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
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="label py-1">
                                <span className="label-text font-bold text-base-content/80">이름</span>
                            </label>
                            <input
                                type="text"
                                placeholder="홍길동"
                                className="input input-bordered w-full focus:input-primary transition-colors bg-base-100"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* 그림자가 있는 프라이머리(Primary) 버튼으로 변경 */}
                        <button 
                            type="submit" 
                            className="btn btn-primary w-full mt-4 text-lg rounded-xl shadow-lg shadow-primary/30"
                            disabled={loading}
                        >
                            {loading ? <span className="loading loading-spinner"></span> : "가입 완료하기"}
                        </button>

                        {/* 하단 텍스트 링크(btn-link) 형태로 변경하여 UX 향상 */}
                        <div className="flex justify-center items-center mt-6">
                            <span className="text-base-content/60 text-sm">이미 계정이 있으신가요?</span>
                            <button
                                type="button"
                                className="btn btn-link btn-sm p-0 ml-2 text-primary no-underline hover:underline font-bold"
                                onClick={() => navigate("/login")}
                                disabled={loading}
                            >
                                로그인
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;