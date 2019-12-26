import { prop, getModelForClass, plugin, pre } from "@typegoose/typegoose";
import moment from "moment";
import updateTimes from "./plugins/updateTimes";
import Model, { CareItem } from "./Model";

@plugin(updateTimes)
@pre<Machine>("save", async function() {
  if (!this.careItems.length && this.model) {
    await this.initCareItems();
  }
})
class Machine {
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

  @prop({
    get(careItems: MachineCareItem[]) {
      return careItems.map(item => {
        let cycleLeft: number;
        switch (item.cycleType) {
          case "month":
            cycleLeft = +(
              item.cycle +
              moment(item.last || this.firstDay).diff(
                new Date(),
                "months",
                true
              )
            ).toFixed(1);
            break;
          case "onDemand":
            cycleLeft = null;
            break;
          case "runHour":
            cycleLeft = item.cycle - (this.totalHours - (item.last || 0));
            break;
        }
        return {
          ...item,
          cycleLeft
        };
      });
    },
    set: val => {
      return val;
    }
  })
  careItems: MachineCareItem[];

  async initCareItems() {
    const model = await Model.findOne({ name: this.model });
    if (!model) {
      throw new Error("invalid_model");
    }
    this.careItems = model.careItems.map(i => ({
      ...i,
      last: 0,
      cycleLeft: null
    }));
  }
}

class MachineCareItem extends CareItem {
  last: number;
  cycleLeft?: number;
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
