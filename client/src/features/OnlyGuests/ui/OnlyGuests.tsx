import { useProfileQuery } from "../../../shards";
import { NotFound } from "../../../app/layout/errors/NotFound";
import type { FC } from "react";
import type { IOnlyGuests } from "../model/OnlyGuests";

export const OnlyGuests:FC<IOnlyGuests> = ({children}) => {
    const { data, isSuccess, isLoading } = useProfileQuery();
    if (isLoading) {
        return null;
    }
    if (isSuccess && data) {
        return <NotFound />;
    }
    return <>{children}</>;
};
