import moment from "moment";
import paginatify from "../middlewares/paginatify";
import handleAsyncErrors from "../utils/handleAsyncErrors";
import { parseSortString } from "../utils/helpers";
import HttpError from "../utils/HttpError";
import Machine from "../models/Machine";
import CareRecord from "../models/CareRecord";

// setTimeout(async () => {
//   for (let i = 1063; i <= 1066; i++) {
//     const machine = new Machine({
//       num: i.toString(),
//       type: "牵引车",
//       firstDay: "2020-01-01",
//       totalHours: 0,
//       brand: "重汽",
//       // @ts-ignore
//       model: "重汽豪沃牵引车（法士特变速箱）"
//     });
//     await machine.save();
//     console.log(`machine ${i} saved`);
//   }
// }, 1e3);

export default router => {
  // Machine CURD
  router
    .route("/machine")

    // create a machine
    .post(
      handleAsyncErrors(async (req, res) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const machine = new Machine(req.body);
        await machine.save();

        res.json(machine);
      })
    )

    // get all the machines
    .get(
      paginatify,
      handleAsyncErrors(async (req, res) => {
        const { limit, skip } = req.pagination;
        const query = Machine.find();
        const sort = parseSortString(req.query.order) || {
          createdAt: -1
        };

        if (req.query.num) {
          query.find({ num: new RegExp("^" + req.query.num) });
        }

        if (req.query.model) {
          query.find({ model: req.query.model });
        }

        if (req.query.careItem) {
          // query machines that has alerted / expired care items for the search slug: {category}-{name}
          const [category, name] = req.query.careItem.split("-");

          query.find({
            careItems: {
              $elemMatch: {
                category,
                name,
                alertLevel: { $gt: 0 }
              }
            }
          });
        }

        if (req.query.alertType === "alert") {
          query.find({
            "careItems.alertLevel": 1
          });
        }

        if (req.query.alertType === "expired") {
          query.find({
            "careItems.alertLevel": 2
          });
        }

        let total = await query.countDocuments();
        const page = await query
          .find()
          .sort(sort)
          .limit(limit)
          .skip(skip)
          .exec();

        if (skip + page.length > total) {
          total = skip + page.length;
        }

        res.paginatify(limit, skip, total).json(page);
      })
    );

  router
    .route("/machine/:machineId")

    .all(
      handleAsyncErrors(async (req, res, next) => {
        const machine = await Machine.findById(req.params.machineId);
        if (!machine) {
          throw new HttpError(
            404,
            `Machine not found: ${req.params.machineId}`
          );
        }
        req.item = machine;
        next();
      })
    )

    // get the machine with that id
    .get(
      handleAsyncErrors(async (req, res) => {
        const machine = req.item;
        res.json(machine);
      })
    )

    .put(
      handleAsyncErrors(async (req, res) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const machine = req.item;
        if (req.body.careItems) {
          req.body.careItems.forEach(async itemUpdate => {
            const itemOrigin = machine.careItems.find(
              i => i.name === itemUpdate.name
            );
            if (itemOrigin.last !== itemUpdate.last) {
              if (itemUpdate.last < itemOrigin.last) {
                throw new HttpError(400, "时间/计数不可小于上次保养");
              }
              // create care record
              const record = new CareRecord({
                careItem: { ...itemOrigin, ...itemUpdate },
                machine,
                date: moment().format("YYYY-MM-DD"),
                operator: req.user
              });

              await record.save();
            }
          });
        }
        machine.set(req.body);
        await machine.save();
        res.json(machine);
      })
    )

    // delete the machine with this id
    .delete(
      handleAsyncErrors(async (req, res) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const machine = req.item;
        await machine.remove();
        res.end();
      })
    );

  return router;
};
