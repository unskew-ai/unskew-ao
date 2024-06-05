import {
  dryrun,
  createDataItemSigner,
  message,
} from "@permaweb/aoconnect";
import dotenv from "dotenv";
import { transformEvents } from "./transformer.js";
import { UNSKEW_AI_PROCESS } from "./constants.js";
dotenv.config();

const wallet = JSON.parse(process.env.JWK);

async function getEventById(id) {
  try {
    const tx = await dryrun({
      process: UNSKEW_AI_PROCESS,
      tags: [
        { name: "Action", value: "GetEventById" },
        {
          name: "EventId",
          value: id,
        },
      ],
    });

    console.log(tx.Messages[0]);

    console.log(JSON.parse(tx.Messages[0].Data));

    return JSON.parse(tx.Messages[0].Data);
  } catch (error) {
    console.log(error);
    return {};
  }
}

async function indexResponse(event) {
  try {
    const messageId = await message({
      process: UNSKEW_AI_PROCESS,
      signer: createDataItemSigner(wallet),
      data: event,
      tags: [{ name: "Action", value: "IndexResponse" }],
    });

    console.log(messageId);
    return { messageId };
  } catch (error) {
    console.log(error);
    return { messageId: false };
  }
}

export async function loadDataIntoAo() {
  try {
    const events = await transformEvents();
    for (const event of events) {
      await indexResponse(event);
    }
  } catch (error) {
    console.log(error);
  }
}
