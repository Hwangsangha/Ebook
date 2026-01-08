import { useState } from "react";   //상태 관리 훅
import {useNavigate} from "react-router-dom"    //페이지 이동 훅
import api from "../api";   //axios 공통 래퍼(서버 호출 담당)

function LoginPage() {
    const navigate = useNavigate(); //로그인 성공 시 다른 페이지로 이동할때 사용
    
    //입력값(이메일/비밀번호)과 에러메시지를 화면에서 관리하기 위한 state
    const [email, setEmail] = useState(''); //이메일 입력
    const [password, setPassword] = useState('');   //비밀먼호 입력
    const [msg, setMsg] = useState("");

    //임시 로그인 처리: 서버없이 localStorage에 값 저장
    const handleLogin = async () => {
        setMsg(""); //이전 메시지 초기화

        try {
            //백엔드 로그인 API 호출
            const res = await api.post("/auth/login", {
                email,
                password
            });

            //서버가 준 accessToken 저장
            const token = res.data?.accessToken;
            if(!token) {
                throw new Error("로그인 응답에 accessToken이 없습니다.");
            }
            localStorage.setItem("accessToken", token);

            //임시 권한: 관리자 화면 접근 테스트용
            localStorage.setItem("role", "ADMIN"); //'ADMIN'

            //로그인 성공 처리: 전자책 목록으로 이동
            navigate("/ebooks")
        } catch (e) {
            const message = 
                e?.response?.data?.message ||
                e?.message ||
                "로그인 실패";
            setMsg(message);

            //실패 시 기존 토큰이 남아있으면 꼬이지 제거
            localStorage.removeItem("accessToken");
            localStorage.removeItem("role");

            console.log("[LOGIN ERROR]", e);    //임시 확인용
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
            />

            {/* ✅ 비밀번호 입력 */}
            <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // ✅ 입력값을 state에 반영
            />

            {/* ✅ 로그인 버튼 */}
            <button onClick={handleLogin}>
            로그인
            </button>
        </div>

        <p style={{ marginTop: 12, color: "#666", fontSize: 12 }}>
            개발용 계정: admin@test.com / 1234
        </p>
        </div>
    );
}

export default LoginPage;