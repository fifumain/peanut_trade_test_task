const express = require("express");
const app = express();
const port = 3000;
const priceRoutes = require("./routes/getRatesRoutes");
const estimateRoutes = require("./routes/estimateRoutes");
// both routes usage
app.use("", priceRoutes);
app.use("", estimateRoutes);

app.listen(port, () => {
  // set 3000
  console.log(`Server running on port ${port}`);
});
