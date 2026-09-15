import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const newUsername = "Aryan";
  const newPassword = "aryan@123";

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  console.log("Looking up users in database...");
  const users = await prisma.user.findMany({
    include: { profile: true },
  });

  if (users.length === 0) {
    console.log("No existing users found. Creating a new user...");
    const newUser = await prisma.user.create({
      data: {
        email: "aryan@winterarc.local",
        username: newUsername,
        passwordHash,
        profile: {
          create: {
            mainGoals: JSON.stringify(["Build Discipline", "Level Up"]),
            currentWeight: 75,
            targetWeight: 70,
            startingWeight: 75,
            unitPreference: "kg",
            totalXp: 0,
            level: 1,
            rank: "RECRUIT",
            currentStreak: 1,
          },
        },
      },
    });
    console.log(`✓ User created! Username: ${newUser.username}, Email: ${newUser.email}`);
  } else {
    // Update the first user or most recently updated user
    const targetUser = users[0];
    console.log(`Updating user ID: ${targetUser.id} (Old Username: "${targetUser.username}")...`);

    const updatedUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        username: newUsername,
        passwordHash,
      },
    });

    console.log(`✓ User updated successfully!`);
    console.log(`  Username: ${updatedUser.username}`);
    console.log(`  Email: ${updatedUser.email}`);
    console.log(`  New Password: ${newPassword}`);
  }
}

main()
  .catch((err) => {
    console.error("Error updating credentials:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
