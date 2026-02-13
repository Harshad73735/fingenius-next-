import arcjet from '@arcjet/next';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

// const aj = arcjet({
//   key: process.env.ARCJET_KEY,
//   rules: [
//     shield({
//       mode: "LIVE",
//     }),
//     detectBot({
//       mode: "LIVE", 
//       allow: [
//         "CATEGORY:SEARCH_ENGINE",
//         "GO_HTTP", 
//       ],
//     }),
//   ],
// });

// docker build -t fingenius-next .

// docker run -p 3000:3000 fingenius-next


export default clerkMiddleware(async(auth,req)=>{
  const { userId } = await auth();
  console.log("[middleware] userId:", userId, "path:", req.nextUrl.pathname);
  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    console.log("[middleware] Redirecting to sign-in for path:", req.nextUrl.pathname);
    return redirectToSignIn();
  }
  //   return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
  runtime: 'nodejs',  // ✅ Add this line
};
