import { lazy, Suspense, type FC } from "react";
import { Authenticated } from "@refinedev/core";
import { ErrorComponent, ThemedLayoutV2 } from "@refinedev/antd";
import { CatchAllNavigate, NavigateToResource } from "@refinedev/react-router-v6";
import { Outlet, Route, Routes } from "react-router-dom";
import { resourceDefinitions } from "@/features/resource-management";
import type { AppRoutesProps } from "./AppRoutes.types";

const DashboardPage = lazy(async () => {
    const module = await import("@/pages/dashboard");
    return { default: module.DashboardPage };
});

const LoginPage = lazy(async () => {
    const module = await import("@/pages/login");
    return { default: module.LoginPage };
});

const ResourceFormFeature = lazy(async () => {
    const module = await import("@/features/resource-form");
    return { default: module.ResourceFormFeature };
});

const ResourceListFeature = lazy(async () => {
    const module = await import("@/features/resource-list");
    return { default: module.ResourceListFeature };
});

export const AppRoutes: FC<AppRoutesProps> = ({ uploadMedia }) => {
    return (
        <Suspense fallback={null}>
            <Routes>
            <Route element={<Authenticated key="protected" fallback={<CatchAllNavigate to="/login" />}><ThemedLayoutV2><Outlet /></ThemedLayoutV2></Authenticated>}>
                <Route index element={<DashboardPage />} />
                {resourceDefinitions.map((definition) => (
                    <Route key={definition.name}>
                        <Route path={`/${definition.name}`} element={<ResourceListFeature definition={definition} />} />
                        <Route path={`/${definition.name}/create`} element={<ResourceFormFeature definition={definition} action="create" uploadMedia={uploadMedia} />} />
                        <Route path={`/${definition.name}/edit/:id`} element={<ResourceFormFeature definition={definition} action="edit" uploadMedia={uploadMedia} />} />
                    </Route>
                ))}
                <Route path="*" element={<ErrorComponent />} />
            </Route>
            <Route element={<Authenticated key="auth-pages" fallback={<Outlet />}><NavigateToResource resource="shows" /></Authenticated>}>
                <Route path="/login" element={<LoginPage />} />
            </Route>
            </Routes>
        </Suspense>
    );
};
