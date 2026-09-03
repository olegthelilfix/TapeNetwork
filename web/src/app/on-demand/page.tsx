import { notFound } from "next/navigation";

import type { AsyncServerComponent } from "@/app/_types";
import { CatalogFeature } from "@/features/catalog/list";
import { getCategories, resolveControllerResult } from "@/services/server/controllers";

export const dynamic = "force-dynamic";
export const metadata = {
    title: "On Demand",
    description: "The full Tape Network catalog — macro, options, technicals, earnings and long-form, by category.",
    alternates: { canonical: "/on-demand" },
};

const OnDemandPage: AsyncServerComponent<Record<never, never>> = async () => {
    const categories = await resolveControllerResult(getCategories(), { onNotFound: notFound });

    return <CatalogFeature categories={categories} />;
};

export default OnDemandPage;
