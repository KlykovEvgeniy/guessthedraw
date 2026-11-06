import { Home } from "./Home/ui/Home";
import { Register } from "./Register/ui/Register";
import { authSlice, writeToken, logout, writeUser } from "./Register/model/authSlice";
import { Login } from "./Login/ui/Login";
import { Dashboard } from "./Dashboard/ui/Dashboard";
import { Rooms } from "./Rooms/ui/Rooms";
import { Game } from "./Game/ui/Game";

export { Home, Login, Register, authSlice, writeToken, logout, writeUser, Dashboard, Rooms, Game };