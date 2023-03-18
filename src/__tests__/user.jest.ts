import request from 'supertest';
import app from "../app"
import { Application } from 'express';


let server:any;
let access_token: string;

/*
 Þarft að breyta fyrir hvert run. ATH password þarf að vera minnstakosti 10 stafir og 
 username má ekki vera í database.
*/
let test_user = "prufa123455555";
let test_password = "0123456789"

beforeAll(async () => {
    server = app.listen(3000);
});

afterAll(async () => {
    server.close();
});

describe('GET /events', () => {
    test('should return a list of events', async () => {
        const response = await request(app).get('/events');
        expect(response.status).toEqual(200);
    });
});
describe('POST /signup', () => {
    test('Should return sign up was succesful.', async () => {
        const response = await request(app)
        .post('/signup')
        .send( 
            {
            "name": "Prufari11",
            "username": `${test_user}`,
            "password": `${test_password}`
            }         
        );
        expect(response.status).toEqual(200);
    });
});
describe('POST /login', () => {
    test('should return a list of events', async () => {
        const response = await request(app)
        .post('/login')
        .send({
            "username": `${test_user}`,
            "password": `${test_password}`
        });
        expect(response.status).toEqual(200);
        access_token =response.body.access_token;
    });
});
describe('GET /admin/events', () => {
    test('should return a list of events', async () => {
        const response = await request(app)
        .get('/admin/events')
        .set('Authorization', `Bearer ${access_token}`);
        expect(response.status).toEqual(403);
    });
});
