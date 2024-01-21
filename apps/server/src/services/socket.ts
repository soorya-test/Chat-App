import { Server } from "socket.io";
import Redis from "ioredis";

import prismaClient from "./prisma";
import { produceMessage } from "./kafka";

const dotenv = require("dotenv").config();

const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT ?? "6379";
const username = process.env.REDIS_USERNAME;
const password = process.env.REDIS_PASSWORD;

const pub = new Redis({
  host: host,
  port: parseInt(port, 10),
  username: username,
  password: password,
});

const sub = new Redis({
  host: host,
  port: parseInt(port, 10),
  username: username,
  password: password,
});

class SocketService {
  private _io: Server;

  constructor() {
    console.log("Init Socket Server");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });

    sub.subscribe("MESSAGES");
  }

  public initListeners() {
    console.log("Init Socket Listeners");
    const io = this._io;
    io.on("connect", (socket) => {
      console.log("New Socket Connected:", socket.id);

      socket.on("event:message", async ({ message }: { message: String }) => {
        console.log("New Message Recieved:", message);
        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    sub.on("message", async (channel, message) => {
      if (channel === "MESSAGES") {
        io.emit("message", message);

        // Kafka Approach
        await produceMessage(JSON.parse(message).message);
        console.log("Message Produced to Kafka");

        // Add DB
        // await prismaClient.message.create({
        //   data: {
        //     text: JSON.parse(message).message,
        //   },
        // });
      }
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
