import 'next-auth';

declare module 'next-auth' {
  interface User {
    googleId?: string;
  }

  interface Session {
    user: {
      email?: string | null;
      name?: string | null;
      image?: string | null;
      googleId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    googleId?: string;
  }
}
