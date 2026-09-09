import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { AsyncServerComponent } from "@/app/_types";
import { ShowDetailsFeature } from "@/features/shows/details";
import { getShowBySlug, resolveControllerResult } from "@/services/server/controllers";

export const dynamic = "force-dynamic";

type ShowDetailsPageProps = {
    readonly params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({
    params,
}: ShowDetailsPageProps): Promise<Metadata> => {
    try {
        const { slug } = await params;
        const show = await resolveControllerResult(getShowBySlug(slug), { onNotFound: notFound });
        const imageUrl = show.imageUrl;

        return {
            title: show.name,
            description: show.blurb ?? undefined,
            alternates: { canonical: `/shows/${show.slug}` },
            openGraph: {
                title: show.name,
                description: show.blurb ?? undefined,
                images: imageUrl ? [imageUrl] : undefined,
            },
        };
    } catch {
        return { title: "Show not found" };
    }
};

const ShowDetailsPage: AsyncServerComponent<ShowDetailsPageProps> = async ({
    params,
}) => {
    const { slug } = await params;
    const show = await resolveControllerResult(getShowBySlug(slug), { onNotFound: notFound });

    return <ShowDetailsFeature show={show} />;
};

export default ShowDetailsPage;
