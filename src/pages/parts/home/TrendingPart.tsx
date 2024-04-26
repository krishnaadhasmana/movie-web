import { useEffect, useState } from "react";
import { useAsyncFn } from "react-use";

import {
  formatTMDBMetaToMediaItem,
  formatTMDBSearchResult,
  getTrending,
} from "@/backend/metadata/tmdb";
import { Icons } from "@/components/Icon";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { MediaGrid } from "@/components/media/MediaGrid";
import { WatchedMediaCard } from "@/components/media/WatchedMediaCard";
import { MediaItem } from "@/utils/mediaTypes";

async function prepareTrending() {
  const data = await getTrending();
  const results = data.map((v) => {
    const formattedResult = formatTMDBSearchResult(v, v.media_type);
    return formatTMDBMetaToMediaItem(formattedResult);
  });

  return results;
}

export default function TrendingPart() {
  // getTrending() into results
  const [results, setResults] = useState<MediaItem[]>([]);

  const [state, exec] = useAsyncFn(() => prepareTrending());

  useEffect(() => {
    async function fetchTrending() {
      const trendingResults = await exec();
      if (!trendingResults) return;
      setResults(trendingResults);
    }

    fetchTrending();
  }, [exec]);

  if (state.loading) return null;
  if (state.error) return null;
  if (!results) return null;

  console.log(results);

  return (
    <div>
      {results.length > 0 ? (
        <div>
          <SectionHeading
            //   title={t("home.search.sectionTitle")}
            title="Trending Today"
            icon={Icons.TACHOMETER}
          />
          <MediaGrid>
            {results.map((v) => (
              <WatchedMediaCard key={v.id.toString()} media={v} />
            ))}
          </MediaGrid>
        </div>
      ) : null}
    </div>
  );
}