const app = require('./app')

app.listen(8080, (err) => {
  if (err) return err;
  console.log(`Listening on the PORT:8080...`);
});
