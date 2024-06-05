import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function knowledgeSearch() {
  try {
    const data = {
      query: "Arweave",
      count: 10,
      offset: 0,
      sort_by: "date",
      sources: ["news", "4chan"],
    };

    const res = await axios.post(
      "https://api.alphakek.ai/knowledge/search",
      data,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.AIKEK_BEARER}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res?.data;
  } catch (error) {
    console.log(error);
    return {};
  }
}


export async function getKnowledgeByLink(link) {
  try {
    const config = {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.AIKEK_BEARER}`,
      },
      params: {
        link: link,
      },
    };

    const res = (
      await axios.get("https://api.alphakek.ai/knowledge/get/by_link", config)
    )?.data;
    return res;
  } catch (error) {
    console.log(error);
    return error;
  }
}
