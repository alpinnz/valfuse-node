import express from "express";
import type { Response } from "express";
import type { ExpressLocalizationLocals } from "@valfuse-node/core/express";

export const healthRouter = express.Router();

healthRouter.get("/health", (_request, response: Response<unknown, ExpressLocalizationLocals>) => {
  const { localization } = response.locals;

  response.json({
    status: "ok",
    locale: localization.locale,
    message: localization.translate("common.ready"),
  });
});
