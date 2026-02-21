import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verify } from 'argon2';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        dni: { label: 'DNI', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.dni || !credentials?.password) {
            throw new Error('DNI and password required');
          }

          const user = await prisma.user.findUnique({
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
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            dni: user.dni?.toString(),
          };
        } catch (error) {
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
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