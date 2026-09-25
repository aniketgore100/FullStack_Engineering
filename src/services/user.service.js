import { prisma } from "../lib/prisma.js";

export const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  picture: u.picture,
});

// Create the user on first login, refresh profile fields on later ones.
export const upsertGoogleUser = (profile) =>
  prisma.user.upsert({
    where: { googleId: profile.googleId },
    create: {
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    },
    update: {
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      lastLoginAt: new Date(),
    },
  });

export const findUserById = (id) => prisma.user.findUnique({ where: { id } });
