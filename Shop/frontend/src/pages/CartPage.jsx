import { useEffect, useState } from "react";
import { CartApi } from "../api";

function Cartpage(){
    const [items, setItems] = useState([]); //장바구니 항목 배열
    const [error, setError] = useState(null); //에러 저장
    const [loading, setLoading] = useState(true); //로딩 상태

    //페이지 처음 로딩 시 실행
    useEffect(() => {
        CartApi.listItems(1)  //userId = 1 가정
            .then(data => {
                setItems(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || String(err));
                setLoading(false);
            });
    }, []);

    //에러 발생시
    if(error) return <p>에러: {error}</p>;

    //api 로딩 중
    if(loading) return <p>불러오는 중</p>;

    //장바구니가 비었을때
    if(items.length === 0){
        return <p>장바구니가 비었습니다.</p>;
    }

    //항목 있을때
    return (
        <div>
            <h1>장바구니 목록</h1>

            <table border="1" cellPadding="8" style={{borderCollapse: "collapse", width: "100%"}}>
                <thread>
                    <tr>
                        <th>제목</th>
                        <th>가격</th>
                        <th>수량</th>
                        <th>소계</th>
                    </tr>
                </thread>

                <tbody>
                    {items.map(item => (
                      <tr key={item.ebookId}>
                        <td>{item.title}</td>
                        <td>{item.price}</td>
                        <td>{item.quantity}</td>
                        <td>{item.subTotal}</td>
                      </tr>  
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Cartpage;