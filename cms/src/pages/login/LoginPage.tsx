import type { FC } from "react";

import { useLogin } from "@refinedev/core";
import { Button, Card, Form, Input, Typography } from "antd";

import css from "./LoginPage.module.css";

export const LoginPage: FC = () => {
  const { mutate: login, isPending } = useLogin();

  return (
    <div className={css["login-page"]}>
      <Card className={css["login-page__card"]}>
        <div className={css["login-page__heading"]}>
          <span className={css["login-page__accent"]} />
          <Typography.Title level={4} className={css["login-page__title"]}>Tape Network CMS</Typography.Title>
        </div>
        <Form layout="vertical" onFinish={login}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
            <Input placeholder="admin@tape.local" autoComplete="username" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="••••••••" autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={isPending}>Sign in</Button>
        </Form>
      </Card>
    </div>
  );
};
