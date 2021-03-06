/**
 * Page header - navigation, login, etc..
 */

import React from "react";
import { Row } from "antd";
import { connect, MapStateToProps } from "react-redux";
import { AppState } from "../common/redux/store";

interface ReduxStateProps {
    user: AppState["user"];
}
const mapStateToProps: MapStateToProps<ReduxStateProps, {}, AppState> = ({
    user,
}) => {
    return {
        user,
    };
};

type P = ReduxStateProps;

const Header: React.FC<P> = props => {
    return (
        <Row>
            Header
            {props.user.checking
                ? "Validating session..."
                : props.user.info
                ? "Logged in"
                : "Logged out"}
        </Row>
    );
};
export default connect(mapStateToProps)(Header);
