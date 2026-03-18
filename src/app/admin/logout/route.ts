import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL("/admin/login", req.url);
  const res = NextResponse.redirect(url);
  res.cookies.set("kaaswinkel_admin", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  return res;
}
