//전자책 목록 페이지

import "../styles/ebook.css";
import { useEffect, useState } from "react";
import { CartApi, EbookApi } from "../api";

function EbookListPage() {
    const [ebooks, setEbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = 1;

    useEffect(() => {
        console.log("API BASE:", import.meta.env.VITE_API_BASE);

        EbookApi.list()
            .then(data => {
                console.log("응답 전체: ", data);
                setEbooks(data.items);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>불러오는 중...</p>;
    if (error) return <p>에러: {error}</p>;
    if (!ebooks || ebooks.length === 0) return <p>등록된 전자책이 없습니다.</p>;

    return (
        <div className="page">
            <h1>전자책 목록</h1>

            <table className="table">
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
                            <td className="title">{e.title}</td>
                            <td className="author">{e.author}</td>
                            <td className="price">{e.price.toLocaleString()}원</td>
                            <td className="action">
                                <button className="btn" onClick={() =>
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