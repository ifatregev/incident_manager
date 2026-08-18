import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

type HealthStatus = "checking" | "ok" | "error";

function App() {
  const [status, setStatus] = useState<HealthStatus>("checking");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/health`)
      .then((res) => (res.ok ? setStatus("ok") : setStatus("error")))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Incident Hub</h1>
      <p>Server health check ({API_BASE_URL}/api/health): {status}</p>
    </main>
  );
}

export default App;
