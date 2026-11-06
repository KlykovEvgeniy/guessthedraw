import React from "react";
import ReactDOM from 'react-dom/client';
import { router, store } from "./app";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
    
ReactDOM.createRoot(document.querySelector('#root') as HTMLDivElement).render(
    <React.StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </React.StrictMode>
)