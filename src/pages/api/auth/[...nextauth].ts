import { query as q } from 'faunadb'
import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

import { fauna } from '../../../services/fauna';

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {

      const { email } = user

      try { 
        
        const a = await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email2'),
                  q.Casefold(user.email)
                )
              )
            ),
            q.Create(
              q.Collection('users2'),
              { data: { email } }
            ),
            q.Get(
              q.Match(
                q.Index('user_by_email2'),
                q.Casefold(user.email)
              )
            )
          )
        )
        return true
      } catch (err) {//Captura o erro
        console.log(err)
      }
    },
  },
})