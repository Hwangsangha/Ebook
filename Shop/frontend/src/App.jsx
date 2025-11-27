import { useEffect, useState } from 'react'
import { CartApi } from "./api"

function App() {
  const [summary, setSummary] = useState(null);
  const [error, serError] = useState(null);

  useEffect(() => {
    CartApi.summary(1)
      .then(setSummary)
      .catch(err => serError(err.message || String(err)));
  }, []);

  if(error){
    return(
      <div style={page}>
        <div style={card}>
          <h2>에러</h2>
          <p2 style={muted}>{error}</p2>
        </div>
      </div>
    );
  }
  if(!summary){
    return(
      <div style={page}>
        <div style={card}>불러오는 중...</div>
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={{marginTop: 0, marginBottom: 8}}>장바구니 요약</h1>
        <p style={muted}>userId = 1 기준</p>

        <div>
          <span>총 수량</span>
          <strong>{summary.totalQuantity}</strong>
        </div>

        <div>
          <span>총 금액</span>
          <strong>{summary.totalAmount}</strong>
        </div>

        <button
          style={button}
          onClick={() =>
            CartApi.summary(1)
              .then(setSummary)
              .catch(err => setError(err.message || String(err)))
          }>
            새로고침
        </button>
      </div>
    </div>
  );
}

const page = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  background: "#111827",
  color: "#f9fafb",
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const card = {
  background: "#111827",
  border: "1px solid #374151",
  borderRadius: 12,
  padding: 20,
  width: 360,
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  borderTop: "1px solid #1f2933",
};

const muted = {
  fontSize: 12,
  color: "#9ca3af",
};

const button = {
  marginTop: 16,
  width: "100%",
  padding: "10px, 12px",
  borderRadius: 8,
  border: "1px solid #4b5563",
  background: "#1f2937",
  color: "#f9fafb",
  cursor: "pointer",
};

export default App
