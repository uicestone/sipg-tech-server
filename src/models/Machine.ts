import { prop, getModelForClass, plugin } from "@typegoose/typegoose";
import updateTimes from "./plugins/updateTimes";

@plugin(updateTimes)
class Machine {
  @prop()
  num: string;

  @prop()
  desc: string;

  @prop()
  type: string;

  @prop()
  totalHours: number;

  @prop()
  brand: string;

  @prop()
  model: string;
}

export default getModelForClass(Machine, {
  schemaOptions: {
    toJSON: {
      getters: true,
      transform: function(doc, ret, options) {
        delete ret._id;
        delete ret.__v;
      }
    }
  }
});
