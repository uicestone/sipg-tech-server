import { prop, getModelForClass, plugin, pre } from "@typegoose/typegoose";
import updateTimes from "./plugins/updateTimes";

@plugin(updateTimes)
@pre<Machine>("save", function() {
  this.updateDueCareItems();
})
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

  @prop({
    default: [
      { name: "机油、机滤", cycle: 100, cycleUnit: "小时", last: 0 },
      { name: "刹车油", cycle: 500, cycleUnit: "小时", last: 0 }
    ]
  })
  careItems: {
    name: string;
    cycle: number;
    cycleUnit: string;
    last: number;
    cycleLeft: number;
  }[];

  updateDueCareItems() {
    this.careItems = this.careItems.map(item => {
      return {
        ...item,
        cycleLeft: item.cycle - (this.totalHours - (item.last || 0))
      };
    });
  }
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
