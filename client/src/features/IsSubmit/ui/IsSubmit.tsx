import type { FC } from "react";
import type { IIsSubmit } from "../model/IsSubmit";
import { useProfileQuery } from "../../../shards";

export const IsSumbit: FC<IIsSubmit> = ({ children }) => {
    const { data } = useProfileQuery();
    const user = data as unknown as { data: {  isSubmitted: boolean } };
    return (
        <>
            {user?.data?.isSubmitted ? children : <h2>Please, submit your email</h2>}
        </>
    );
};
