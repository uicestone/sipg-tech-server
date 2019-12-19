import handleAsyncErrors from "../utils/handleAsyncErrors";
import moment from "moment";
import HttpError from "../utils/HttpError";
import getStats from "../utils/getStats";
import XlsxPopulate from "xlsx-populate";

moment.locale("zh-cn");

export default router => {
  // Store CURD
  router.route("/stats/:date?").get(
    handleAsyncErrors(async (req, res) => {
      const dateInput = req.params.date;
      const stats = await getStats(dateInput);
      res.json(stats);
    })
  );

  router.route("/daily-report/:date?").get(
    handleAsyncErrors(async (req, res) => {
      throw new HttpError(501, "日报表下载功能尚未实现");
      const dateInput = req.params.date;
      const workbook = await XlsxPopulate.fromFileAsync(
        "./reports/templates/daily.xlsx"
      );
      const date = moment(dateInput).format("YYYY-MM-DD");
      const startOfMonth = moment(date)
        .startOf("month")
        .toDate();
      const [year, month, day, dayOfWeek] = moment(date)
        .format("YYYY MM DD dd")
        .split(" ");
      const stats = await getStats(date);
      const data = {};
      Object.keys(data).forEach(key => {
        let replace = data[key];
        if (typeof replace === "number") {
          replace = +replace.toFixed(2);
        }
        if (replace === undefined || replace === null) {
          replace = "";
        }
        workbook.find(`{{${key}}}`, replace);
      });

      const filename = `日报 ${date}.xlsx`;
      const path = `./reports/${filename}`;

      await workbook.toFileAsync(path);

      res.download(path, filename);
    })
  );

  return router;
};
