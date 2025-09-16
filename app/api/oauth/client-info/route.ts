import {NextRequest, NextResponse} from "next/server";
import {getOAuthClientByClientId} from "@/lib/oauth2-queries";

export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url);
    const clientId = searchParams.get("client_id");

    if (!clientId) {
      return NextResponse.json({error: "client_id is required"}, {status: 400});
    }

    const client = await getOAuthClientByClientId(clientId);

    if (!client) {
      return NextResponse.json({error: "Client not found"}, {status: 404});
    }

    return NextResponse.json({
      clientName: client.clientName,
      clientId: client.clientId,
    });
  } catch (error) {
    console.error("Client info error:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
