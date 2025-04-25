'use client'

import { useState } from "react";

 
 
export function Test() {
    const [data, setData] = useState<string | null>(null);

    const handleClick = async () => {
      const res = await fetch('/api/test');
      const data = await res.json();
      setData(data);
    };
  
    return (
      <div>
        <button onClick={handleClick}>Get IP</button>
        {data && <p>Your IP: {JSON.stringify(data)}</p>}
      </div>
    );
}