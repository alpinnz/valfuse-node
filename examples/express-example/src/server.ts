import express from "express";
import { createLocalizationMiddleware } from "@valfuse-node/express";
import { assets } from "./assets/assets";
import localizationManifest from "./assets/localizations/localization";
import { healthRouter, usersRouter } from "./routes";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use("/assets", express.static("public/assets"));
app.use(createLocalizationMiddleware(localizationManifest));
app.use(healthRouter);
app.use(usersRouter);

app.get("/", (_request, response) => {
  response.json({
    name: "Valfuse Express example",
    logo: assets.brand.valfuse,
    endpoints: ["GET /health", "GET /users?limit=10", "GET /users/:userId", "POST /users"],
  });
});

app.listen(port, () => {
  process.stdout.write(`Express example listening on http://localhost:${port}\n`);
});
