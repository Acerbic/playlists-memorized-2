import { LOGIN, LOGOUT } from "./actionTypes";
import { Action, ActionCreator } from "redux";

export interface LoginAction extends Action<typeof LOGIN> {
    payload: {
        user: unknown; // TODO:
    };
}

export interface LogoutAction extends Action<typeof LOGOUT> {
    payload: {};
}

export const user_login: ActionCreator<LoginAction> = (user: any) => ({
    type: LOGIN,
    payload: {
        user,
    },
});

export const user_logout: ActionCreator<LogoutAction> = () => ({
    type: LOGOUT,
    payload: {},
});
