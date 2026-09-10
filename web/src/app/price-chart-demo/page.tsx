import { PriceChart } from "@/ui/PriceChart";
import { SectionHeader } from "@/ui/Section";

export const metadata = { title: "Price chart demo", robots: { index: false } };

const PriceChartDemoPage = () => {
    return (
        <>
            <SectionHeader title="Price chart (demo)" />
            <p>
                @devexperts/dxcharts-lite candlestick chart for AAPL, fed live from dxFeed&apos;s public developer
                demo endpoint (<code>wss://tools.dxfeed.com/dxlink-dxwebdemo</code>) — rate-limited/truncated public
                data, not linked from anywhere in the site nav.
            </p>
            <PriceChart />
        </>
    );
};

export default PriceChartDemoPage;
