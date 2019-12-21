import { DocumentType } from "@typegoose/typegoose";
import paginatify from "../middlewares/paginatify";
import handleAsyncErrors from "../utils/handleAsyncErrors";
import { parseSortString } from "../utils/helpers";
import HttpError from "../utils/HttpError";
import userModel, { User } from "../models/User";
import { hashPwd } from "../utils/helpers";

const { DEBUG } = process.env;

export default router => {
  // User CURD
  router
    .route("/user")

    // create a user
    .post(
      handleAsyncErrors(async (req, res) => {
        if (req.user.role !== "admin") {
          ["role", "openid", "codes", "cardType", "credit"].forEach(f => {
            delete req.body[f];
          });
        }
        if (req.body.password) {
          req.body.password = await hashPwd(req.body.password);
        }
        if (req.body.mobile) {
          const userMobileExists = await userModel.findOne({
            mobile: req.body.mobile
          });
          if (userMobileExists) {
            throw new HttpError(409, `手机号${req.body.mobile}已被使用.`);
          }
        }
        const user = new userModel(req.body);
        await user.save();

        res.json(user);
      })
    )

    // get all the users
    .get(
      paginatify,
      handleAsyncErrors(async (req, res) => {
        if (!["admin", "manager"].includes(req.user.role)) {
          // TODO should restrict manager user list to own store booking
          throw new HttpError(403);
        }
        const { limit, skip } = req.pagination;
        const query = userModel.find();
        const sort = parseSortString(req.query.order) || {
          createdAt: -1
        };

        const $and = []; // combine all $or conditions into one $and

        if (req.query.keyword) {
          $and.push({
            $or: [
              { name: new RegExp(req.query.keyword, "i") },
              { mobile: new RegExp(req.query.keyword) },
              { cardNo: new RegExp(req.query.keyword) }
            ]
          });
        }

        if (req.query.role) {
          query.find({ role: req.query.role });
        }

        if ($and.length) {
          query.find({ $and });
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
    .route("/user/:userId")

    .all(
      handleAsyncErrors(async (req, res, next) => {
        const user = await userModel.findById(req.params.userId);
        if (
          !["admin", "manager"].includes(req.user.role) &&
          req.user.id !== req.params.userId
        ) {
          throw new HttpError(403);
        }
        if (!user) {
          throw new HttpError(404, `userModel not found: ${req.params.userId}`);
        }
        req.item = user;
        next();
      })
    )

    // get the user with that id
    .get(
      handleAsyncErrors(async (req, res) => {
        const user = req.item;
        res.json(user);
      })
    )

    .put(
      handleAsyncErrors(async (req, res) => {
        if (req.user.role !== "admin") {
          ["role"].forEach(f => {
            delete req.body[f];
          });
        }
        const user = req.item as DocumentType<User>;
        if (req.body.password) {
          console.log(`[USR] userModel ${user.id} password reset.`);
          req.body.password = await hashPwd(req.body.password);
        }
        if (req.body.mobile) {
          const userMobileExists = await userModel.findOne({
            mobile: req.body.mobile,
            _id: { $ne: user.id }
          });
          if (userMobileExists) {
            throw new HttpError(409, `手机号${req.body.mobile}已被使用`);
          }
        }

        user.set(req.body);

        await user.save();
        res.json(user);
      })
    )

    // delete the user with this id
    .delete(
      handleAsyncErrors(async (req, res) => {
        if (req.user.role !== "admin") {
          throw new HttpError(403);
        }
        const user = req.item;
        await user.remove();
        res.end();
      })
    );

  return router;
};
