import React from "react";

export default () => {
    const u = new URL("http://backend.localhost.com:8000/auth/google");
    u.searchParams.append(
        "destination",
        "http://frontend.localhost.com:3000/login_success"
    );

    return (
        <>
            <div>Hello World!</div>
            <a href={u.href}>LOGIN</a>
        </>
    );
};
