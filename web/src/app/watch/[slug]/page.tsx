import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { AsyncServerComponent } from "@/app/_types";
import { PlayerFeature } from "@/features/player";
import { getPlayerBySlug, resolveControllerResult } from "@/services/server/controllers";

export const dynamic = "force-dynamic";

type PlayerPageProps = {
    readonly params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({
    params,
}: PlayerPageProps): Promise<Metadata> => {
    try {
        const { slug } = await params;
        const player = await resolveControllerResult(getPlayerBySlug(slug), { onNotFound: notFound });
        const imageUrl = player.imageUrl;

        return {
            title: player.title,
            description: player.description ?? undefined,
            alternates: { canonical: `/watch/${player.slug}` },
            openGraph: {
                title: player.title,
                type: "video.other",
                images: imageUrl ? [imageUrl] : undefined,
            },
        };
    } catch {
        return { title: "Not found" };
    }
};

const PlayerPage: AsyncServerComponent<PlayerPageProps> = async ({ params }) => {
    const { slug } = await params;
    const player = await resolveControllerResult(getPlayerBySlug(slug), { onNotFound: notFound });

    return <PlayerFeature player={player} />;
};

export default PlayerPage;
