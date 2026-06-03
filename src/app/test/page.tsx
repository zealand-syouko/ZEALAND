"use client";

import { useState } from "react";

export default function TestPage() {
  const [url, setUrl] = useState("http://localhost:3456/api/proxy");
  const [key, setKey] = useState("sk-9aaf2db3b7e8e173cea97eeaa70d47ba7092f51c15e3b4bb");
  const [msg, setMsg] = useState("你好");
  const [result, setResult] = useState("等待测试...");

  async function test() {
    setResult("请求中...");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: msg }], stream: false }),
      });
      const data = await res.json();
      if (data.choices) {
        setResult("✅ 成功!\n\n回复: " + data.choices[0].message.content + "\n\nToken 用量: " + JSON.stringify(data.usage));
      } else {
        setResult("❌ 错误:\n" + JSON.stringify(data, null, 2));
      }
    } catch (e: any) {
      setResult("❌ 网络错误: " + e.message);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", padding: 20, fontFamily: "sans-serif" }}>
      <h2>Token Relay 本地测试</h2>
      <label>API 地址</label><br/>
      <input value={url} onChange={e => setUrl(e.target.value)} style={{ width: "100%", padding: 8, margin: "5px 0" }} /><br/>
      <label>API Key</label><br/>
      <input value={key} onChange={e => setKey(e.target.value)} style={{ width: "100%", padding: 8, margin: "5px 0" }} /><br/>
      <label>消息</label><br/>
      <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3} style={{ width: "100%", padding: 8, margin: "5px 0" }} /><br/>
      <button onClick={test} style={{ width: "100%", padding: 12, background: "black", color: "white", border: "none", borderRadius: 6, fontSize: 16, cursor: "pointer" }}>发送测试</button>
      <div style={{ background: "#f5f5f5", padding: 15, borderRadius: 6, marginTop: 15, whiteSpace: "pre-wrap", fontSize: 14 }}>{result}</div>
    </div>
  );
}
