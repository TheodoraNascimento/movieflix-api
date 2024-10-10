import express from "express";

const port = 3000;
const app = express();

app.get("/movies", (req, res) => {
    res.send("Movies List");
});

app.listen(port, () => {
  console.log(`Servidor em execução na porta http://localhost:${port}`);
});
