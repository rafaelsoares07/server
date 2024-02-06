import { NextFunction, Response, Request } from "express";
import Joi, { Schema } from "joi";

export function JoiValidationMiddleware(schema:Schema){
    return (req:Request, res:Response, next:NextFunction) =>{

        console.log(req.body)
        const {error, value} = schema.validate(req.body)

        if(error){
            return res.status(400).json({error:"deu erro no middleware"})
        }
    
        next()
    }

}