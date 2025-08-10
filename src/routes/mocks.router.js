import { Router } from "express";
import { generateMockUsers, generateMockPets } from "../utils/mocking.utils.js";
import Pet from "../dao/Pets.dao.js";
import Users from "../dao/Users.dao.js";

const router = Router();


router.get("/mockingpets", (req, res) => {
const pets = generateMockPets(50);
res.json({ status: "success", pets });
});

router.get("/mockingusers", async (req, res) => {
const users = await generateMockUsers(50);
res.json({ status: "success", users });
});

router.post("/generateData", async (req, res) => {
const { users = 0, pets = 0 } = req.body;
const mockUsers = await generateMockUsers(Number(users));
const mockPets = generateMockPets(Number(pets));

const userDao = new Users();
const petDao = new Pet();

await Promise.all(mockUsers.map(u => userDao.save(u)));
await Promise.all(mockPets.map(p => petDao.save(p)));

res.json({ status: "success", message: "Datos generados e insertados" });
});

export default router;
