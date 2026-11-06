import { type FieldValues } from "react-hook-form";
import { type IError } from "../model/IError";
import '../style/style.css';

export const ErrorFormMessage = <T extends FieldValues>({ formState, name }: IError<T>) => {
    const error = formState.errors[name as string]; 
    
    return (
        <p className="error-message" style={{ visibility: error ? 'visible' : 'hidden' }}>
            {error?.message as string}
        </p>
    );
};
