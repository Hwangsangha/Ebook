//전자책 목록 페이지

import { useEffect, useState } from "react";
import axios from "axios";
import { CartApi } from "../api";

function EbookListPage(){
    const [ebooks, setEbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = 1;

    useEffect(() => {
        axios
            .get("http://localhost:8080/ebooks")
            .then(res => {
                setEbooks(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if(loading) return <p>불러오는 중...</p>;

    return (
        <div>
            <h1>전자책 목록</h1>

            <table border={1} cellPadding={8} style={{width: "100%", borderCollapse: "collapse"}}>
                <thread>
                    <tr>
                        <th>제목</th>
                        <th>저자</th>
                        <th>가격</th>
                        <th></th>
                    </tr>
                </thread>
                <tbody>
                    {ebooks.map(e => (
                        <tr key={e.id}>
                            <td>{e.title}</td>
                            <td>{e.author}</td>
                            <td>{e.price}</td>
                            <td>
                                <button onClick={() =>
                                    CartApi.addItem({
                                        userId,
                                        ebookId: e.id,
                                        quantity: 1
                                    })
                                }>
                                    장바구니 담기
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default EbookListPage;