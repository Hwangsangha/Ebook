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
        category: "ETC",
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
        category: "ETC",
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
    const fetchList = async () => {
        setMsg("");
        try {
            //api에 page, size(10고정), status를 순서대로 반환
            const data = await AdminEbookApi.list(currentPage, 10, filterStatus);
            // 서버 응답 형태가 달라도 목록 배열을 뽑아내는 정규화
            // 1) data 자체가 배열이면 그대로 사용
            // 2) 페이지 응답이면 content/items 같은 필드에서 꺼내기
            const list = Array.isArray(data) ? data
                : Array.isArray(data?.content) ? data.content
                : Array.isArray(data?.items) ? data.items
                : Array.isArray(data?.data) ? data.data
                : [];

            setEbooks(list);

            const pageSize = data?.size || 10;
            if(data && data.total !== undefined) {
                setTotalPages(Math.ceil(data.total / pageSize));
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
            formData.append("author", "작가명");  //필요시 추가
            formData.append("category", createForm.category);

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
            setCreateForm({title: "", price: "", status: "ACTIVE", category: "ETX"});
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
                category: editForm.category,
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
            category: ebook.category ?? "ETC", // 기존 카테고리값 불러오기
        });
    };

    // 수정 취소: 수정모드 종료 + 폼 초기화
    const cancelEdit = () => {
        setEditingId(null); // 수정모드 종료
        setEditForm({title: "", price: "", status: "ACTIVE", category: "ETC"});  //폼 초기화
    }

    // role이 없는 경우의 UI를 OrderPage와 동일한 에러카드로 통일
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
 return (
            <div className="flex justify-center items-center min-h-[60vh] px-4">
                <div className="alert alert-error shadow-lg max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                        <h3 className="font-bold">접근 거부</h3>
                        <div className="text-sm">{msg || "관리자(ADMIN)만 접근할 수 있는 페이지입니다."}</div>
                    </div>
                </div>
            </div>
        );
    }
    //백엔드 URL(이미지 표시에 필요)
    const BASE_URL = import.meta.env.VITE_API_BASE ||  "http://localhost:8080";

return (
        // 전체 컨테이너를 테일윈드 max-w-6xl로 넓게 잡아 대시보드 느낌 강조
        <div className="container mx-auto px-4 py-8 max-w-6xl mb-20">
            
            {/*  헤더 영역 타이틀 폰트 및 아이콘 추가 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-4 mb-8 gap-4">
                <h2 className="text-3xl font-extrabold text-base-content tracking-tight flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    전자책 관리 대시보드
                </h2>
            </div>

            {/* 메세지 알림 */}
            {msg && (
                <div className={`alert ${msg.includes("완료") ? "alert-success" : "alert-error"} text-white text-sm rounded-xl mb-6 shadow-sm py-3`}>
                    <span>{msg}</span>
                </div>
            )}

            {/* 전자책 등록 폼을 그림자 있는 깔끔한 카드로 묶고, input들을 반응형 Grid/Flex로 배치 */}
            <div className="card bg-base-100 shadow-sm border border-base-200 mb-8">
                <div className="card-body">
                    <h3 className="card-title text-lg mb-4">새 전자책 등록</h3>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                        <input type="text" placeholder="제목" className="input input-bordered flex-1 min-w-[200px]" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
                        <input type="number" placeholder="가격" className="input input-bordered w-32" value={createForm.price} onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })} />
                        <select className="select select-bordered" value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}>
                            <option value="ETC">기타</option>
                            <option value="IT">IT/프로그래밍</option>
                            <option value="NOVEL">소설/문학</option>
                            <option value="BUSINESS">경제/경영</option>
                        </select>
                        <select className="select select-bordered" value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="SOLD_OUT">SOLD_OUT</option>
                        </select>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="form-control w-full md:w-auto">
                            <label className="label py-1"><span className="label-text font-bold text-xs">표지 이미지 (Image)</span></label>
                            {/* 기본 input file을 daisyUI의 file-input으로 변경하여 예쁘게 만듦 */}
                            <input id="input-thumbnail" type="file" accept="image/*" className="file-input file-input-bordered file-input-sm w-full max-w-xs" onChange={(e) => setThumbnail(e.target.files[0])} />
                        </div>
                        <div className="form-control w-full md:w-auto">
                            <label className="label py-1"><span className="label-text font-bold text-xs">전자책 파일 (PDF)</span></label>
                            <input id="input-file" type="file" accept=".pdf" className="file-input file-input-bordered file-input-sm w-full max-w-xs" onChange={(e) => setFile(e.target.files[0])} />
                        </div>
                        <div className="ml-auto mt-4 md:mt-0 w-full md:w-auto">
                            <button onClick={handleCreate} disabled={loading} className="btn btn-primary w-full md:w-auto">
                                {loading ? <span className="loading loading-spinner"></span> : "등록하기"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 목록 새로고침 및 필터 영역 스타일링 */}
            <div className="flex justify-between items-center mb-4 px-2">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-base-content/70">상태 필터:</span>
                    <select className="select select-bordered select-sm" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(0); }}>
                        <option value="ALL">전체 보기</option>
                        <option value="ACTIVE">판매중 (ACTIVE)</option>
                        <option value="INACTIVE">비활성 (INACTIVE)</option>
                        <option value="SOLD_OUT">품절 (SOLD_OUT)</option>
                    </select>
                </div>
                <button onClick={() => fetchList()} className="btn btn-sm btn-outline">↻ 새로고침</button>
            </div>

            {/* 목록 테이블 영역 */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
                {ebooks.length === 0 ? (
                    <div className="text-center py-20 text-base-content/50">표시할 전자책이 없습니다.</div>
                ) : (
                    <div className="overflow-x-auto">
                        {/* table-zebra 클래스로 지브라 패턴 적용 */}
                        <table className="table table-zebra w-full text-sm">
                            <thead className="bg-base-200/50 text-base-content/70">
                                <tr>
                                    <th>ID</th>
                                    <th className="text-center">표지</th>
                                    <th>제목</th>
                                    <th>가격</th>
                                    <th>카테고리</th>
                                    <th>상태</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ebooks.map((ebook) => {
                                    const isEditing = editingId === ebook.id;
                                    return (
                                        <tr key={ebook.id} className="hover">
                                            <td>{ebook.id}</td>
                                            <td className="text-center flex justify-center">
                                                {ebook.thumbnailPath ? (
                                                    // 이미지를 둥근 사각형(rounded-md)과 작은 그림자로 깔끔하게
                                                    <img src={`${BASE_URL}/uploads/${ebook.thumbnailPath}`} alt="표지" className="w-10 h-14 object-cover rounded-md shadow-sm" />
                                                ) : (
                                                    <span className="text-xs text-base-content/30 inline-block py-4">No Image</span>
                                                )}
                                            </td>

                                            <td>
                                                {/* 수정 모드일 때 input 태그를 input-bordered input-sm으로 세련되게 변경 */}
                                                {isEditing ? <input type="text" className="input input-bordered input-sm w-full" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /> : <span className="font-semibold">{ebook.title}</span>}
                                            </td>
                                            
                                            <td>
                                                {isEditing ? <input type="number" className="input input-bordered input-sm w-24" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} /> : `${Number(ebook.price).toLocaleString()}원`}
                                            </td>
                                            
                                            <td>
                                                {isEditing ? (
                                                    <select className="select select-bordered select-sm" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})}>
                                                        <option value="ETC">기타</option>
                                                        <option value="IT">IT/프로그래밍</option>
                                                        <option value="NOVEL">소설/문학</option>
                                                        <option value="BUSINESS">경제/경영</option>
                                                    </select>
                                                ) : (
                                                    <span className="text-base-content/70 font-medium">
                                                        {ebook.category === "IT" ? "IT/프로" : ebook.category === "NOVEL" ? "소설" : ebook.category === "BUSINESS" ? "경제" : "기타"}
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                {isEditing ? (
                                                    <select className="select select-bordered select-sm" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                                                        <option value="ACTIVE">ACTIVE</option>
                                                        <option value="INACTIVE">INACTIVE</option>
                                                        <option value="SOLD_OUT">SOLD_OUT</option>
                                                    </select>
                                                ) : (
                                                    // 상태를 daisyUI 뱃지로 표시
                                                    <div className={`badge badge-sm font-bold ${ebook.status === 'ACTIVE' ? 'badge-success text-white' : ebook.status === 'SOLD_OUT' ? 'badge-error text-white' : 'badge-ghost'}`}>
                                                        {ebook.status}
                                                    </div>
                                                )}
                                            </td>

                                            <td>
                                                {/* 버튼들을 btn-sm btn-ghost 등으로 깔끔하게 묶음 */}
                                                {isEditing ? (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => saveEdit(ebook.id)} disabled={loading} className="btn btn-sm btn-primary">저장</button>
                                                        <button onClick={cancelEdit} className="btn btn-sm btn-ghost">취소</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => startEdit(ebook)} className="btn btn-sm btn-outline">수정</button>
                                                        <button onClick={() => deleteEbook(ebook.id)} disabled={loading} className="btn btn-sm btn-error btn-outline">삭제</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 페이징 컨트롤을 daisyUI의 'join' 컴포넌트를 사용하여 버튼 그룹처럼 예쁘게 만듦 */}
            <div className="flex justify-center mt-8">
                <div className="join shadow-sm">
                    <button 
                        className="join-item btn btn-sm" 
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} 
                        disabled={currentPage === 0}
                    >
                        ◀ 이전
                    </button>
                    <button className="join-item btn btn-sm btn-disabled text-base-content font-bold">
                        {currentPage + 1} / {totalPages} 페이지
                    </button>
                    <button 
                        className="join-item btn btn-sm" 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))} 
                        disabled={currentPage >= totalPages - 1}
                    >
                        다음 ▶
                    </button>
                </div>
            </div>

        </div>
    );
}

export default AdminEbooksPage;