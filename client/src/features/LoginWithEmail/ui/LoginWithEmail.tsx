import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ILoginSchema, loginSchema } from '../model/loginSchema';
import { ErrorFormMessage, RegisterWithGoogle } from '../../../shards';
import styles from '../styles/login.module.css';
import { useAppDispatch } from '../../../app';
import { writeToken } from '../../../pages';
import { useLoginMutation } from '../../../shards';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface IRtkQueryError {
    data?: {
        message?: string;
    };
    status?: number;
}

export const LoginWithEmail = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [log] = useLoginMutation();
    const [errors, setErrors] = useState<string | null>(null);
    const { register, handleSubmit, reset, formState } = useForm<ILoginSchema>({
        defaultValues: {
            email: '',
            password: '',
        },
        resolver: zodResolver(loginSchema),
        mode: 'onSubmit',
    });
    const onSubmit: SubmitHandler<ILoginSchema> = async (data) => {
        try {
            const result = await log(data).unwrap();
            dispatch(writeToken(result.data.tokens.access));
            navigate('/');
            window.location.reload();
        } catch (error) {
            const rtkError = error as IRtkQueryError;
            setErrors(rtkError.data?.message || 'Something went wrong. Please try again.');
            reset();
        }
    }
    return (
        <>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <input type="text" {...register('email')} placeholder='email' />
                <ErrorFormMessage formState={formState} name='email' />
                <input type="text" {...register('password')} placeholder='password' />
                <ErrorFormMessage formState={formState} name='password' />
                <button type="submit">Submit</button>
                {errors && <p>{errors}</p>}
            </form>
            <RegisterWithGoogle />
        </>
    )
}