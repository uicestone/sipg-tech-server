import Agenda from "agenda";
import moment from "moment";
import User from "../models/User";
import { sleep } from "./helpers";
import Machine from "../models/Machine";

const agenda = new Agenda({
  db: {
    address: process.env.MONGODB_URL,
    options: {
      useNewUrlParser: true
    }
  }
});

agenda.define("update machine care item cycle left", async (job, done) => {
  const machines = await Machine.find();
  for (const machine of machines) {
    machine.recalculateCareItemsCycleLeft();
    await machine.save();
  }
  done();
});

agenda.on("ready", () => {
  agenda.every("0 0 * * *", "update machine care item cycle left");
});

export default agenda;
