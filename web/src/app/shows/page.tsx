import { notFound } from "next/navigation";
import type { AsyncServerComponent } from "@/app/_types";
import { ShowsListFeature } from "@/features/shows/list";
import { getShows, resolveControllerResult } from "@/services/server/controllers";

export const dynamic = "force-dynamic";
export const metadata = {
    title: "Shows",
    description: "Every Tape Network show — markets, macro, options, technicals and long-form interviews.",
    alternates: { canonical: "/shows" },
};

const ShowsPage: AsyncServerComponent<Record<never, never>> = async () => {
    const shows = await resolveControllerResult(getShows(), { onNotFound: notFound });

    return <ShowsListFeature shows={shows} />;
};

export default ShowsPage;
