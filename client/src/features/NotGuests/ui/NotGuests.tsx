import { useProfileQuery } from "../../../shards";
import { NotFound } from "../../../app/layout/errors/NotFound";
import type { FC } from "react";
import type { INotGuests } from "../model/NotGuests";

export const NotGuests:FC<INotGuests> = ({children}) => {
    const { data, isError, isLoading } = useProfileQuery();
    if (isLoading) {
        return null;
    }
    if (isError && !data) {
        return <NotFound />;
    }
    return <>{children}</>;
};
