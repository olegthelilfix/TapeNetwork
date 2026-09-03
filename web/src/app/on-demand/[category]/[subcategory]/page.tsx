import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { AsyncServerComponent } from "@/app/_types";
import { SubcategoryFeature } from "@/features/catalog/subcategory";
import {
    getSubcategoryBySlug,
    resolveControllerResult,
} from "@/services/server/controllers";

export const dynamic = "force-dynamic";

type SubcategoryPageProps = {
    readonly params: Promise<{ category: string; subcategory: string }>;
};

export const generateMetadata = async ({
    params,
}: SubcategoryPageProps): Promise<Metadata> => {
    try {
        const { subcategory } = await params;
        const subcategoryDetail = await resolveControllerResult(
            getSubcategoryBySlug(subcategory),
            { onNotFound: notFound },
        );

        return {
            title: `${subcategoryDetail.name} · ${subcategoryDetail.categoryName}`,
            description: subcategoryDetail.blurb ?? undefined,
            alternates: {
                canonical: `/on-demand/${subcategoryDetail.categorySlug}/${subcategoryDetail.slug}`,
            },
        };
    } catch {
        return { title: "Not found" };
    }
};

const SubcategoryPage: AsyncServerComponent<SubcategoryPageProps> = async ({
    params,
}) => {
    const { subcategory } = await params;
    const subcategoryDetail = await resolveControllerResult(
        getSubcategoryBySlug(subcategory),
        { onNotFound: notFound },
    );

    return <SubcategoryFeature subcategory={subcategoryDetail} />;
};

export default SubcategoryPage;
