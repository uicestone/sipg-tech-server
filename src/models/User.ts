import mongoose, { Schema } from "mongoose";
import updateTimes from "./plugins/updateTimes";
import autoPopulate from "./plugins/autoPopulate";

const User = new Schema({
  role: { type: String, default: "customer" },
  login: { type: String, index: { unique: true, sparse: true } },
  password: { type: String, select: false },
  name: String,
  gender: {
    type: String,
    set: v => {
      const genderIndex = ["未知", "男", "女"];
      return genderIndex[v] || v;
    }
  },
  mobile: {
    type: String,
    index: { unique: true, sparse: true },
    validate: {
      validator: function(v) {
        return v.length === 11 || v.match(/^\+/);
      },
      // @ts-ignore
      message: props =>
        `手机号必须是11位数或“+”开头的国际号码，输入的是${JSON.stringify(
          props.value
        )}`
    }
  },
  avatarUrl: String,
  region: String,
  country: String,
  isForeigner: Boolean,
  birthday: String,
  constellation: String
});

// User.virtual("avatarUrl").get(function(req) {
//   if (!this.avatarUri) return null;
//   return (process.env.CDN_URL || req.baseUrl )+ this.avatarUri;
// });

User.plugin(updateTimes);

User.set("toJSON", {
  getters: true,
  transform: function(doc, ret, options) {
    delete ret._id;
    delete ret.__v;
  }
});

export interface IUser extends mongoose.Document {
  role: string;
  login?: string;
  password?: string;
  name?: string;
  gender?: string;
  mobile?: string;
  avatarUrl?: string;
  region?: string;
  country?: string;
  isForeigner?: boolean;
  birthday?: string;
  constellation?: string;
}

export default mongoose.model<IUser>("User", User);
