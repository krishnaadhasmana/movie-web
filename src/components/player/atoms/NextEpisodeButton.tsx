import classNames from "classnames";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { Icon, Icons } from "@/components/Icon";
import { usePlayerMeta } from "@/components/player/hooks/usePlayerMeta";
import { Flare } from "@/components/utils/Flare";
import { Transition } from "@/components/utils/Transition";
import { PlayerMeta } from "@/stores/player/slices/source";
import { usePlayerStore } from "@/stores/player/store";

function shouldShowNextEpisodeButton(
  time: number,
  duration: number,
): "always" | "hover" | "none" {
  const percentage = time / duration;
  const secondsFromEnd = duration - time;
  if (secondsFromEnd <= 30) return "always";
  if (percentage >= 0.9) return "hover";
  return "none";
}

function Button(props: {
  className: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={classNames(
        "font-bold rounded h-10 w-40 scale-95 hover:scale-100 transition-all duration-200",
        props.className,
      )}
      type="button"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}

export function NextEpisodeButton(props: {
  controlsShowing: boolean;
  onChange?: (meta: PlayerMeta) => void;
}) {
  const { t } = useTranslation();
  const duration = usePlayerStore((s) => s.progress.duration);
  const isHidden = usePlayerStore((s) => s.interface.hideNextEpisodeBtn);
  const meta = usePlayerStore((s) => s.meta);
  const { setDirectMeta } = usePlayerMeta();
  const hideNextEpisodeButton = usePlayerStore((s) => s.hideNextEpisodeButton);
  const metaType = usePlayerStore((s) => s.meta?.type);
  const time = usePlayerStore((s) => s.progress.time);
  const showingState = shouldShowNextEpisodeButton(time, duration);
  const status = usePlayerStore((s) => s.status);
  const setShouldStartFromBeginning = usePlayerStore(
    (s) => s.setShouldStartFromBeginning,
  );

  let show = false;
  if (showingState === "always") show = true;
  else if (showingState === "hover" && props.controlsShowing) show = true;
  if (isHidden || status !== "playing" || duration === 0) show = false;

  const animation = showingState === "hover" ? "slide-up" : "fade";
  let bottom = "bottom-[calc(6rem+env(safe-area-inset-bottom))]";
  if (showingState === "always")
    bottom = props.controlsShowing
      ? bottom
      : "bottom-[calc(3rem+env(safe-area-inset-bottom))]";

  const nextEp = meta?.episodes?.find(
    (v) => v.number === (meta?.episode?.number ?? 0) + 1,
  );

  const loadNextEpisode = useCallback(() => {
    if (!meta || !nextEp) return;
    const metaCopy = { ...meta };
    metaCopy.episode = nextEp;
    setShouldStartFromBeginning(true);
    setDirectMeta(metaCopy);
    props.onChange?.(metaCopy);
  }, [setDirectMeta, nextEp, meta, props, setShouldStartFromBeginning]);

  if (!meta?.episode || !nextEp) return null;
  if (metaType !== "show") return null;

  return (
    <Transition
      animation={animation}
      show={show}
      className="absolute right-[calc(3rem+env(safe-area-inset-right))] bottom-0"
    >
      <div
        className={classNames([
          "absolute bottom-0 right-0 transition-[bottom] duration-200 flex items-center space-x-3 mb-7",
          bottom,
        ])}
      >
        <Flare.Base
          className={`
      group rounded-2xl transition-colors duration-100 focus:relative focus:z-10 bg-video-context-hoverColor tabbable opacity-90"
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
            <Button
              className="py-px box-content bg-opacity-90 text-buttons-secondaryText"
              onClick={hideNextEpisodeButton}
            >
              {t("player.nextEpisode.cancel")}
            </Button>
          </Flare.Child>
        </Flare.Base>

        <Flare.Base
          className={`
      group rounded-2xl transition-colors duration-100 focus:relative focus:z-10 tabbable bg-slate-400 opacity-90"
      `}
        >
          <Flare.Light
            flareSize={100}
            cssColorVar="--colors-mediaCard-hoverAccent"
            backgroundClass="duration-50, bg-white"
            className={classNames({
              "rounded-2xl bg-video-context-hoverColor group-hover:opacity-100":
                true,
            })}
          />
          <Flare.Child
            className={`pointer-events-auto relative p-1 transition-transform duration-100 group-hover:scale-95 bottom-0"
        }`}
          >
            <Button
              onClick={() => loadNextEpisode()}
              className="text-buttons-primaryText flex justify-center items-center"
            >
              <Icon className="text-xl mr-1" icon={Icons.SKIP_EPISODE} />
              {t("player.nextEpisode.next")}
            </Button>
          </Flare.Child>
        </Flare.Base>
      </div>
    </Transition>
  );
}
