import { useEffect } from 'react'
import { CartApi } from "./api"

function App() {
  useEffect(() => {
    CartApi.summary(1)
      .then(data => console.log("요약:", data))
      .catch(err => console.error("에러:", err.message));
  }, []);

  return <h1>React 연결 테스트</h1>;
}

export default App
