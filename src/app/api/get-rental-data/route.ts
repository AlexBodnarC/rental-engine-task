import axios from "axios";
import { env } from "~/env";

export async function GET() {
  try {
    const data = await axios.get(env.NEXT_PUBLIC_RENTENGINE_URL);

    return new Response(JSON.stringify(data.data), {
      status: 200,
    });
  } catch (error) {
    return new Response("fetch error", { status: 500 });
  }
}
