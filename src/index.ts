import app from "./app";
import dotenv from "dotenv";

//dotEnv config
dotenv.config();

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}!!!`);
});