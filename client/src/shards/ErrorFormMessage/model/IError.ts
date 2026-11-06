import { type FieldPath, type FormState, type FieldValues } from "react-hook-form";

export interface IError<T extends FieldValues> {
    formState: FormState<T>,
    name: FieldPath<T>; 
}