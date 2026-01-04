import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// Fixed UUIDs for testing
const RESTAURANT_1_ID = "11111111-1111-1111-1111-111111111111";
const RESTAURANT_2_ID = "22222222-2222-2222-2222-222222222222";
const CAT_PIZZA_ID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const CAT_DRINKS_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const CAT_BURGERS_ID = "cccccccc-cccc-cccc-cccc-cccccccccccc";

async function main() {
  console.log("Seeding database...");

  // Create test restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: RESTAURANT_1_ID },
    update: {},
    create: {
      id: RESTAURANT_1_ID,
      name: "პიცა პალაცო",
      description: "საუკეთესო იტალიური პიცა სამტრედიაში",
      address: "რუსთაველის 15, სამტრედია",
      phone: "+995555111222",
      lat: 42.1434,
      lng: 42.3537,
      minOrderAmount: 15,
      deliveryFee: 3,
      avgPrepTime: 30,
      isActive: true,
    },
  });

  console.log("Created restaurant:", restaurant.name);

  // Create categories
  const pizzaCategory = await prisma.category.upsert({
    where: { id: CAT_PIZZA_ID },
    update: {},
    create: {
      id: CAT_PIZZA_ID,
      restaurantId: restaurant.id,
      name: "პიცა",
      sortOrder: 1,
      isActive: true,
    },
  });

  const drinksCategory = await prisma.category.upsert({
    where: { id: CAT_DRINKS_ID },
    update: {},
    create: {
      id: CAT_DRINKS_ID,
      restaurantId: restaurant.id,
      name: "სასმელები",
      sortOrder: 2,
      isActive: true,
    },
  });

  console.log("Created categories");

  // Create menu items
  const menuItems = [
    {
      id: "11111111-0001-0001-0001-000000000001",
      categoryId: pizzaCategory.id,
      name: "მარგარიტა",
      description: "მოცარელა, ტომატის სოუსი, ბაზილიკი",
      price: 18.5,
      sortOrder: 1,
      isAvailable: true,
    },
    {
      id: "11111111-0001-0001-0001-000000000002",
      categoryId: pizzaCategory.id,
      name: "პეპერონი",
      description: "პეპერონი, მოცარელა, ტომატის სოუსი",
      price: 22.0,
      sortOrder: 2,
      isAvailable: true,
    },
    {
      id: "11111111-0001-0001-0001-000000000003",
      categoryId: pizzaCategory.id,
      name: "კვატრო ფორმაჯი",
      description: "4 სახეობის ყველი",
      price: 25.0,
      sortOrder: 3,
      isAvailable: true,
    },
    {
      id: "11111111-0001-0001-0001-000000000004",
      categoryId: drinksCategory.id,
      name: "კოკა-კოლა",
      description: "0.5L",
      price: 3.0,
      sortOrder: 1,
      isAvailable: true,
    },
    {
      id: "11111111-0001-0001-0001-000000000005",
      categoryId: drinksCategory.id,
      name: "ფანტა",
      description: "0.5L",
      price: 3.0,
      sortOrder: 2,
      isAvailable: true,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  console.log("Created menu items");

  // Create second restaurant
  const restaurant2 = await prisma.restaurant.upsert({
    where: { id: RESTAURANT_2_ID },
    update: {},
    create: {
      id: RESTAURANT_2_ID,
      name: "ბურგერ ჰაუსი",
      description: "ხელნაკეთი ბურგერები",
      address: "ჭავჭავაძის 8, სამტრედია",
      phone: "+995555333444",
      lat: 42.1440,
      lng: 42.3550,
      minOrderAmount: 12,
      deliveryFee: 2.5,
      avgPrepTime: 25,
      isActive: true,
    },
  });

  const burgerCategory = await prisma.category.upsert({
    where: { id: CAT_BURGERS_ID },
    update: {},
    create: {
      id: CAT_BURGERS_ID,
      restaurantId: restaurant2.id,
      name: "ბურგერები",
      sortOrder: 1,
      isActive: true,
    },
  });

  const burgerItems = [
    {
      id: "22222222-0001-0001-0001-000000000001",
      categoryId: burgerCategory.id,
      name: "კლასიკური ბურგერი",
      description: "ხორცი, სალათა, პომიდორი, ხახვი",
      price: 14.0,
      sortOrder: 1,
      isAvailable: true,
    },
    {
      id: "22222222-0001-0001-0001-000000000002",
      categoryId: burgerCategory.id,
      name: "ჩიზბურგერი",
      description: "ხორცი, ჩედარი, სალათა, პომიდორი",
      price: 16.0,
      sortOrder: 2,
      isAvailable: true,
    },
    {
      id: "22222222-0001-0001-0001-000000000003",
      categoryId: burgerCategory.id,
      name: "დაბლ ბურგერი",
      description: "ორმაგი ხორცი, ორმაგი ყველი",
      price: 22.0,
      sortOrder: 3,
      isAvailable: true,
    },
  ];

  for (const item of burgerItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  console.log("Created second restaurant with menu");
  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
