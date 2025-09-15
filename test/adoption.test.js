import mongoose from 'mongoose';
import chai from 'chai';
import supertest from 'supertest';

import User from '../src/dao/models/User.js';
import Pet from '../src/dao/models/Pet.js';
import Adoption from '../src/dao/models/Adoption.js';

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

describe('Tests de Integración para Adopciones', () => {
    let connection;
    let userTest;
    let petTest;

    before(async function() {
        this.timeout(10000);
        try {
            connection = await mongoose.connect('mongodb://127.0.0.1:27017/adoptme_test');
        } catch (error) {
            console.error("Error conectando a la base de datos de prueba:", error);
            throw error;
        }
    });

    beforeEach(async function() {
        this.timeout(5000);
        await User.deleteMany({});
        await Pet.deleteMany({});
        await Adoption.deleteMany({});

        userTest = await User.create({
            first_name: 'Test',
            last_name: 'User',
            email: `testuser_${Date.now()}@test.com`,
            password: 'password123'
        });

        petTest = await Pet.create({
            name: 'Test Pet',
            specie: 'Dog',
            birthDate: new Date()
        });
    });

    after(async function() {
        await mongoose.connection.close();
    });

    it('GET /api/adoptions debe devolver un arreglo vacío inicialmente', async () => {
        const { statusCode, _body } = await requester.get('/api/adoptions');
        
        expect(statusCode).to.equal(200);
        expect(_body.status).to.equal('success');
        expect(_body.payload).to.be.an('array').that.is.empty;
    });

    it('POST /api/adoptions/:uid/:pid debe crear una adopción exitosamente', async () => {
        const userId = userTest._id.toString();
        const petId = petTest._id.toString();

        const { statusCode, _body } = await requester.post(`/api/adoptions/${userId}/${petId}`);

        expect(statusCode).to.equal(200);
        expect(_body.status).to.equal('success');
        expect(_body.payload).to.have.property('status', 'adopted');

        const updatedPet = await Pet.findById(petId);
        expect(updatedPet.adopted).to.be.true;
        expect(updatedPet.owner.toString()).to.equal(userId);

        const updatedUser = await User.findById(userId);
        expect(updatedUser.pets).to.include(petId);

        const adoptionDoc = await Adoption.findOne({ user: userId, pet: petId });
        expect(adoptionDoc).to.not.be.null;
    });

    it('POST /api/adoptions/:uid/:pid no debe permitir adoptar una mascota ya adoptada', async () => {
        await requester.post(`/api/adoptions/${userTest._id}/${petTest._id}`);

        const secondUser = await User.create({
            first_name: 'Second',
            last_name: 'User',
            email: `seconduser_${Date.now()}@test.com`,
            password: 'password123'
        });

        const { statusCode, _body } = await requester.post(`/api/adoptions/${secondUser._id}/${petTest._id}`);

        expect(statusCode).to.equal(400);
        expect(_body.status).to.equal('error');
        expect(_body.error).to.equal('Pet already adopted');
    });
});
