import paginatify from "../middlewares/paginatify";
import handleAsyncErrors from "../utils/handleAsyncErrors";
import { parseSortString } from "../utils/helpers";
import HttpError from "../utils/HttpError";
import Machine from "../models/Machine";

export default router => {
  // Machine CURD
  router
    .route("/machine")

    // get all the machines
    .get(
      paginatify,
      handleAsyncErrors(async (req, res) => {
        const { limit, skip } = req.pagination;
        const query = Machine.find();
        const sort = parseSortString(req.query.order) || {
          createdAt: -1
        };

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
