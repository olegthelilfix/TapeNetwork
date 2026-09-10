import { Heatmap } from "@/ui/Heatmap";
import { SectionHeader } from "@/ui/Section";

export const metadata = { title: "Heatmap demo", robots: { index: false } };

const HeatmapDemoPage = () => {
    return (
        <>
            <SectionHeader title="Heatmap widget (demo)" />
            <p>
                dxFeed heatmap widget wired up against a mock data provider (see{" "}
                <code>src/services/server/dxfeedMock</code>) until real dxFeed credentials are available. Not linked
                from anywhere in the site nav.
            </p>
            <Heatmap />
        </>
    );
};

export default HeatmapDemoPage;
