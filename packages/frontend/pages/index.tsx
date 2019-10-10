import React from "react";
import { Row, Col } from "antd";

export default () => {
    return (
        <Row>
            <Col>
                <div>Hello World!</div>
                <a href="http://localhost:8000/auth/google">LOGIN</a>
            </Col>
        </Row>
    );
};
