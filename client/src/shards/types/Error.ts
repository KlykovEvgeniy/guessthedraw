export interface IError<T extends object> {
    success: false,
    data: T,
};