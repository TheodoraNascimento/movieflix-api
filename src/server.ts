import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

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
            return res.status(409).send({message: "There is already a movie with this title" }); //error 409= conflito com algum tipo de dado
        
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
        return res.status(500).send({ message: "Falha ao cadastrar um filme" });
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
        return res.status(404).send({ message: "Movie not found" });
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
    return res.status(500).send( {message: "Error when trying to update movie info"}) //500 erro no servidor
}

    res.status(200).send();
    
})


app.listen(port, () => {
  console.log(`Servidor em execução na porta http://localhost:${port}`);
});
