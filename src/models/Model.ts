import { prop, getModelForClass, plugin, pre } from "@typegoose/typegoose";
import updateTimes from "./plugins/updateTimes";

@plugin(updateTimes)
class Model {
  @prop({ unique: true })
  name: string;

  @prop()
  careItems: CareItem[];
}

export class CareItem {
  @prop()
  category: string;

  @prop()
  name: string;

  @prop()
  cycle: number;

  @prop()
  cycleAlert: number;

  @prop()
  cycleType: "runHour" | "month" | "onDemand";
}

export default getModelForClass(Model, {
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
