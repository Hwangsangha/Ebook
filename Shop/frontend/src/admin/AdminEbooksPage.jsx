import { useEffect, useState } from "react";    //React 훅: 상태/생명주기
import {EbookApi, AdminEbookApi} from "../api";   //unwrap적용 API

function AdminEbooksPage() {
    //서버에서 받은 전자책 목록
    const [ebooks, setEbooks] = useState([]);

    //화면 메시지(에러/성공 안내)
    const [msg, setMsg] = useState("");

    //등록 폼 입력값(최소 필드만)
    const [createForm, setCreateForm] = useState({
        title: "",
        price: "",
        status: "ACTIVE",
    });

    //수정
    const [editingId, setEditingId] = useState(null);

    //수정 폼 입력
    const [editForm, setEditForm] = useState({
        title: "",
        price: "",
        status: "ACTIVE",
    });

    const [loading, seetLoading] = useState(false);
    //공통 로딩 상태: API 요청 중 버튼 비활성화 용도

    //관리자 접근 최소 가드
    //role이 ADMIN이 아니면 접근 차단
    useEffect(() => {
        fetchList();    //처음 한번 목록 가져오기
        const role = localStorage.getItem("role");  //임시 로그인에서 저장한 role
        if(role !== "ADMIN") {
            setMsg("ADMIN만 접근 가능");
        }
    }, []);

    //목록 조회
    const fetchList = async () => {
        setMsg("");
        try {
            const data = await EbookApi.list(); //unwrap으로 데이터 받기
            // ✅ 서버 응답 형태가 달라도 목록 배열을 뽑아내는 정규화
            // 1) data 자체가 배열이면 그대로 사용
            // 2) 페이지 응답이면 content/items 같은 필드에서 꺼내기
            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.content)
                ? data.content
                : Array.isArray(data?.items)
                ? data.items
                :Array.isArray(data?.data)
                ?data.data
                : [];

            setEbooks(list);
        } catch(e) {
            setMsg(e.message || "목록 조회 실패");
            setEbooks([]);  //실패 시에도 화면이 꺠지지 않게 빈 배열로
            console.log("[LIST ERROR]", e);
        }
    };

    //등록
    const handleCreate = async () => {
        if(loading) return;
        setMsg("");

        if(!createForm.title.trim()) {
            setMsg("제목은 필수입니다.");
            return;
        }
        if(!createForm.price || Number(createForm.price) <= 0) {
            setMsg("가격은 0보다 커야 합니다.");
            return;
        }

        try {
            seetLoading(true);  //요청 시작
            const payload = {
                title: createForm.title,
                price: Number(createForm.price),
                status: createForm.status,
            };

            await AdminEbookApi.create(payload);    //관리자 등록 API
            setCreateForm({title: "", price: "", status: "ACTIVE"});  //폼 초기화
            setMsg("등록완료");
            fetchList();
        }   catch(e) {
            setMsg(e.message || "등록실패");
            console.log("[CREATE ERROR]", e);
        } finally {
            seetLoading(false); //요청 종료
        }
    };

    //수정 저장
    const saveEdit = async(id) => {
        if(loading) return;
        setMsg("");

        if(!editForm.title.trim()) {
            setMsg("제목은 필수입니다.");
            return;
        }
        if(!editForm.price || Number(editForm.price) <= 0) {
            setMsg("가격은 0보다 커야 합니다.");
            return;
        }

        try {
            seetLoading(true);
            const payload = {
                title: editForm.title,
                price: Number(editForm.price),
                status: editForm.status,
            };

            await AdminEbookApi.update(id, payload);    //관리자 수정 API
            setMsg("수정완료");
            cancelEdit();
            fetchList();
        } catch(e) {
            setMsg(e.message || "수정실패");
        } finally {
            seetLoading(false);
        }
    };

    //삭제
    const deleteEbook = async(id) => {
        if(!window.confirm("정말 삭제하시겠습니까?"))
        return;
        if(loading) return;

        setMsg("");
        try {
            await AdminEbookApi.remove(id); //관리자 삭제 API
            setMsg("삭제완료");
            fetchList();
        } catch(e) {
            setMsg(e.message || "삭제실패");
        } finally {
            seetLoading(false);
        }
    };

    // 수정 시작: 선택한 ebook 값을 editForm에 복사하고 editingId설정
    const startEdit = (ebook) => {
        setEditingId(ebook.id); //어떤 row를 수정 중인지 표시
        setEditForm({
            title: ebook.title ?? "",           // 기존 제목을 폼에 채용
            price: String(ebook.price ?? ""),   // input은 문자열이 안전
            status: ebook.status ?? "ACTIVE",   // 기존 상태를 폼에 채움
        });
    };

    // 수정 취소: 수정모드 종료 + 폼 초기화
    const cancelEdit = () => {
        setEditingId(null); // 수정모드 종료
        setEditForm({title: "", price: "", status: "ACTIVE"});  //폼 초기화
    }

    // role이 ADMIN이 아니면 안내만 보여주고 UI는 숨김(최소 가드)
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
    return (
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
            <h2>관리자 페이지</h2>
            <p style={{ color: "crimson" }}>{msg || "ADMIN만 접근 가능"}</p>
        </div>
    );
    }

    return (
        <div style={{ padding: 24, fontFamily: "system-ui" }}>
            <h2>관리자: 전자책 관리</h2>

            {/* 상태 메시지(에러/성공) */}
            {msg && <p style={{ color: msg.includes("완료") ? "green" : "crimson" }}>{msg}</p>}

            {/* ✅ 등록 폼(최소) */}

            {/*목록이 비었을때 문구 */}
            {ebooks.length === 0 && (
                <p style={{color: "#666"}}>
                    표시할 전자책이 없습니다.
                </p>
            )}

            <div style={{ border: "1px solid #ddd", padding: 12, marginBottom: 16 }}>
            <h3>전자책 등록</h3>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                    placeholder="제목"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                />

                <input
                    type="number"   //숫자 입력 유도
                    placeholder="가격"
                    value={createForm.price}
                    onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                />

                <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SOLD_OUT">SOLD_OUT</option>
                </select>

                <button onClick={handleCreate} disabled={loading}>
                    {loading ? "처리중..." : "등록"}
                </button>
                <button onClick={fetchList}>목록 새로고침</button>
            </div>
        </div>

        {/* ✅ 목록 테이블 */}
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>제목</th>
                    <th>가격</th>
                    <th>상태</th>
                    <th>액션</th>
                </tr>
            </thead>

            <tbody>
                {ebooks.map((ebook) => {
                const isEditing = editingId === ebook.id; // 현재 행이 수정 모드인지
                return (
                    <tr key={ebook.id}>
                    <td>{ebook.id}</td>

                    {/* 제목 */}
                    <td>
                        {isEditing ? (
                        <input
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                        ) : (
                            ebook.title
                            )}
                    </td>

                    {/* 가격 */}
                    <td>
                        {isEditing ? (
                        <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        />
                        ) : (
                            ebook.price
                        )}
                    </td>

                    {/* 상태 */}
                    <td>
                        {isEditing ? (
                            <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                                <option value="SOLD_OUT">SOLD_OUT</option>
                            </select>
                            ) : (
                                ebook.status
                        )}
                    </td>

                    {/* 액션 버튼 */}
                    <td>
                        {isEditing ? (
                            <>
                                <button onClick={() => saveEdit(ebook.id)} disabled={loading}>저장</button>
                                <button onClick={cancelEdit}>취소</button>
                            </>
                            ) : (
                            <>
                                <button onClick={() => startEdit(ebook)}>수정</button>
                                <button onClick={() => deleteEbook(ebook.id)} disabled={loading}>삭제</button>
                            </>
                        )}
                    </td>
                    </tr>
                );
            })}
        </tbody>
      </table>
    </div>
  );
}


export default AdminEbooksPage;