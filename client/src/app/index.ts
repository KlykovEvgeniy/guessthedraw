import { router } from './providers/router';
import { useAppDispatch, useAppSelector, store } from "./store/store";
import { socket } from "./providers/io";

import type { RootState, AppDispatch } from "./store/store";

export type { RootState, AppDispatch };
export { router, useAppDispatch, useAppSelector, store, socket };
