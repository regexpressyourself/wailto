const compression = require("compression");
const bodyParser = require("body-parser");
const lusca = require("lusca");
const expressStatusMonitor = require("express-status-monitor");
const cors = require("cors");

module.exports = (app) => {
  // Express configuration
  app.set("host", process.env.OPENSHIFT_NODEJS_IP || "0.0.0.0");
  app.set(
    "port",
    process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3011,
  );

  app.use(expressStatusMonitor());

  app.use(cors());

  app.use(compression());

  app.use(bodyParser.json());

  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(lusca.xssProtection(true));

  app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
  });
};
