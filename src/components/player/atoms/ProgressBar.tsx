import {
  MouseEvent,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useProgressBar } from "@/hooks/useProgressBar";
import { nearestImageAt } from "@/stores/player/slices/thumbnails";
import { usePlayerStore } from "@/stores/player/store";
import { durationExceedsHour, formatSeconds } from "@/utils/formatSeconds";

function ThumbnailDisplay(props: { at: number; show: boolean }) {
  const thumbnailImages = usePlayerStore((s) => s.thumbnails.images);
  const currentThumbnail = useMemo(() => {
    return nearestImageAt(thumbnailImages, props.at)?.image;
  }, [thumbnailImages, props.at]);
  const [offsets, setOffsets] = useState({
    offscreenLeft: 0,
    offscreenRight: 0,
  });
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const padding = 32;
    const left = Math.max(0, (rect.left - padding) * -1);
    const right = Math.max(0, rect.right + padding - window.innerWidth);

    setOffsets({
      offscreenLeft: left,
      offscreenRight: right,
    });
  }, [props.at]);

  if (!props.show || !currentThumbnail) return null;
  return (
    <div className="flex flex-col items-center -translate-x-1/2 pointer-events-none">
      <div className="w-screen flex justify-center">
        <div ref={ref}>
          <div
            style={{
              transform: `translateX(${
                offsets.offscreenLeft > 0
                  ? offsets.offscreenLeft
                  : -offsets.offscreenRight
              }px)`,
            }}
          >
            <img
              src={currentThumbnail.data}
              className="h-24 border rounded-xl border-gray-800"
            />
            <p className="text-center mt-1">
              {formatSeconds(
                Math.max(props.at, 0),
                durationExceedsHour(props.at),
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function useMouseHoverPosition(barRef: RefObject<HTMLDivElement>) {
  const [mousePos, setMousePos] = useState(-1);

  const mouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const bar = barRef.current;
      if (!bar) return;
      const rect = barRef.current.getBoundingClientRect();
      const pos = (e.pageX - rect.left) / barRef.current.offsetWidth;
      setMousePos(pos * 100);
    },
    [setMousePos, barRef],
  );

  const mouseLeave = useCallback(() => {
    setMousePos(-1);
  }, [setMousePos]);

  return { mousePos, mouseMove, mouseLeave };
}

export function ProgressBar() {
  const { duration, time, buffered } = usePlayerStore((s) => s.progress);
  const display = usePlayerStore((s) => s.display);
  const setDraggingTime = usePlayerStore((s) => s.setDraggingTime);
  const setSeeking = usePlayerStore((s) => s.setSeeking);
  const { isSeeking } = usePlayerStore((s) => s.interface);

  const commitTime = useCallback(
    (percentage: number) => {
      display?.setTime(percentage * duration);
    },
    [duration, display],
  );

  const ref = useRef<HTMLDivElement>(null);
  const { mouseMove, mouseLeave, mousePos } = useMouseHoverPosition(ref);

  const { dragging, dragPercentage, dragMouseDown } = useProgressBar(
    ref,
    commitTime,
  );
  useEffect(() => {
    setSeeking(dragging);
  }, [setSeeking, dragging]);

  useEffect(() => {
    setDraggingTime((dragPercentage / 100) * duration);
  }, [setDraggingTime, duration, dragPercentage]);

  return (
    <div className="w-full relative mb-2" dir="ltr">
      <div className="top-0 absolute inset-x-0">
        <div
          className="absolute bottom-0"
          style={{
            left: `${mousePos}%`,
          }}
        >
          <ThumbnailDisplay
            at={Math.floor((mousePos / 100) * duration)}
            show={mousePos > -1}
          />
        </div>
      </div>

      <div className="w-full" ref={ref}>
        <div
          className="group w-full h-4 flex items-center cursor-pointer"
          onMouseDown={dragMouseDown}
          onTouchStart={dragMouseDown}
          onMouseLeave={mouseLeave}
          onMouseMove={mouseMove}
        >
          <div
            className={[
              "relative w-full bg-opacity-100 transition-all duration-10ms linear group-hover:h-4 h-2 rounded-md",
              dragging ? "!h-2" : "",
            ].join(" ")}
            style={{ backgroundColor: "rgb(81, 87, 90)" }}
          >
            {/* Pre-loaded content bar */}
            <div
              className="absolute top-0 left-0 h-full rounded-md bg-progress-preloaded flex justify-end items-center bg-opacity-0"
              style={{
                width: `${(buffered / duration) * 100}%`,
              }}
            />

            {/* Actual progress bar */}
            <div
              className="absolute top-0 dir-neutral:left-0 h-full bg-progress-filled flex justify-end items-center overflow-hidden rounded-l-md"
              style={{
                transition: dragging
                  ? "width 0.3s ease-out"
                  : "width 0.3s ease-out",
                width: `${
                  Math.max(
                    0,
                    Math.min(
                      1,
                      dragging ? dragPercentage / 100 : time / duration,
                    ),
                  ) * 100
                }%`,
                backgroundColor: dragging
                  ? "rgb(255 255 255)"
                  : "rgb(182 193 206)",
              }}
            >
              {/* Seeker dot on progress bar */}
              {/* <div
                className={[
                  "w-3 min-w-3 h-3 rounded-full bg-white transition-all duration-200 ease-in-out transform -translate-y-1/2 group-hover:scale-125",
                  isSeeking ? "scale-125" : "",
                ].join(" ")}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
