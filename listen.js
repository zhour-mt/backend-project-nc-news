const app = require('./app')

const { PORT = 9090 } = process.env;

app.listen(PORT, (err) => {
  if (err) return err;
  console.log(`Listening on the PORT: ${PORT}`);
});
