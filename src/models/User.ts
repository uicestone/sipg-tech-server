import { prop, getModelForClass, plugin } from "@typegoose/typegoose";
import updateTimes from "./plugins/updateTimes";

@plugin(updateTimes)
export class User {
  @prop()
  role: string;

  @prop({ unique: true, sparse: true })
  login: string;

  @prop({ select: false })
  password: string;

  @prop()
  name: string;

  @prop({
    get: v => v,
    set: v => {
      const genderIndex = ["未知", "男", "女"];
      return genderIndex[v] || v;
    }
  })
  gender: string;

  @prop({
    unique: true,
    sparse: true,
    validate: {
      validator: v => v.length === 11,
      // @ts-ignore
      message: `手机号必须是11位数`
    }
  })
  mobile: string;

  @prop()
  workNo: string;

  @prop()
  avatarUrl: string;

  @prop()
  region: string;

  @prop()
  country: string;

  @prop()
  isForeigner: boolean;

  @prop()
  birthday: string;

  @prop()
  constellation: string;
}

export default getModelForClass(User, {
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
