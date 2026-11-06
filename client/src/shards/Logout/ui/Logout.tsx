import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../app";
import { logout } from "../../../pages";
import { useLogoutMutation } from "../../api/baseApi"; 

export const Logout = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [triggerLogout, { isLoading }] = useLogoutMutation();

    const onClick = async () => {
        try {
            await triggerLogout().unwrap();
            dispatch(logout());
            navigate('/');
            window.location.reload();
        } catch (error) {
            console.error("Ошибка при выходе из системы:", error);
        }
    };

    return (
        <button 
            type="button" 
            onClick={onClick} 
            disabled={isLoading} 
        >
            {isLoading ? "Выход..." : "Logout"}
        </button>
    );
};
