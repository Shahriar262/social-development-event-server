const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Social development event server is running");
});

app.listen(port, () => {
  console.log(`Social development event server is running on port: ${port}`);
});
