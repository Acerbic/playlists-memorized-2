import React from "react";
import { Row, Col } from "antd";

export default () => {
    const u = new URL("http://backend.localhost.com:8000/auth/google");
    u.searchParams.append(
        "destination",
        "http://frontend.localhost.com:3000/login_success"
    );

    return (
        <Row>
            <Col>
                <div>Hello World!</div>
                <a href={u.href}>LOGIN</a>
            </Col>
        </Row>
    );
};
