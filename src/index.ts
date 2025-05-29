import app from "./app";
import dotenv from "dotenv";
import logger from "./configs/winston-logger";

//dotEnv config
dotenv.config();

// console.log(process.env.NODE_ENV);

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    logger.info(`server is listening on port ${PORT}!!!`);
});