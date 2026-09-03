import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { AsyncServerComponent } from "@/app/_types";
import { CategoryFeature } from "@/features/catalog/category";
import { getCategoryBySlug, resolveControllerResult } from "@/services/server/controllers";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
    readonly params: Promise<{ category: string }>;
};

export const generateMetadata = async ({
    params,
}: CategoryPageProps): Promise<Metadata> => {
    try {
        const { category } = await params;
        const categoryDetail = await resolveControllerResult(
            getCategoryBySlug(category),
            { onNotFound: notFound },
        );

        return {
            title: categoryDetail.name,
            description: categoryDetail.blurb ?? undefined,
            alternates: { canonical: `/on-demand/${categoryDetail.slug}` },
        };
    } catch {
        return { title: "Category not found" };
    }
};

const CategoryPage: AsyncServerComponent<CategoryPageProps> = async ({ params }) => {
    const { category } = await params;
    const categoryDetail = await resolveControllerResult(
        getCategoryBySlug(category),
        { onNotFound: notFound },
    );

    return <CategoryFeature category={categoryDetail} />;
};

export default CategoryPage;
