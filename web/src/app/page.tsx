import { notFound } from "next/navigation";

import type { AsyncServerComponent } from "@/app/_types";
import { HomeFeature } from "@/features/home";
import {
    getHome,
    getShows,
    resolveControllerResult,
} from "@/services/server/controllers";

export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" } };

const HomePage: AsyncServerComponent<Record<never, never>> = async () => {
    const [home, shows] = await Promise.all([
        resolveControllerResult(getHome(), { onNotFound: notFound }),
        resolveControllerResult(getShows(), { onNotFound: notFound }),
    ]);

    return <HomeFeature home={home} shows={shows} />;
};

export default HomePage;
