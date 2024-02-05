import express, { Application } from "express"
import http from "http"
import { Server, Socket } from "socket.io"

class App {
    private app: Application
    private http: http.Server
    private io: Server
    private clients: String[]
    private messagens: Object[]

    constructor() {
        this.app = express()
        this.http = http.createServer(this.app)
        this.io = new Server(this.http)
        this.listenSocket()
        this.clients = []
        this.messagens = []

    }

    listenServer() {
        this.http.listen(3000, () => console.log("SERVIDOR ATIVO: "))
    }

    listenSocket() {
        this.io.on("connection", (socket) => {
            console.log("USUÁRIO CONECTADO: " + socket.id)

            this.handleInicializeSetup(socket)

            socket.on("send-message",(data)=>{
                const now = new Date();
                const time = `${now.getHours()}:${now.getMinutes()}`;
          
                console.log(data)
                let message = {
                    id:socket.id,
                    text:data,
                    time:time
                }
                this.messagens = [...this.messagens, message]
                this.io.sockets.emit("update-mesagens",this.messagens)
            })

            this.handleDisconectSocket(socket)
        })
    }

    handleNumberOfClientsConected() {
        this.io.sockets.emit("handleNumberOfClientsConected", this.clients)
    }

    handleInicializeSetup(socket:Socket){
        this.clients.push(socket.id)
        console.log(this.clients)
        this.handleNumberOfClientsConected()
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
            console.log(this.clients)
            this.handleNumberOfClientsConected()
        });
    }


}
const app = new App()

app.listenServer()
