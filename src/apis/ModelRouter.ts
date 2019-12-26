import paginatify from "../middlewares/paginatify";
import handleAsyncErrors from "../utils/handleAsyncErrors";
import { parseSortString } from "../utils/helpers";
import HttpError from "../utils/HttpError";
import Model from "../models/Model";

export default router => {
  // Model CURD
  router
    .route("/model")

    // create a model
    .post(
      handleAsyncErrors(async (req, res) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const model = new Model(req.body);
        await model.save();

        res.json(model);
      })
    )

    // get all the models
    .get(
      paginatify,
      handleAsyncErrors(async (req, res) => {
        const { limit, skip } = req.pagination;
        const query = Model.find();
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
    .route("/model/:modelId")

    .all(
      handleAsyncErrors(async (req, res, next) => {
        const model = await Model.findById(req.params.modelId);
        if (!model) {
          throw new HttpError(404, `Model not found: ${req.params.modelId}`);
        }
        req.item = model;
        next();
      })
    )

    // get the model with that id
    .get(
      handleAsyncErrors(async (req, res) => {
        const model = req.item;
        res.json(model);
      })
    )

    .put(
      handleAsyncErrors(async (req, res) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const model = req.item;
        model.set(req.body);
        await model.save();
        res.json(model);
      })
    )

    // delete the model with this id
    .delete(
      handleAsyncErrors(async (req, res) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const model = req.item;
        await model.remove();
        res.end();
      })
    );

  return router;
};
