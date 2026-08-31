import type { FC } from "react";
import { Card, Space, Tag, Typography } from "antd";
import { resourceDefinitions } from "@/features/resource-management";

const { Title, Paragraph } = Typography;

export const DashboardPage: FC = () => {
    return (
        <Card>
            <Title level={3}>Tape Network CMS</Title>
            <Paragraph type="secondary">
                Manage every resource below. Each maps to the backend admin API
                (<code>/api/admin/*</code>) with list, create, edit and delete. Articles support
                multi-paragraph bodies; media fields upload to the server.
            </Paragraph>
            <Space wrap>
                {resourceDefinitions.map((definition) => (
                    <Tag key={definition.name} color="gold">{definition.label}</Tag>
                ))}
            </Space>
        </Card>
    );
};
