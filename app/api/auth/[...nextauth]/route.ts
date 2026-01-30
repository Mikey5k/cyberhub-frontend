import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = "user";
        token.email = user.email || "";
        token.name = user.name || "";
        token.image = user.image || "";
        
        // Generate a placeholder phone for Google users
        // In production, you might want to ask for phone later
        const placeholderPhone = `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        token.phone = placeholderPhone;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
    
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          // Create or get user in your Firestore system
          const userData = {
            email: user.email,
            name: user.name,
            phone: `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role: "user",
            status: "active",
            authProvider: "google"
          };
          
          // FIXED: Use the correct base URL for API calls
          const baseUrl = process.env.NEXTAUTH_URL || 'https://cyberhub-frontend.vercel.app';
          
          // Check if user exists by email
          const checkResponse = await fetch(
            `${baseUrl}/api/users?email=${encodeURIComponent(user.email || '')}`
          );
          
          let firestoreUser;
          
          if (checkResponse.ok) {
            const checkResult = await checkResponse.json();
            if (checkResult.success && checkResult.user) {
              // User exists, update last login
              firestoreUser = checkResult.user;
            } else {
              // Create new user for Google sign-in
              const createResponse = await fetch(`${baseUrl}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...userData,
                  // Generate a password for Google users (they won't use it)
                  password: `google_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`
                })
              });
              
              if (createResponse.ok) {
                const createResult = await createResponse.json();
                firestoreUser = createResult.user;
              }
            }
          }
          
          // Store user data for use in jwt callback
          user.id = firestoreUser?.id || `google_${Date.now()}`;
          user.role = firestoreUser?.role || "user";
        }
        
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return true; // Allow sign-in even if our sync fails
      }
    }
  },
  
  events: {
    async signIn({ user, account, profile }) {
      // This runs after successful sign-in
      console.log("Google user signed in:", user.email);
    }
  },
  
  pages: {
    signIn: '/login',
    error: '/login',
  },
  
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };