"use client"

import { decrypt, encrypt,  } from "@/lib/utils";
import { useState } from "react";

export default  function TestPage() {
  const [a,b]=useState<string>("")
  const denemex = ()=>{
    const y = encrypt("huseyincorakli");
    console.log(y);
    b(y)
    
  }

  const denemey = ()=>{
    const y = decrypt(a);
    console.log(y);
    
  }

  return (
    <div>
      <button onClick={denemex}>enc</button>
      <button onClick={denemey}>dec</button>
    </div>
  );
}
