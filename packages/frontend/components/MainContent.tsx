/**
 * Central block with contents of a page.
 */

import React from "react";

interface P {}
export const MainContent: React.FC<P> = props => {
    return <div>{props.children}</div>;
};

export default MainContent;
