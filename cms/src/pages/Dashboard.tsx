import { Card, Typography, Space, Tag } from "antd";
import { resourceDefs } from "../fields";

const { Title, Paragraph } = Typography;

export function Dashboard() {
  return (
    <Card>
      <Title level={3}>Tape Network CMS</Title>
      <Paragraph type="secondary">
        Manage every resource below. Each maps to the backend admin API
        (<code>/api/admin/*</code>) with list, create, edit and delete. Articles support
        multi-paragraph bodies; media fields upload to the server.
      </Paragraph>
      <Space wrap>
        {resourceDefs.map((r) => (
          <Tag key={r.name} color="gold">
            {r.label}
          </Tag>
        ))}
      </Space>
    </Card>
  );
}
