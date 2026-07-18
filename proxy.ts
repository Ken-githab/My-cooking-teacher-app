import { NextRequest, NextResponse } from "next/server";

// 自分専用アプリの保護。「?key=<ACCESS_KEY> 付きURLを一度開くと1年有効の
// Cookieが入り、以降は何も聞かれない」方式（高配当系アプリと同じ）。
const COOKIE_NAME = "cooking_key";
const ONE_YEAR = 60 * 60 * 24 * 365;

export default function proxy(req: NextRequest) {
  const key = process.env.ACCESS_KEY;
  if (!key) return NextResponse.next();

  if (req.cookies.get(COOKIE_NAME)?.value === key) {
    return NextResponse.next();
  }

  const urlKey = req.nextUrl.searchParams.get("key");
  if (urlKey === key) {
    const clean = req.nextUrl.clone();
    clean.searchParams.delete("key");
    const res = NextResponse.redirect(clean);
    res.cookies.set(COOKIE_NAME, key, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: ONE_YEAR,
      path: "/",
    });
    return res;
  }

  return new NextResponse(
    `<!doctype html><html lang="ja"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<body style="font-family:'Hiragino Kaku Gothic ProN',sans-serif;background:#111;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
<div style="text-align:center;background:#222;border-radius:24px;padding:2.5rem">
<div style="font-size:2.5rem">🔒</div>
<p style="font-weight:bold;margin:.75rem 0 .25rem">アクセスキーが必要です</p>
<p style="color:#aaa;font-size:.85rem;margin:0">キー付きURLから開くか、キーを入力してください</p>
<form method="GET" style="margin-top:1.25rem;display:flex;gap:.5rem;justify-content:center">
<input name="key" type="password" placeholder="アクセスキー" autocomplete="off" style="background:#333;border:none;border-radius:12px;padding:.65rem .9rem;color:#fff;font-size:16px;width:11rem">
<button type="submit" style="background:#fff;color:#111;border:none;border-radius:12px;padding:.65rem 1rem;font-weight:bold;font-size:.9rem">解錠</button>
</form>
</div></body></html>`,
    { status: 401, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export const config = {
  // 静的アセット(ドット付き=拡張子ありのファイル)とNext内部・動的アイコンルート
  // のみ認証対象から除外。/api を含むそれ以外の全ページ・データを保護する。
  matcher: ["/((?!_next/static|_next/image|icon|apple-icon|.*\\.).*)"],
};
