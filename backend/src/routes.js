import { Router } from "express";
import { requestHandler } from "./requestHandler.js";


const routes = Router()

routes.get('/', (req, res) => res.send('hello'))
routes.post('/', (req, res) => requestHandler(req,res))

export {routes}