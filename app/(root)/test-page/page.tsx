"use client";

import { isBlocked } from "@/app/action";
import { useState } from "react";

export default function TestPage() {
  const getCookie = async () => {
    const a = await isBlocked();
  };

  return (
    <div>
      <button onClick={getCookie}>enc</button>
    </div>
  );
}
