import { useEffect, useState } from "react";    //React 훅: 상태/생명주기
import { AdminEbookApi} from "../api";   //unwrap적용 API

function AdminEbooksPage() {
    //서버에서 받은 전자책 목록
    const [ebooks, setEbooks] = useState([]);

    //화면 메시지(에러/성공 안내)
    const [msg, setMsg] = useState("");

    //페이징 및 필터링 상태
    const [currentPage, setCurrentPage] = useState(0);      //현재 페이지
    const [totalPages, setTotalPages] = useState(1);        //전체 페이지 수
    const [filterStatus, setFilterStatus] = useState("ALL");        //필터 상태

    //등록 폼 입력값(최소 필드만)
    const [createForm, setCreateForm] = useState({
        title: "",
        price: "",
        status: "ACTIVE",
    });
    //파일 입력값 상태(파일 객체 저장용)
    const [thumbnail, setThumbnail] = useState(null);
    const [file, setFile] = useState(null);

    //수정
    const [editingId, setEditingId] = useState(null);

    //수정 폼 입력
    const [editForm, setEditForm] = useState({
        title: "",
        price: "",
        status: "ACTIVE",
    });

    const [loading, setLoading] = useState(false);
    //공통 로딩 상태: API 요청 중 버튼 비활성화 용도

    //관리자 접근 최소 가드
    //role이 ADMIN이 아니면 접근 차단
    useEffect(() => {
        const role = localStorage.getItem("role");  //임시 로그인에서 저장한 role
        if(role !== "ADMIN") {
            setMsg("ADMIN만 접근 가능");
            return;
        }
        //페이지 번호나 상태가 바뀔 때마다 다시 호출
        fetchList();
    }, [currentPage, filterStatus]);

    //목록 조회
    const fetchList = async (page = 0, status = "ALL") => {
        setMsg("");
        try {
            const data = await AdminEbookApi.list(); //unwrap으로 데이터 받기
            // ✅ 서버 응답 형태가 달라도 목록 배열을 뽑아내는 정규화
            // 1) data 자체가 배열이면 그대로 사용
            // 2) 페이지 응답이면 content/items 같은 필드에서 꺼내기
            const list = Array.isArray(data) ? data
                : Array.isArray(data?.content) ? data.content
                : Array.isArray(data?.items) ? data.items
                :Array.isArray(data?.data) ?data.data
                : [];

            setEbooks(list);

            if(data && data.total !== undefined && data.size) {
                setTotalPages(Math.ceil(data.total / data.size));
            } else if(data && data.totalPages !== undefined) {
                setTotalPages(data.totalPages); //혹시 totalPages로 내려올 경우 대비
            } else {
                setTotalPages(1);   //계산 안 되면 일단 1페이지로 설정
            }

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
            setLoading(true);  //요청 시작
            
            const formData = new FormData();

            //글자 데이터 담기
            formData.append("title", createForm.title);
            formData.append("price", Number(createForm.price));
            formData.append("status", createForm.status);
            //formData.append("author", "작가명");  //필요시 추가

            //파일 데이터 담기
            if(thumbnail) {
                formData.append("thumbnail", thumbnail);
            }
            if(file) {
                formData.append("file", file);
            }

            //API 전송(FormData 통쨰로 전달 -> api.js에서 multipart/form-data로 처리)
            await AdminEbookApi.create(formData);

            //초기화
            setCreateForm({title: "", price: "", status: "ACTIVE"});
            setThumbnail(null);
            setFile(null);

            //id가 없으면 그냐 넘어감
            const thumbInput = document.getElementById("input-thumbnail");
            if(thumbInput) thumbInput.value = "";

            const fileInput = document.getElementById("input-file");
            if(fileInput) fileInput.value = "";

            setMsg("등록완료");
            fetchList();
        }   catch(e) {
            setMsg(e.message || "등록실패");
            console.log("[CREATE ERROR]", e);
        } finally {
            setLoading(false); //요청 종료
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
            setLoading(true);
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
            setLoading(false);
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
            setLoading(false);
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
    //백엔드 URL(이미지 표시에 필요)
    const BASE_URL = import.meta.env.VITE_API_BASE ||  "http://localhost:8080";

    return (
        <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: "1000px", margin: "0 auto" }}>
            <h2>관리자: 전자책 관리</h2>

            {msg && <p style={{ color: msg.includes("완료") ? "green" : "crimson", fontWeight: "bold" }}>{msg}</p>}

            {/* ✅ 등록 영역 (디자인 살짝 깔끔하게 정돈) */}
            <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 20, marginBottom: 24, backgroundColor: "#f9f9f9" }}>
                <h3 style={{ marginTop: 0 }}>새 전자책 등록</h3>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 15 }}>
                    <input placeholder="제목" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} style={{ flex: 1, padding: 8 }} />
                    <input type="number" placeholder="가격" value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })} style={{ width: 120, padding: 8 }} />
                    <select value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })} style={{ padding: 8 }}>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="SOLD_OUT">SOLD_OUT</option>
                    </select>
                </div>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: 4 }}>표지 이미지 (Image)</label>
                        <input id="input-thumbnail" type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} />
                    </div>
                    <div>
                        <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: 4 }}>전자책 파일 (PDF)</label>
                        <input id="input-file" type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
                    </div>
                    <button onClick={handleCreate} disabled={loading} style={{ backgroundColor: "#3366FF", color: "white", border: "none", padding: "10px 20px", borderRadius: 4, cursor: "pointer", marginLeft: "auto", fontWeight: "bold" }}>
                        {loading ? "처리중..." : "등록하기"}
                    </button>
                </div>
            </div>

            {/* ✅ 필터링 및 목록 새로고침 영역 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <label style={{ fontWeight: "bold" }}>상태 필터:</label>
                    <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(0); }} style={{ padding: 6 }}>
                        <option value="ALL">전체 보기</option>
                        <option value="ACTIVE">판매중 (ACTIVE)</option>
                        <option value="INACTIVE">비활성 (INACTIVE)</option>
                        <option value="SOLD_OUT">품절 (SOLD_OUT)</option>
                    </select>
                </div>
                <button onClick={() => fetchList(currentPage, filterStatus)} style={{ padding: "6px 12px", cursor: "pointer" }}>↻ 새로고침</button>
            </div>

            {ebooks.length === 0 ? (
                <div style={{ textAlign: "center", padding: 50, border: "1px solid #ddd", borderRadius: 8 }}>
                    <p style={{ color: "#666" }}>표시할 전자책이 없습니다.</p>
                </div>
            ) : (
                <>
                    <table style={{ borderCollapse: "collapse", width: "100%", border: "1px solid #ddd", textAlign: "left" }}>
                        <thead style={{ background: "#f1f1f1" }}>
                            <tr>
                                <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>ID</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #ddd", textAlign: "center" }}>표지</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>제목</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>가격</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>상태</th>
                                <th style={{ padding: 12, borderBottom: "1px solid #ddd" }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ebooks.map((ebook) => {
                                const isEditing = editingId === ebook.id;
                                return (
                                    <tr key={ebook.id} style={{ borderBottom: "1px solid #eee" }}>
                                        <td style={{ padding: 12 }}>{ebook.id}</td>
                                        <td style={{ padding: 12, textAlign: "center" }}>
                                            {ebook.thumbnailPath ? (
                                                <img src={`${BASE_URL}/uploads/${ebook.thumbnailPath}`} alt="표지" style={{ width: 40, height: 55, objectFit: "cover", borderRadius: 4 }} />
                                            ) : (
                                                <span style={{ fontSize: 12, color: "#ccc" }}>No Image</span>
                                            )}
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            {isEditing ? <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} style={{ width: "100%", padding: 4 }} /> : ebook.title}
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            {isEditing ? <input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} style={{ width: 80, padding: 4 }} /> : `${Number(ebook.price).toLocaleString()}원`}
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            {isEditing ? (
                                                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={{ padding: 4 }}>
                                                    <option value="ACTIVE">ACTIVE</option>
                                                    <option value="INACTIVE">INACTIVE</option>
                                                    <option value="SOLD_OUT">SOLD_OUT</option>
                                                </select>
                                            ) : (
                                                <span style={{ color: ebook.status === 'ACTIVE' ? 'green' : ebook.status === 'SOLD_OUT' ? 'red' : 'gray', fontWeight: "bold" }}>
                                                    {ebook.status}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            {isEditing ? (
                                                <div style={{ display: "flex", gap: 5 }}>
                                                    <button onClick={() => saveEdit(ebook.id)} disabled={loading} style={{ padding: "4px 8px", cursor: "pointer" }}>저장</button>
                                                    <button onClick={cancelEdit} style={{ padding: "4px 8px", cursor: "pointer" }}>취소</button>
                                                </div>
                                            ) : (
                                                <div style={{ display: "flex", gap: 5 }}>
                                                    <button onClick={() => startEdit(ebook)} style={{ padding: "4px 8px", cursor: "pointer" }}>수정</button>
                                                    <button onClick={() => deleteEbook(ebook.id)} disabled={loading} style={{ padding: "4px 8px", cursor: "pointer", color: "red" }}>삭제</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* ✅ 페이징(Pagination) 버튼 컨트롤 */}
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 15, marginTop: 20 }}>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} 
                            disabled={currentPage === 0}
                            style={{ padding: "6px 12px", cursor: currentPage === 0 ? "not-allowed" : "pointer" }}
                        >
                            ◀ 이전
                        </button>
                        <span style={{ fontWeight: "bold" }}>{currentPage + 1} / {totalPages} 페이지</span>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))} 
                            disabled={currentPage >= totalPages - 1}
                            style={{ padding: "6px 12px", cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer" }}
                        >
                            다음 ▶
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}


export default AdminEbooksPage;