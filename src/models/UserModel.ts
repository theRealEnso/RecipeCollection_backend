import mongoose, { Document} from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt"
import logger from "../configs/winston-logger";

const { Schema } = mongoose;

//define typescript interface for new user documents
interface NewUser extends Document {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    $isNew: boolean;
};

//create user schema
const userSchema = new Schema<NewUser>({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
        minLength: [2, "First name must be at least two characters in length"],
        maxLength: [24, "First name cannot exceed 24 characters"],
    },

    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
        minLength: [2, "Last name must be at least two characters in length"],
        maxLength: [24, "Last name cannot exceed 24 characters"],
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        validate: {
            validator: (emailAddress) => validator.isEmail(emailAddress),
            message: (props) => `${props.value} is not a valid email address!`
        },
        unique: [true, "Email address is already registered to an existing user. Please use another email address"]
    },

    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        minLength: [8, "Password must be at least 8 characters long"],
        maxLength: [32, "Password cannot exceed 32 characters in length"],
    },

}, {collection: "users", timestamps: true,});

//hash user password using bcrypt before a user document is saved
userSchema.pre<NewUser>("save", async function(next){
    if(this.$isNew){
        const saltRounds = 12;
        const password = this.password;
        await bcrypt.hash(password, saltRounds, (error, hashedPassword) => {
            if(error){
                logger.error(error);
                next(error);
            } else {
                this.password = hashedPassword;
                next();
            };
        });
    };
});

export const UserModel = mongoose.models.UserModel || mongoose.model("UserModel", userSchema);