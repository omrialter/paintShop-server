const indexR = require("./index");
const usersR = require("./users");
const paintingsR = require("./paintings");


exports.routesInit = (app) => {
  app.use("/", indexR);
  app.use("/users", usersR);
  app.use("/paintings", paintingsR);


  app.use("/*", (req, res) => {
    res.status(404).json({ msg: "page not found 404" })
  })
}
