import cors from "cors";
import methodOverride from "method-override";
import authenticate from "../middlewares/authenticate";
import castEmbedded from "../middlewares/castEmbedded";
import AuthRouter from "./AuthRouter";
import CareRecordRouter from "./CareRecordRouter";
import ConfigRouter from "./ConfigRouter";
import StatsRouter from "./StatsRouter";
import UserRouter from "./UserRouter";
import MachineRouter from "./MachineRouter";
import ModelRouter from "./ModelRouter";

export default (app, router) => {
  // register routes
  [
    AuthRouter,
    CareRecordRouter,
    ConfigRouter,
    MachineRouter,
    ModelRouter,
    StatsRouter,
    UserRouter
  ].forEach(R => {
    router = R(router);
  });

  router.get("/", (req, res) => {
    res.send("Welcome!");
  });

  app.use(
    "/api",
    cors({
      exposedHeaders: [
        "content-range",
        "accept-range",
        "items-total",
        "items-start",
        "items-end",
        "total-amount",
        "total-credit"
      ]
    }),
    methodOverride(),
    authenticate,
    castEmbedded,
    router
  );
};
