/**
 * Redux reducer for store fragment `user`
 * - value is null if currently user isn't logged in.
 * - value is a data structure if user currently is logged in.
 */
import { Reducer } from "redux";
import { LOGIN, LOGOUT } from "../actionTypes";

interface UserLoginState {
    /**
     * Set to true on initial page stored session validation
     */
    checking: boolean;
    /**
     * if checking === false, then this defines a current user (null for logged out)
     */
    info: null | unknown; // TODO:
}

const initialState: UserLoginState = {
    checking: true,
    info: null,
};

const userReducer: Reducer<UserLoginState> = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN: {
            return {
                checking: false,
                info: action.payload.user,
            };
        }
        case LOGOUT: {
            return {
                checking: false,
                info: null,
            };
        }
        default: {
            return state;
        }
    }
};

export default userReducer;
