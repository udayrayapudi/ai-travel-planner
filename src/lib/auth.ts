import { User } from "@/lib/models/User";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials provided");
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email }).select(
          "+password",
        );

        if (!user) {
          throw new Error("User not found");
        }

        if (user.provider !== "credentials") {
          throw new Error(
            `Account created with ${user.provider}. Please sign in with that provider.`,
          );
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password || "",
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.displayName,
          image: user.avatar,
        };
      },
    }),

    // Only include Google provider if credentials are set
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),

    // Only include GitHub provider if credentials are set
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "credentials") {
        return true;
      }

      // OAuth sign-in: create or update user
      if (account) {
        await connectDB();

        const existing = await User.findOne({
          $or: [
            { email: user.email },
            {
              providerId: account.providerAccountId,
              provider: account.provider,
            },
          ],
        });

        if (existing) {
          // Update existing user
          existing.providerId = account.providerAccountId;
          existing.provider = account.provider;
          if (user.image) existing.avatar = user.image;
          await existing.save();
          return true;
        }

        // Create new user
        await User.create({
          email: user.email,
          displayName: user.name || "User",
          provider: account.provider,
          providerId: account.providerAccountId,
          avatar: user.image,
          emailVerified: true,
        });

        return true;
      }

      return false;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export const getAuth = () => getServerSession(authOptions);
