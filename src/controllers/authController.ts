import { Response, Request } from "express";
import { signInShema, signUpShema } from "../schemas/authSchemas";

function signInUser(req: Request, res: Response){
    res.status(200).send({id:"3df645", token:"token_usuraio", name:"rafaels"})
}

function signUpUser(req:Request, res:Response){
    res.send("teste controller login")
}

export {
    signInUser,
    signUpUser
}