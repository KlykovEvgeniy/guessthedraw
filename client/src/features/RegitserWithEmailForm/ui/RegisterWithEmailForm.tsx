import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type IRegisterSchema } from '../model/registerSchema';
import { ErrorFormMessage, RegisterWithGoogle } from '../../../shards';
import styles from '../styles/register.module.css';
import { useAppDispatch } from '../../../app';
import { writeToken } from '../../../pages';
import { useRegisterMutation } from '../../../shards';
import { useNavigate } from 'react-router-dom';

export const RegisterWithEmailForm = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [reg] = useRegisterMutation();
    const { register, handleSubmit, reset, formState } = useForm<IRegisterSchema>({
        defaultValues: {
            email: '',
            password: '',
            username: '',
        },
        resolver: zodResolver(registerSchema),
        mode: 'onSubmit',
    });
    const onSubmit: SubmitHandler<IRegisterSchema> = async (data) => {
        try {
            const result = await reg(data).unwrap();
            dispatch(writeToken(result.data.tokens.access));
            navigate('/');
            window.location.reload();
        } catch (error) {
            console.log(error);
            reset();
        }
    }
    return (
        <>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <input type="text" {...register('email')} placeholder='email' />
                <ErrorFormMessage formState={formState} name='email' />
                <input type="text" {...register('username')} placeholder='username' />
                <ErrorFormMessage formState={formState} name='username' />
                <input type="text" {...register('password')} placeholder='password' />
                <ErrorFormMessage formState={formState} name='password' />
                <button type="submit">Submit</button>
            </form>
            <RegisterWithGoogle />
        </>
    )
}