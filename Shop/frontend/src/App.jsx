import { useEffect, useState } from 'react'
import { CartApi } from "./api"

function App() {
  const [summary, setSummary] = useState(null);
  const [error, serError] = useState(null);

  useEffect(() => {
    console.log("App 마운트됨, CartApi.summary 호출 시작");

    CartApi.summary(1)
      .then(data => {
        console.log("요약 등답:", data);
        setSummary(data);
      })
      .catch(err => {
        console.log("요약 에러:", err)
        serError(err.message || String(err));
      });
  }, []);

  if(error) return <p>에러: {error}</p>;
  if(!summary) return <p>불러오는 중...</p>;

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif"}}>
      <h1>프론트 연결 디버그 화면</h1>

      <div style={{ marginTop: 16}}>
        <h2>상태</h2>
        <p>error: <code>{error ?? "없음"}</code></p>
        <p>summary 존재 여부: <code>{summary ? "있음" : "null"}</code></p>
      </div>

      <div style={{margin: 16}}>
        <h2>summary 원본 데이터</h2>
        <pre style={{ background: "#f3f4f6", padding: 12, borderRadius: 8}}>
          {JSON.stringify(summary, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default App
