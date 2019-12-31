import { prop, getModelForClass, plugin, pre } from "@typegoose/typegoose";
import moment from "moment";
import updateTimes from "./plugins/updateTimes";
import Model, { CareItem } from "./Model";

@plugin(updateTimes)
@pre<Machine>("save", async function() {
  if (!this.careItems.length && this.model) {
    await this.initCareItems();
  }
  if (
    this.isNew ||
    this.isModified("totalHours") ||
    this.isModified("careItems")
  ) {
    this.recalculateCareItemsCycleLeft();
  }
})
export class Machine {
  @prop({ required: true, unique: true })
  num!: string;

  @prop()
  desc: string;

  @prop()
  type: string;

  @prop({ required: true })
  firstDay!: string;

  @prop({ required: true })
  totalHours!: number;

  @prop()
  brand: string;

  @prop()
  model: string;

  @prop()
  careItems: MachineCareItem[];

  async initCareItems() {
    const model = await Model.findOne({ name: this.model });
    if (!model) {
      throw new Error("invalid_model");
    }
    this.careItems = model.careItems.map(i => ({
      ...i,
      last: 0,
      cycleLeft: null,
      cycleAlertLeft: null,
      alertLevel: 0
    }));
  }

  recalculateCareItemsCycleLeft() {
    this.careItems = this.careItems.map(item => {
      let cycleLeft: number;
      let cycleAlertLeft: number;
      let alertLevel = 0;
      switch (item.cycleType) {
        case "month":
          cycleLeft =
            item.cycle +
            moment(item.last || this.firstDay).diff(new Date(), "months", true);
          cycleAlertLeft =
            item.cycle -
            item.cycleAlert +
            moment(item.last || this.firstDay).diff(new Date(), "months", true);
          break;
        case "onDemand":
          cycleLeft = null;
          cycleAlertLeft = null;
          break;
        case "runHour":
          cycleLeft = item.cycle - (this.totalHours - (item.last || 0));
          cycleAlertLeft =
            item.cycle - item.cycleAlert - (this.totalHours - (item.last || 0));
          break;
      }
      if (item.cycle && cycleLeft <= 0) alertLevel = 2;
      else if (item.cycle && cycleAlertLeft <= 0) alertLevel = 1;
      return {
        ...item,
        cycleLeft,
        cycleAlertLeft,
        alertLevel
      };
    });
  }
}

class MachineCareItem extends CareItem {
  @prop()
  last: number;

  @prop()
  cycleLeft: number;

  @prop()
  cycleAlertLeft: number;

  @prop()
  alertLevel: number;
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
