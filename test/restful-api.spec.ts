import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { faker } from '@faker-js/faker';
import { SimpleReporter } from '../simple-reporter';

beforeAll(() => {
  pactum.reporter.add(SimpleReporter);
});

afterAll(() => {
  pactum.reporter.end();
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

  it('GET /objects/:id — deve dar um NOT FOUND', async () => {
    await pactum
      .spec()
      .get(`${baseUrl}${endpoint}/lkjgkjgklfdjgkdfgjk`)
      .expectStatus(StatusCodes.NOT_FOUND)
  });

    it('Não deve permitir criar item com preço negativo', async () => {
      const newItem = {
        type: 'book',
        price: -10.0,
        numberinstock: 5
      };
  
      await pactum
        .spec()
        .post(`${baseUrl}/items`)
        .withJson(newItem)
        .expectStatus(StatusCodes.NOT_FOUND);
    });

    it('PUT vazio - Deve retornar NOT_FOUND', async () => {
      await pactum
        .spec()
        .put(`${baseUrl}/items/1`)
        .withJson({})
        .expectStatus(StatusCodes.NOT_FOUND);
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

  it('PATCH /objects/:id — deve atualizar parcialmente o objeto e retornar 200', async () => {
    // cria um objeto primeiro
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

    const partialUpdate = {
      data: {
        price: faker.number.float({ min: 100, max: 1000, fractionDigits: 2 })
      }
    };

    await pactum
      .spec()
      .patch(`${baseUrl}${endpoint}/${created.body.id}`)
      .withJson(partialUpdate)
      .expectStatus(StatusCodes.OK);

    // valida se o preço foi atualizado parcialmente
    await pactum
      .spec()
      .get(`${baseUrl}${endpoint}/${created.body.id}`)
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        id: created.body.id,
        data: {
          price: partialUpdate.data.price
        }
      });
  });

  it('GET /objects/:id — deve retornar 404 para ID inexistente', async () => {
    const nonExistentId = 'id-que-nao-existe-123';
  
    await pactum
      .spec()
      .get(`${baseUrl}${endpoint}/${nonExistentId}`)
      .expectStatus(StatusCodes.NOT_FOUND);
  });
  

  it('DELETE /objects/:id com id inválido — deve retornar NOT_FOUND', async () => {
    await pactum
      .spec()
      .delete(`${baseUrl}${endpoint}/idinvalido123`)
      .expectStatus(StatusCodes.NOT_FOUND);
  });
});
