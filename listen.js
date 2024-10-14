const express = require("express");

const app = express();

app.listen(8080, (err) => {
  if (err) return err;
  return `Listening on the PORT:8080...`;
});
