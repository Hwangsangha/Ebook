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
        if(!email.trim()) return setMsg("email은 필수입니다.");     //간단검증
        if(!password.trim()) return setMsg("password는 필수입니다.");
        if(!name.trim()) return setMsg("name는 필수입니다.");

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
            const serverMsg = err?.response?.data?.message;
            setMsg(serverMsg || err.message || "회원가입 실패");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        try{
            const data = await Auth.register({      // /auth/register 호출
                email: email.trim(),
                password,
                name: name.trim(),
            });
            
            const token = data?.accessToken;        //토큰 꺼내기
            if(!token) throw new Error("회원가입 응답에 accessToken이 없습니다.");

            setAuth(token);     // accessToken + userId + role 저장
            navigate("/ebooks")     //이동
        } catch(e) {
            setMsg(e?.message || "회원가입 실패");      //메시지
            clearAuth();        //정리
        }
    };


return (                                                           // 화면 렌더링
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 420 }}> {/* 레이아웃 */}
      <h2>회원가입</h2>                                               {/* 제목 */}

      {msg && (                                                       // 메시지 있으면 출력
        <p style={{ color: "crimson" }}>{msg}</p>                      // 빨간 글씨로 표시
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>  {/* 폼 */}
        <input                                                        // 이메일 입력
          placeholder="email"                                          // 안내문구
          value={email}                                                // 상태 바인딩
          onChange={(e) => setEmail(e.target.value)}                   // 입력 변경 시 상태 갱신
        />

        <input                                                        // 비밀번호 입력
          type="password"                                              // 비번 마스킹
          placeholder="password"                                       // 안내문구
          value={password}                                             // 상태 바인딩
          onChange={(e) => setPassword(e.target.value)}                // 입력 변경 시 상태 갱신
        />

        <input                                                        // 이름 입력
          placeholder="name"                                           // 안내문구
          value={name}                                                 // 상태 바인딩
          onChange={(e) => setName(e.target.value)}                    // 입력 변경 시 상태 갱신
        />

        <button type="submit" disabled={loading}>                      {/* 제출 버튼 */}
          {loading ? "처리중..." : "회원가입"}                         {/* 로딩 상태 표시 */}
        </button>                                                     {/* 버튼 끝 */}

        <button                                                       // 로그인 이동 버튼
          type="button"                                                // submit 아님
          onClick={() => navigate("/login")}                                // 로그인 화면으로 이동
        >
          로그인으로 이동
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;                                          // 컴포넌트 export