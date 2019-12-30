import { prop, getModelForClass, plugin, Ref } from "@typegoose/typegoose";
import updateTimes from "./plugins/updateTimes";
import { CareItem } from "./Model";
import { Machine } from "./Machine";
import { User } from "./User";
import autoPopulate from "./plugins/autoPopulate";

@plugin(updateTimes)
@plugin(autoPopulate, [
  { path: "machine", select: "num" },
  { path: "operator", select: "name" }
])
class CareRecord {
  @prop({ _id: false })
  careItem: CareItem;

  @prop({ ref: Machine })
  machine: Ref<Machine>;

  @prop()
  date: string;

  @prop()
  startedAt: Date;

  @prop()
  finishedAt: Date;

  @prop({ ref: User })
  operator: Ref<User>;

  @prop()
  remark: string;
}

export default getModelForClass(CareRecord, {
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
