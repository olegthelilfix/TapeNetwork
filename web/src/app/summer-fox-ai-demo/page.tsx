import { SectionHeader } from "@/ui/Section";
import { SummerFoxAi } from "@/ui/SummerFoxAi";

export const metadata = { title: "Summer Fox AI demo", robots: { index: false } };

const SummerFoxAiDemoPage = () => {
    return (
        <>
            <SectionHeader title="Summer Fox AI (demo)" />
            <p>
                @dx-display/widgets-summer-fox-ai — an AI research widget that generates a
                structured, multi-section report (instrument overview, technical analysis, news
                impact, market sentiment, conclusion) for a chosen symbol. Wired against a mock
                report/IPF/schedule/fundamentals provider (see <code>src/services/server/dxfeedMock</code>{" "}
                and <code>src/app/api/dxfeed/report</code>), with the live quote feed pointed at
                dxFeed&apos;s public developer demo. Not linked from anywhere in the site nav.
            </p>
            <SummerFoxAi symbol="AAPL" height="640px" />
        </>
    );
};

export default SummerFoxAiDemoPage;
