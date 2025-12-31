import { useState } from "react";   //상태 관리 훅
import {useNavigate} from "react-router-dom"    //페이지 이동 훅
import api from "../api";   //axios 공통 래퍼(서버 호출 담당)

function LoginPage() {
    const navigate = useNavigate(); //로그인 성공 시 다른 페이지로 이동할때 사용
    
    //입력값(이메일/비밀번호)과 에러메시지를 화면에서 관리하기 위한 state
    const [email, setEmail] = useState(''); //이메일 입력
    const [password, setPassword] = useState('');   //비밀먼호 입력

    //임시 로그인 처리: 서버없이 localStorage에 값 저장
    const handelDevLogin = (role) => {
        //임시 토큰: 값 자체는 의미 X. 단순 로그인 표시
        localStorage.setItem('accessToken', 'dev-token');

        //임시 권한: 관리자 화면 접근 테스트용
        localStorage.setItem('role', role); //'ADMIN'

        //로그인 성공 처리: 전자책 목록으로 이동
        navigate('/ebooks')
    };

    return (
        <div style={{maxWidth: '420px', margin: '100px auto'}}>
            <h2>로그인(임시)</h2>

            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <input
                    type="email"
                    placeholder="이메일(임시)"
                    value={email}   //입력값 연결
                    onChange={(e) => setEmail(e.target.value)} //입력 시 state 갱신
                />

                /* 유저용, 관리자용 권한별 로그인 화면 테스트 */
                <button onClick={() => handelDevLogin('USER')}>
                    임시 로그인(USER)
                </button>

                <button onClick={() => handelDevLogin('ADMIN')}>
                    임시 로그인(ADMIN)
                </button>
            </div>
        </div>
    );
}

export default LoginPage;