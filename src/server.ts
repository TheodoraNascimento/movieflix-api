import express from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUi  from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/movies", async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc",
        },
        include: {
            genres: true,
            languages: true,
        }
    });
    res.json(movies);
});

app.post("/movies", async(req, res) => {

   // console.log(`Conteudo do body enviado na requisicao: ${req.body.title}`)

    const { title, genre_id, language_id, oscar_count, release_date } = req.body;

    try{

        const movieWithSameTitle = await prisma.movie.findFirst({
            where: { 
                title: { equals: title, mode: "insensitive" }
            }
        });

        if(movieWithSameTitle){
            res.status(409).send({message: "There is already a movie with this title" }); //error 409= conflito com algum tipo de dado
            return;
        
        }
        await prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date) //nesse caso pode paasar um string aqui
            }
        });
    }catch (error) {
       res.status(500).send({ message: "Falha ao cadastrar um filme" });
       return;
    }
    res.status(201).send();
});

app.put("/movies/:id", async (req, res) => {
    //console.log(req.params.id);
    const id = Number(req.params.id);

    try{
    const movie = await prisma.movie.findUnique({
        where: {
            id
        }
    });

    if(!movie){
        res.status(404).send({ message: "Movie not found" });
        return;
    }
    const data = { ...req.body };
    //console.log(data);
    data.release_date = data.release_date ? new Date(data.release_date): undefined;
    
    await prisma.movie.update({
        where: {
            id
        },
        data: data
    });
}catch(error){
    res.status(500).send( {message: "Error when trying to update movie info"}); //500 erro no servidor
}

    res.status(200).send();
    
})

app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({ where: { id } });

        if (!movie) {
            res.status(404).send({ message: "Movie not found" });
            return;
        }

        await prisma.movie.delete({ where: { id } });
    } catch (error) {
        res.status(500).send({ message: "It was not possible to remove the movie" });
    }
    res.status(200).send();
})

app.get("/movies/:genreName", async (req, res) => {
    // console.log(req.params.genreName);

    try {

        const movieFilterByGenreName = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true
            },
            where: {
                genres: {
                    name: {
                        equals: req.params.genreName,
                        mode: "insensitive"
                    }
                }
            }
        });
        res.status(200).send(movieFilterByGenreName);
    } catch (error) {
        res.status(500).send({ message: "Error on trying to filter movies by genre" });
    
    }
});

app.listen(port, () => {
  console.log(`Servidor em execução na porta http://localhost:${port}`);
});
