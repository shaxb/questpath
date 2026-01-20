import NextAuth from "next-auth"
import Google from "next-auth/providers/google"



export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // NextAuth will handle the OAuth flow
      // We'll sync with our backend after successful sign-in
      return true
    },
    async jwt({ token, account, user }) {
      // Store Google account info in the token
      if (account && user) {
        token.googleId = account.providerAccountId
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      // Make Google info available in session
      if (token) {
        session.user.googleId = token.googleId as string
        session.user.name = token.name
        session.user.image = token.picture as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',  // Redirect to our custom login page
  },
})
