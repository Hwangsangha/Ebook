import { useEffect, useState } from "react";
import { CartApi } from "../api";

function CartPage(){
    const [items, setItems] = useState([]); //장바구니 항목 배열
    const [error, setError] = useState(null); //에러 저장
    const [loading, setLoading] = useState(true); //로딩 상태

    //페이지 처음 로딩 시 실행
    useEffect(() => {
        CartApi.listItems(1)  //userId = 1 가정
            .then(data => {
                setItems(data.items);
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

// 수량 증가
function handleIncrease(item){
    const newQty = item.quantity + 1;

    CartApi.setQuantity({
        userId: 1,
        ebookId: item.ebookId,
        quantity: newQty
    })
        .then(() => {
            //성공하면 화면에 즉시 업뎃
            setItems(prev =>
                prev.map(i =>
                    i.ebookId === item.ebookId ? { ...i, quantity: newQty, subTotal: i.price * newQty } : i
                )
            );
        })
        .catch(err => alert("증가 실패: " + err.message));
}

// 수량 감소
function handleDecrease(item){
    const newQty = Math.max(1, item.quantity - 1);

    CartApi.setQuantity({
        userId: 1,
        ebookId: item.ebookId,
        quantity: newQty
    })
        .then(() => {
            setItems(prev =>
                prev.map(i =>
                    i.ebookId === item.ebookId ? { ...i, quantity: newQty, subTotal: i.price * newQty} : i
                )
            );
        })
        .catch(err => alert("감소 실패: " + err.message));
}

//항목 삭제
function handleRemove(item){
    if(!confirm("이 항목을 삭제하시겠습니까?")) return;

    CartApi.removeItem({
        userId: 1,
        ebookId: item.ebookId
    })
        .then(() => {
            //화면에서 즉시 제거
            setItems(prev =>
                prev.filter(i => i.ebookId !== item.ebookId)
            );
        })
        .catch(err => alert("삭제 실패: " + err.message));
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
                        <td>
                            <button onClick={() => handleDecrease(item)}>-</button>
                            <span style={{ margin: "0 10px"}}>{item.quantity}</span>
                            <button onClick={() => handleIncrease(item)}>+</button>
                        </td>
                        <td>{item.subTotal}</td>
                        <td>
                            <button onClick={() => handleRemove(item)}>삭제</button>
                        </td>
                      </tr>  
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CartPage;