import { RegisterWithEmailForm } from "./RegitserWithEmailForm/ui/RegisterWithEmailForm";
import type { IRegisterSchema } from "./RegitserWithEmailForm/model/registerSchema";
import { OnlyGuests } from "./OnlyGuests/ui/OnlyGuests";
import { NotGuests } from "./NotGuests/ui/NotGuests";
import { LoginWithEmail } from "./LoginWithEmail/ui/LoginWithEmail";
import { IsSumbit } from "./IsSubmit/ui/IsSubmit";
import {RoomsList} from './RoomsList/ui/RoomsList';
import { PaintBoard } from "./PaintBoard/ui/PaintBoard";


export { RegisterWithEmailForm, RoomsList, OnlyGuests, NotGuests, LoginWithEmail, IsSumbit, PaintBoard };
export type { IRegisterSchema };