import { Router, type IRouter } from "express";
import authRouter from "./auth";
import healthRouter from "./health";
import ordersRouter from "./orders";
import venueRouter from "./venue";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(venueRouter);
router.use(ordersRouter);

export default router;
