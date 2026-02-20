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


export default clerkMiddleware(async(auth, req)=>{
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
