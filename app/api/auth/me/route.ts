import {NextRequest, NextResponse} from "next/server";
import {verifyAccessToken} from "@/lib/auth";
import {getUserById} from "@/lib/db-queries";
import {cookies} from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({error: "No token provided"}, {status: 401});
    }

    const payload = verifyAccessToken(token);
    if (!payload?.user) {
      return NextResponse.json({error: "Invalid token"}, {status: 401});
    }

    const user = payload.user as {id: string};
    const fullUser = await getUserById(user.id);

    if (!fullUser) {
      return NextResponse.json({error: "User not found"}, {status: 404});
    }

    return NextResponse.json({
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
        image: fullUser.image,
        emailVerified: fullUser.emailVerified,
        createdAt: fullUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}
