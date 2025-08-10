import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

export const generateMockUsers = async (num) => {
const users = [];
const hashedPassword = await bcrypt.hash("coder123", 10);
for (let i = 0; i < num; i++) {
    users.push({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    password: hashedPassword,
    role: Math.random() > 0.5 ? "user" : "admin",
    pets: []
    });
}
return users;
};

export const generateMockPets = (num) => {
const pets = [];
for (let i = 0; i < num; i++) {
    pets.push({
        name: faker.animal.dog(),
        specie: faker.animal.type(),
        birthDate: faker.date.birthdate({ min: 2010, max: 2023, mode: 'year' }),
        adopted: faker.datatype.boolean(),
        owner: undefined,
        image: faker.image.urlPicsumPhotos()
    });
}
return pets;
};
