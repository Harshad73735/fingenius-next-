"use client";

import { useState, useEffect } from "react";

export default function Greeting({ name }) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"
    );
  }, []);

  return (
    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground dark:text-white leading-tight">
      Good {greeting || "day"}, {name || "there"}
      <span className="inline-block ml-2 text-3xl sm:text-4xl animate-bounce origin-bottom">👋</span>
    </h1>
  );
}
