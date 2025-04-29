"use client"

import {  isBlocked } from "@/app/action";
import { useState } from "react";

export default  function TestPage() {
  
  const getCookie =async()=>{
  
    const a =  await isBlocked()
    console.log(a);
    
  }
  

  return (
    <div>
      <button onClick={getCookie}>enc</button>
    </div>
  );
}
