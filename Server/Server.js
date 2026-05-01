import app from "./App.js";

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION!  Shutting down...");
  console.error(err.name, err.message);

  process.exit(1);
});

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION!  Shutting down...");
  console.error(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
