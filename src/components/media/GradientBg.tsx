import React, { useEffect, useRef } from "react";

import "@/assets/css/index.css";

export function GradientBg() {
  useEffect(() => {
    const cursor = document.querySelector(".GradientBlob") as HTMLDivElement;
    const moveCursor = (e: MouseEvent) => {
      const x = e.clientX + window.scrollX;
      const y = e.clientY + window.scrollY;
      cursor.style.transform = `translate3d(calc(${x}px - 20%), calc(${y}px - 50%), 0)`;
      // cursor.animate(
      //   { left: `${x} px`, top: `${y}px` },
      //   { duration: 3000, fill: 'forwards' }
      // );
    };

    document.addEventListener("mousemove", moveCursor);

    return () => {
      document.removeEventListener("mousemove", moveCursor);
    };
  }, []);

  // useEffect(() => {
  // const blob = document.querySelector(".GradientBlob") as HTMLDivElement;

  // window.onpointermove = (event) => {
  //   const { clientX, clientY } = event;

  //   blob.animate(
  //     {
  //       left: `${clientX}px`,
  //       top: `${clientY}px`,
  //     },
  //     { duration: 500, fill: "forwards" },
  //   );
  // };
  // }, );

  return (
    <div className="blur-3xl opacity-60">
      <div className="GradientBlob" />
    </div>
  );
}