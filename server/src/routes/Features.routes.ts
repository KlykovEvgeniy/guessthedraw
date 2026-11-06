import { Router } from "express";
import { feateresController } from "../controllers";
import { isAuth } from "../middlewares";

const router = Router();

router.get('/api/v1.0.0/dashboard', isAuth, feateresController.dashboard);
router.get('/api/v1.0.0/rooms', feateresController.getAllPublicRooms);
router.get('/api/v1.0.0/chat/:id', feateresController.getMessagesAfterReload);

export default router;