import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Arzon@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@arzonglobal.com" },
    update: {},
    create: {
      name: "Arzon Admin",
      email: "admin@arzonglobal.com",
      passwordHash,
      role: Role.ADMIN,
      department: "Operations",
      designation: "Administrator"
    }
  });

  const employeePasswordHash = await bcrypt.hash("Employee@123", 10);

  const employees = [
    { name: "Ananya Rao", email: "ananya.rao@arzonglobal.com", department: "Sales", designation: "Sales Executive" },
    { name: "Rahul Mehta", email: "rahul.mehta@arzonglobal.com", department: "Sales", designation: "Sales Executive" },
    { name: "Priya Nair", email: "priya.nair@arzonglobal.com", department: "Academics", designation: "Curriculum Lead" }
  ];

  for (const emp of employees) {
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        ...emp,
        passwordHash: employeePasswordHash,
        role: Role.EMPLOYEE
      }
    });
  }

  console.log("Seeded admin user:", admin.email, "(password: Arzon@123)");
  console.log("Seeded", employees.length, "sample employees (password: Employee@123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
