import 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: string
    customerId?: string
  }

  interface Session {
    user: {
      id?: string
      email?: string
      name?: string
      role?: string
      customerId?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    customerId?: string
  }
}
