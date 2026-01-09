import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verify } from 'argon2';
import { db } from '@/lib/prisma';
import { USER_ROLES } from '@/constants/roles.constants';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        dni: { label: 'DNI', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.dni || !credentials?.password) {
          throw new Error('DNI and password required');
        }

        const user = await db.user.findUnique({
          where: { dni: parseInt(credentials.dni) },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await verify(user.password, credentials.password);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          dni: user.dni,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.dni = user.dni;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.dni = token.dni as string;
      }
      return session;
    },
  },
};

export default authOptions;