import Agenda from "agenda";
import moment from "moment";
import User from "../models/User";
import { sleep } from "./helpers";

const agenda = new Agenda({
  db: {
    address: process.env.MONGODB_URL,
    options: {
      useNewUrlParser: true
    }
  }
});

agenda.on("ready", () => {});

export default agenda;
