/**
 * General layout of a page
 */

import React from "react";
import { Row, Col } from "antd";

import Header from "./Header";
import MainContent from "./MainContent";
import Footer from "./Footer";

interface P {}
export const Layout: React.FC<P> = props => {
    return (
        <Row>
            <Col>
                <Header></Header>
                <MainContent>{props.children}</MainContent>
                <Footer></Footer>
            </Col>
        </Row>
    );
};
export default Layout;
