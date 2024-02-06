import Joi from "joi";

const signInShema = Joi.object({
    email:Joi.string().required(),
    password: Joi.string().required()
});

const signUpShema = Joi.object({
    name:Joi.string().required(),
    email:Joi.string().email().required(),
    password: Joi.string().required()
});


export {
    signInShema,
    signUpShema
}