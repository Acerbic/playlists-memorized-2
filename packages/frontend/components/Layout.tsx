/**
 * General layout of a page
 */

import React from "react";
import { Layout as AntdLayout } from "antd";

import Header from "./Header";
import MainContent from "./MainContent";
import Footer from "./Footer";

interface P {}
export const Layout: React.FC<P> = props => {
    return (
        <AntdLayout style={{ height: "100vh" }}>
            <AntdLayout.Header style={{ color: "white" }}>
                <Header />
            </AntdLayout.Header>
            <AntdLayout.Content>
                <MainContent>{props.children}</MainContent>
            </AntdLayout.Content>
            <AntdLayout.Footer>
                <Footer />
            </AntdLayout.Footer>
        </AntdLayout>
    );
};
export default Layout;
