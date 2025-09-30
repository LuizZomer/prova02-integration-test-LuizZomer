import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { faker } from '@faker-js/faker';
import { SimpleReporter } from '../simple-reporter';

beforeAll(() => {
  pactum.reporter.add(SimpleReporter);
});

describe('Basic integration tests restful-api.dev /objects', () => {
  const baseUrl = 'https://api.restful-api.dev';
  const endpoint = '/objects';

  it('GET /objects — deve retornar lista', async () => {
    await pactum
      .spec()
      .get(`${baseUrl}${endpoint}`)
      .expectStatus(StatusCodes.OK);
  });

  it('GET /objects/:id — deve retornar o item especifico', async () => {
    const fakeObj = {
      name: faker.commerce.productName(),
      data: {
        color: faker.color.human(),
        price: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 })
      }
    };

    const created = await pactum
      .spec()
      .post(`${baseUrl}${endpoint}`)
      .withJson(fakeObj)
      .expectStatus(StatusCodes.OK)
      .toss();

    await pactum
      .spec()
      .get(`${baseUrl}${endpoint}/${created.body.id}`)
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        id: created.body.id,
        name: created.body.name,
        data: {
          color: created.body.data.color,
          price: created.body.data.price
        }
      });
  });

  it('POST /objects — deve criar objeto e receber 200', async () => {
    const fakeObj = {
      name: faker.commerce.productName(),
      data: {
        color: faker.color.human(),
        price: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 })
      }
    };

    await pactum
      .spec()
      .post(`${baseUrl}${endpoint}`)
      .withJson(fakeObj)
      .expectStatus(StatusCodes.OK);
  });

  it('PUT /objects/:id — deve atualizar objeto e receber 200', async () => {
    const fakeObj = {
      name: faker.commerce.productName(),
      data: {
        color: faker.color.human(),
        price: faker.number.float({ min: 10, max: 500, fractionDigits: 2 })
      }
    };

    const created = await pactum
      .spec()
      .post(`${baseUrl}${endpoint}`)
      .withJson(fakeObj)
      .expectStatus(StatusCodes.OK)
      .toss();

    // atualizar
    const updateObj = {
      name: faker.commerce.productName(),
      data: {
        color: faker.color.human(),
        price: faker.number.float({ min: 500, max: 1000, fractionDigits: 2 })
      }
    };

    await pactum
      .spec()
      .put(`${baseUrl}${endpoint}/${created.body.id}`)
      .withJson(updateObj)
      .expectStatus(StatusCodes.OK);

    // GET para validar
    await pactum
      .spec()
      .get(`${baseUrl}${endpoint}/${created.body.id}`)
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        id: created.body.id,
        name: updateObj.name,
        data: {
          color: updateObj.data.color,
          price: updateObj.data.price
        }
      });
  });

  it('DELETE /objects/:id — deve deletar objeto e receber 204', async () => {
    const fakeObj = {
      name: faker.commerce.productName(),
      data: {
        color: faker.color.human(),
        price: faker.number.float({ min: 10, max: 500, fractionDigits: 2 })
      }
    };

    // criar objeto
    const created = await pactum
      .spec()
      .post(`${baseUrl}${endpoint}`)
      .withJson(fakeObj)
      .expectStatus(StatusCodes.OK)
      .toss();

    // deletar
    await pactum
      .spec()
      .delete(`${baseUrl}${endpoint}/${created.body.id}`)
      .expectStatus(StatusCodes.OK);
  });
});
