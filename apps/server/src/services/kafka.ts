import { Kafka, Producer } from "kafkajs";

import fs from "fs";
import path from "path";

import prismaClient from "./prisma";

const dotenv = require("dotenv").config();

const URI = process.env.KAFKA_URL || "";
const username = process.env.KAFKA_USERNAME || "";
const password = process.env.KAFKA_PASSWORD || "";

const kafka = new Kafka({
  brokers: [URI],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    username,
    password,
    mechanism: "plain",
  },
});

let producer: null | Producer = null;

async function createProducer() {
  if (producer) return producer;

  const newProducer = kafka.producer();
  await newProducer.connect();
  producer = newProducer;
  return producer;
}

export async function produceMessage(message: string) {
  const producer = await createProducer();

  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: "MESSAGES",
  });

  return true;
}

export async function startMessageConsumer() {
  console.log("Consumer is Running");
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;

      console.log("new Message Recieved");

      try {
        await prismaClient.message.create({
          data: {
            text: message.value?.toString(),
          },
        });
      } catch (err) {
        console.log("Something is Wrong");
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
}

export default kafka;
