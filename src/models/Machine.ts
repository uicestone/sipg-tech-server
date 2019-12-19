import mongoose, { Schema } from "mongoose";
import updateTimes from "./plugins/updateTimes";

const Machine = new Schema({
  num: String,
  desc: String
});

Machine.plugin(updateTimes);

Machine.set("toJSON", {
  getters: true,
  transform: function(doc, ret, options) {
    delete ret._id;
    delete ret.__v;
  }
});

export interface IMachine extends mongoose.Document {
  num: string;
  desc: string;
}

export default mongoose.model<IMachine>("Machine", Machine);
