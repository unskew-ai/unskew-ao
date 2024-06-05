import { knowledgeSearch, getKnowledgeByLink } from "./aikek.js";

export async function transformEvents() {
  try {
    const final_events = [];
    const events = (await knowledgeSearch()).documents;

    for (const event of events) {
      event.summary = (await getKnowledgeByLink(event.source))?.summary;
      event.project = "Arweave";
      event.project_token = "AR";
      event.project_description =
        "Arweave is a decentralized storage network that seeks to offer a platform for the permanent storage of data";
      event.project_industry = "Storage";
      event.event = event.title;
      delete event.title;
      event.time = event.last_time_updated;
      delete event.last_time_updated;
      event.source_url = event.source;
      event.source = getBaseDomain(event.source_url);
    }

    for (const event of events) {
      const rawdata = JSON.stringify({
        summary: event.summary,
        tldr: event.tldr,
      });

      delete event.summary;
      delete event.tldr;

      const encodedString = btoa(
        encodeURIComponent(rawdata).replace(/%([0-9A-F]{2})/g, (match, p1) =>
          String.fromCharCode("0x" + p1),
        ),
      );
      event.rawdata = encodedString;
      console.log(JSON.stringify(event));
      final_events.push(JSON.stringify(event));
    }

    return final_events;
  } catch (error) {
    console.log(error);
    return {};
  }
}

function getBaseDomain(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}
