import { useLogin } from "@refinedev/core";
import { Card, Form, Input, Button, Typography } from "antd";

export function Login() {
  const { mutate: login, isLoading } = useLogin();

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f0f2f5" }}>
      <Card style={{ width: 360 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ width: 6, height: 22, background: "#F0B429", display: "inline-block" }} />
          <Typography.Title level={4} style={{ margin: 0 }}>Tape Network CMS</Typography.Title>
        </div>
        <Form layout="vertical" onFinish={(values) => login(values)}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
            <Input placeholder="admin@tape.local" autoComplete="username" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="••••••••" autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={isLoading}>
            Sign in
          </Button>
        </Form>
      </Card>
    </div>
  );
}
