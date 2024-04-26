import { useCallback, useRef } from "react";

import { Icon, Icons } from "@/components/Icon";
import {
  makePercentage,
  makePercentageString,
  useProgressBar,
} from "@/hooks/useProgressBar";
import { usePlayerStore } from "@/stores/player/store";
import { canChangeVolume } from "@/utils/detectFeatures";

import { useVolume } from "../hooks/useVolume";

interface Props {
  className?: string;
}

export function Volume(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const setHovering = usePlayerStore((s) => s.setHoveringLeftControls);
  const hovering = usePlayerStore((s) => s.interface.leftControlHovering);
  const volume = usePlayerStore((s) => s.mediaPlaying.volume);
  const { setVolume, toggleMute } = useVolume();

  const commitVolume = useCallback(
    (percentage: number) => {
      setVolume(percentage);
    },
    [setVolume],
  );

  const { dragging, dragPercentage, dragMouseDown } = useProgressBar(
    ref,
    commitVolume,
    true,
  );

  const handleClick = useCallback(() => {
    toggleMute();
  }, [toggleMute]);

  const handleMouseEnter = useCallback(async () => {
    if (await canChangeVolume()) setHovering(true);
    document.body.classList.add("overflow-y-hidden");
  }, [setHovering]);

  const handleMouseLeave = () => {
    document.body.classList.remove("overflow-y-hidden");
  };

  let percentage = makePercentage(volume * 100);
  if (dragging) percentage = makePercentage(dragPercentage);
  const percentageString = makePercentageString(percentage);

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      let newVolume = volume - event.deltaY / 1000;
      newVolume = Math.max(0, Math.min(newVolume, 1));
      setVolume(newVolume);
    },
    [volume, setVolume],
  );

  return (
    <div
      className={props.className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    >
      <div className="pointer-events-auto flex cursor-pointer items-center py-0 touch-none">
        <div className="px-4 text-2xl text-white" onClick={handleClick}>
          {/* <Icon icon={percentage > 0 ? Icons.VOLUME : Icons.VOLUME_X} /> */}
        </div>
        <div
          className={`linear -ml-2 w-0 overflow-hidden transition-[width,opacity] duration-300 ${
            hovering || dragging ? "!w-24 opacity-100" : "w-24 opacity-100"
          }`}
        >
          <div
            ref={ref}
            className="flex h-10 w-20 items-center px-2"
            onMouseDown={dragMouseDown}
            onTouchStart={dragMouseDown}
          >
            {/* <div className="relative h-1 flex-1 rounded-full bg-gray-500 bg-opacity-50" */}
            <div
              className={[
                "relative w-full bg-opacity-100 transition-all duration-10ms linear group-hover:h-4 h-2 rounded-md",
                dragging ? "!h-2" : "",
              ].join(" ")}
              style={{ backgroundColor: "rgb(81, 87, 90)" }}
            >
              <div
                // className="absolute inset-y-0 left-0 flex items-center justify-end rounded-full bg-video-audio-set"
                // style={{
                //   width: percentageString,
                // }}

                className="absolute top-0 dir-neutral:left-0 h-full bg-progress-filled flex justify-end items-center overflow-hidden rounded-md"
                style={{
                  transition: dragging
                    ? "width 0.3s ease-out"
                    : "width 0.3s ease-out",
                  width: percentageString,
                  backgroundColor: dragging
                    ? "rgb(255 255 255)"
                    : "rgb(182 193 206)",
                }}
              />
              </div>
              </div>
        </div>
      </div>
    </div>
  );
}
