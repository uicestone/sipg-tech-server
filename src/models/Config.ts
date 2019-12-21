import { prop, getModelForClass, plugin } from "@typegoose/typegoose";
import updateTimes from "./plugins/updateTimes";

@plugin(updateTimes)
export class Config {
  @prop()
  desc?: string;
  @prop()
  value?: string;
  public static async get(key: string, defaults: any) {
    const doc = await configModel.findOne({ key });
    return doc ? doc.value : defaults;
  }
}

const configModel = getModelForClass(Config, {
  schemaOptions: {
    strict: false,
    toJSON: {
      getters: true,
      transform: function(doc, ret, options) {
        delete ret._id;
        delete ret.__v;
      }
    }
  }
});

export default configModel;

export const config: Config = {};
