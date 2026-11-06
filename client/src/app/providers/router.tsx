import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { Layout } from "../layout/Layout";
import { Error } from "../layout/errors/ErrorLayout";
import { NotFound } from "../layout/errors/NotFound";
import { Home, Register, Login, Dashboard, Rooms, Game } from "../../pages";
import { IsSumbit, NotGuests, OnlyGuests } from "../../features";

export const router = createBrowserRouter(createRoutesFromElements(
    <>
        <Route path="/" element={<Layout />} errorElement={<Error />}>
            <Route path="/rooms/game/:roomId" element={
                <NotGuests>
                    <IsSumbit>
                        <Game />
                    </IsSumbit>
                </NotGuests>
            } />
            <Route index element={<Home />} />
            <Route path="/register" element={
                <OnlyGuests>
                    <Register />
                </OnlyGuests>
            } />
            <Route path="/login" element={
                <OnlyGuests>
                    <Login />
                </OnlyGuests>
            } />
            <Route path="/rooms" element={
                <NotGuests>
                    <IsSumbit>
                        <Rooms />
                    </IsSumbit>
                </NotGuests>
            } />
            <Route path="/dashboard" element={
                <NotGuests>
                    <IsSumbit>
                        <Dashboard />
                    </IsSumbit>
                </NotGuests>
            } />
        </Route>
        <Route path="*" element={<NotFound />} />
    </>
))