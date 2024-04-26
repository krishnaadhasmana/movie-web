import classNames from "classnames";
import { forwardRef } from "react";

import { Icon, Icons } from "@/components/Icon";
import { Flare } from "@/components/utils/Flare";

export interface VideoPlayerButtonProps {
  children?: React.ReactNode;
  onClick?: (el: HTMLButtonElement) => void;
  icon?: Icons;
  iconSizeClass?: string;
  className?: string;
  activeClass?: string;
}

export const VideoPlayerButton = forwardRef<
  HTMLButtonElement,
  VideoPlayerButtonProps
>((props, ref) => {
  return (
       <Flare.Base
      className={`
      group rounded-2xl bg-black transition-colors duration-100 focus:relative focus:z-10 hover:bg-video-context-hoverColor tabbable"
      `}
      >
         <Flare.Light
        flareSize={100}
        cssColorVar="--colors-mediaCard-hoverAccent"
        backgroundClass="bg-video-context-hoverColor duration-50"
        className={classNames({
          "rounded-2xl bg-video-context-hoverColor group-hover:opacity-100":
            true,
        })}
      />
      <Flare.Child
        className={`pointer-events-auto relative p-1 transition-transform duration-100 group-hover:scale-95 bottom-0"
        }`}
      >
        <button
          ref={ref}
          type="button"
          onClick={(e) => props.onClick?.(e.currentTarget as HTMLButtonElement)}
          className={classNames([
            "tabbable p-2 transition-transform duration-100 flex items-center justify-center gap-3 overflow-hidden",
            props.activeClass ??
              "active:scale-110 active:bg-opacity-75 active:text-white",
            props.className ?? "",
          ])}
          style={{ borderRadius: "7px" }}
        >
          {props.icon && (
            <Icon
              className={props.iconSizeClass || "text-2xl"}
              icon={props.icon}
            />
          )}
          {props.children}
        </button>
      </Flare.Child>
      </Flare.Base>
  );
});
