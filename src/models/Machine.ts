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

  @prop()
  careItems: {
    name: string;
    cycle: number;
    cycleUnit: string;
    last: number;
    cycleLeft: number;
  }[];

  updateDueCareItems() {
    this.careItems = this.careItems.map(item => {
      console.log(item.last);
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
