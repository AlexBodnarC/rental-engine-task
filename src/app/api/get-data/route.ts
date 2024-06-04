import axios from "axios";
import { env } from "~/env";
import * as xmlParser from "xml-js";
import { type NextRequest } from "next/server";
import { log } from "console";
export async function GET(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider");

  if (!provider) {
    return new Response("no provider", { status: 500 });
  }

  let url = "";

  if (provider === "zumper") url = env.ZUMPER_URL;
  if (provider === "zillow") url = env.ZILLOW_URL;

  try {
    const getZillowData = await axios.get(url);
    const parseXmlZillowData = xmlParser.xml2json(getZillowData.data, {
      compact: true,
      spaces: 4,
    });

    return new Response(parseXmlZillowData, {
      status: 200,
    });
  } catch (error) {
    return new Response("fetch error", { status: 500 });
  }
}
