"use client";
import { useState } from "react";
export default function Home() {
  const [result, setResult] = useState("");
  async function handleOnClick() {
    const res = await fetch('/api/usatt', {
      method: 'POST',
      body: JSON.stringify({
        siteUrl: 'https://spacejelly.dev'
      })
    });
    const data = await res.json();
    setResult(data);
  }
  return (
    <div>
      <button onClick={handleOnClick}>Click</button>
      <p>{result}</p>
    </div>
  );
}
