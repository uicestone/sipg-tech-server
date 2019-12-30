import paginatify from "../middlewares/paginatify";
import handleAsyncErrors from "../utils/handleAsyncErrors";
import { parseSortString } from "../utils/helpers";
import HttpError from "../utils/HttpError";
import CareRecord from "../models/CareRecord";

export default router => {
  // CareRecord CURD
  router
    .route("/care-record")

    // create a careRecord
    .post(
      handleAsyncErrors(async (req, res) => {
        const careRecord = new CareRecord(req.body);
        await careRecord.save();

        res.json(careRecord);
      })
    )

    // get all the careRecords
    .get(
      paginatify,
      handleAsyncErrors(async (req, res) => {
        const { limit, skip } = req.pagination;
        const query = CareRecord.find();
        const sort = parseSortString(req.query.order) || {
          createdAt: -1
        };

        if (req.query.machine) {
          query.find({ machine: req.query.machine });
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
    .route("/care-record/:careRecordId")

    .all(
      handleAsyncErrors(async (req, res, next) => {
        const careRecord = await CareRecord.findById(req.params.careRecordId);
        if (!careRecord) {
          throw new HttpError(
            404,
            `Care record not found: ${req.params.careRecordId}`
          );
        }
        req.item = careRecord;
        next();
      })
    )

    // get the careRecord with that id
    .get(
      handleAsyncErrors(async (req, res) => {
        const careRecord = req.item;
        res.json(careRecord);
      })
    )

    .put(
      handleAsyncErrors(async (req, res) => {
        const careRecord = req.item;
        careRecord.set(req.body);
        await careRecord.save();
        res.json(careRecord);
      })
    )

    // delete the careRecord with this id
    .delete(
      handleAsyncErrors(async (req, res) => {
        const careRecord = req.item;
        await careRecord.remove();
        res.end();
      })
    );

  return router;
};
