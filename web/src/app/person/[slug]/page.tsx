import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { AsyncServerComponent } from "@/app/_types";
import { PersonFeature } from "@/features/person";
import { getPersonBySlug, resolveControllerResult } from "@/services/server/controllers";

export const dynamic = "force-dynamic";

type PersonPageProps = {
    readonly params: Promise<{ slug: string }>;
};

export const generateMetadata = async ({
    params,
}: PersonPageProps): Promise<Metadata> => {
    try {
        const { slug } = await params;
        const person = await resolveControllerResult(getPersonBySlug(slug), { onNotFound: notFound });
        const imageUrl = person.imageUrl;

        return {
            title: person.name,
            description: person.bio ?? undefined,
            alternates: { canonical: `/person/${person.slug}` },
            openGraph: {
                title: person.name,
                description: person.bio ?? undefined,
                type: "profile",
                images: imageUrl ? [imageUrl] : undefined,
            },
        };
    } catch {
        return { title: "Person not found" };
    }
};

const PersonPage: AsyncServerComponent<PersonPageProps> = async ({ params }) => {
    const { slug } = await params;
    const person = await resolveControllerResult(getPersonBySlug(slug), { onNotFound: notFound });

    return <PersonFeature person={person} />;
};

export default PersonPage;
