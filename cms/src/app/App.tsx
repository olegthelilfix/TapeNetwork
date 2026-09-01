import type { FC } from "react";

import { RefineThemes, useNotificationProvider } from "@refinedev/antd";
import { Refine } from "@refinedev/core";
import routerBindings, { DocumentTitleHandler, UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import { App as AntdApp, ConfigProvider } from "antd";
import { BrowserRouter } from "react-router-dom";

import { authProvider, dataProvider, resources, uploadMedia } from "@/app/refine";

import { AppRoutes } from "./router";

import "@refinedev/antd/dist/reset.css";

export const App: FC = () => {
  return (
    <BrowserRouter>
      <ConfigProvider theme={RefineThemes.Blue}>
        <AntdApp>
          <Refine dataProvider={dataProvider} authProvider={authProvider} routerProvider={routerBindings} notificationProvider={useNotificationProvider} resources={resources} options={{ syncWithLocation: true, warnWhenUnsavedChanges: true, title: { text: "Tape Network CMS" } }}>
            <AppRoutes uploadMedia={uploadMedia} />
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </BrowserRouter>
  );
};
