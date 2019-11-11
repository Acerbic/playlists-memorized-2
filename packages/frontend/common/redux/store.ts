import { createStore } from "redux";
import rootReducer from "./reducers";

export type AppState = ReturnType<typeof rootReducer>;
export default createStore(rootReducer);
