import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = params.email as string;
        if (!email || typeof email !== "string") {
          throw new ConvexError("Email is required");
        }
        const name = typeof params.name === "string" && params.name.length > 0
          ? params.name
          : email.split("@")[0];
        return {
          email: email.trim().toLowerCase(),
          name,
        };
      },
    }),
  ],
});
