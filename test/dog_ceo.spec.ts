import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Dog CEO API', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://dog.ceo/api';

  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('Imagens aleatórias', () => {
    it('GET /breeds/image/random deve retornar uma imagem aleatória com status de sucesso', async () => {
      await p
        .spec()
        .get(`${baseUrl}/breeds/image/random`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ status: 'success' })
        .expectJsonSchema({
          type: 'object',
          properties: {
            message: { type: 'string' },
            status: { type: 'string' }
          },
          required: ['message', 'status']
        })
        .expectBodyContains('https://images.dog.ceo');
    });

    it('GET /breeds/image/random/3 deve retornar exatamente 3 imagens aleatórias', async () => {
      await p
        .spec()
        .get(`${baseUrl}/breeds/image/random/3`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ status: 'success' })
        .expectJsonLength('message', 3);
    });

    it('GET /breeds/image/random deve responder dentro do tempo aceitável', async () => {
      await p
        .spec()
        .get(`${baseUrl}/breeds/image/random`)
        .expectStatus(StatusCodes.OK)
        .expectResponseTime(3000);
    });

    it('GET /breeds/image/random deve retornar o header content-type como JSON', async () => {
      await p
        .spec()
        .get(`${baseUrl}/breeds/image/random`)
        .expectStatus(StatusCodes.OK)
        .expectHeaderContains('content-type', 'application/json');
    });
  });

  describe('Imagens por raça', () => {
    it('GET /breed/hound/images deve retornar todas as imagens da raça hound', async () => {
      await p
        .spec()
        .get(`${baseUrl}/breed/hound/images`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ status: 'success' })
        .expectBodyContains('hound');
    });

    it('GET /breed/{breed}/images/random deve retornar uma imagem aleatória usando withPathParams', async () => {
      await p
        .spec()
        .get(`${baseUrl}/breed/{breed}/images/random`)
        .withPathParams('breed', 'hound')
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ status: 'success' })
        .expectBodyContains('hound');
    });

    it('GET /breed/hound/list deve retornar todas as sub-raças do hound', async () => {
      await p
        .spec()
        .get(`${baseUrl}/breed/hound/list`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          status: 'success',
          message: [
            'afghan',
            'basset',
            'blood',
            'english',
            'ibizan',
            'plott',
            'walker'
          ]
        });
    });

    it('GET /breed/invalidbreedxyz/images deve retornar 404 para uma raça inexistente', async () => {
      await p
        .spec()
        .get(`${baseUrl}/breed/invalidbreedxyz/images`)
        .expectStatus(StatusCodes.NOT_FOUND)
        .expectJsonLike({ status: 'error', code: 404 })
        .expectBodyContains('Breed not found');
    });
  });

  describe('Lista de raças', () => {
    it('GET /breeds/list/all deve retornar a lista completa de raças incluindo a hound', async () => {
      await p
        .spec()
        .get(`${baseUrl}/breeds/list/all`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ status: 'success' })
        .expectBodyContains('hound');
    });

    it('Deve reutilizar uma raça retornada na listagem para validar suas imagens', async () => {
      const racasDisponiveis = await p
        .spec()
        .get(`${baseUrl}/breeds/list/all`)
        .expectStatus(StatusCodes.OK)
        .returns('message');

      const racaValida = Object.keys(racasDisponiveis)[0];

      await p
        .spec()
        .get(`${baseUrl}/breed/${racaValida}/images`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ status: 'success' });
    });
  });
});
