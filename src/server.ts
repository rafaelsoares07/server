import express, { Application, Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import * as AuthController from "./controllers/authController";
import { JoiValidationMiddleware } from "./middlewares/JoiValidationMiddleware";
import { signInShema, signUpShema } from "./schemas/authSchemas";
import cors from "cors"; // Importe o pacote cors

class App {
    private app: Application;
    private http: http.Server;
    private io: Server;
    private clients: String[];
    private messagens: Object[];
    private filaDeConexao: String[];

    constructor() {
        this.app = express();
        this.http = http.createServer(this.app);
        this.io = new Server(this.http);
        this.listenSocket();
        this.clients = [];
        this.messagens = [];
        this.filaDeConexao = [];
        this.setupRoutes();
    }

    listenServer() {
        this.http.listen(3000, () => console.log("SERVIDOR ATIVO: "));
    }

    listenSocket() {
        this.io.on("connection", (socket) => {
            console.log("USUÁRIO CONECTADO: " + socket.id);

            this.handleNumberOfClientsConected();

            this.handleInicializeSetup(socket);

            socket.on("send-message",(data)=>{
                const now = new Date();
                const time = `${now.getHours()}:${now.getMinutes()}`;
          
                console.log(data);
                let message = {
                    id:socket.id,
                    text:data,
                    time:time
                };
                this.messagens = [...this.messagens, message];
                this.io.sockets.emit("update-mesagens",this.messagens);
            });

            socket.on("conectar-na-fila", () => {
                console.log("Usuário solicita conexão na fila:", socket.id);
                this.filaDeConexao.push(socket.id); // Adiciona o usuário à fila

                // Tenta emparelhar usuários se houver pelo menos dois na fila
                if (this.filaDeConexao.length >= 2) {
                    this.emparelharUsuarios();
                }
            });

            this.handleDisconectSocket(socket);
        });
    }

    emparelharUsuarios() {
        // Verifica se há pelo menos dois usuários na fila
        if (this.filaDeConexao.length >= 2) {
            const usuario1 = this.filaDeConexao.shift(); // Remove o primeiro usuário da fila
            const usuario2 = this.filaDeConexao.shift(); // Remove o segundo usuário da fila

            if (usuario1 && usuario2) {
                // Emitir evento para ambos os usuários informando que foram conectados
                this.io.to(usuario1.toString()).emit("parceiro-encontrado", usuario2);
                this.io.to(usuario2.toString()).emit("parceiro-encontrado", usuario1);

                console.log("Usuários emparelhados:", usuario1, usuario2);
            } else {
                console.log("Erro ao emparelhar usuários: usuário não encontrado.");
            }
        } else {
            console.log("A fila de conexão não possui usuários suficientes para emparelhamento.");
        }
    }

    handleNumberOfClientsConected() {
        const numClients = this.io.sockets.sockets.size;
        this.io.sockets.emit("handleNumberOfClientsConected", numClients);
    }

    handleInicializeSetup(socket:Socket){
        this.clients.push(socket.id.toString());
        console.log(this.clients);
        this.handleNumberOfClientsConected();
    }

    handleDisconectSocket(socket: Socket) {
        socket.on("disconnect", () => {

            console.log("USUÁRIO DESCONECTADO ID: " + socket.id);

            // Encontrar a posição do elemento com o mesmo ID no array
            const index = this.clients.indexOf(socket.id);

            // Remover o elemento se encontrado
            if (index !== -1) {
                this.clients.splice(index, 1);
                console.log("CLIENTE REMOVIDO DA LISTA DOS ATIVOS");
            }
            console.log(this.clients);

            this.handleNumberOfClientsConected();
        });
    }

    setupRoutes(){
        this.app.use(cors());
        this.app.use(express.json());
        this.app.post("/signin",JoiValidationMiddleware(signInShema),AuthController.signInUser);
        this.app.post("/signup",JoiValidationMiddleware(signUpShema),AuthController.signUpUser);
    }


}
const app = new App();

app.listenServer();
