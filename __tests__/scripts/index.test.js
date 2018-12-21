const app = require('../../app/lib/index')
const request = require('supertest')
const Honeybadger = require('honeybadger')

Honeybadger.notify = jest.fn()

describe('GET wildcard.com', () => {
	test('host is equal to root domain', async () => {
		await request(app)
			.get('/wildcard/test/subdir')
			.set('Host', 'wildcard.com')
			.set('Protocol', 'https')
			.expect(301)
	})
})

describe('GET www.wildcard.com', () => {
	test('no redirect configured', async () => {
		await request(app)
			.get('/')
			.set('Host', 'www.wildcard.com')
			.set('Protocol', 'https')
			.expect(404)
	})
})

describe('GET subdomain.test.com', () => {
	test('Redirect Loop', async () => {
		await request(app)
			.get('/')
			.set('Host', 'subdomain.test.com')
			.set('Protocol', 'https')
			.expect(301)
	})
})

describe('GET loop.com', () => {
	test('Redirect Loop', async () => {
		await request(app)
			.get('/')
			.set('Host', 'loop.com')
			.set('Protocol', 'https')
			.expect(404)
	})
})

describe('GET test.com', () => {
	test('Redirect Loop', async () => {
		await request(app)
			.get('/wildcard/subdir/test/')
			.set('Host', 'test.com')
			.set('Protocol', 'https')
			.expect(301)
	})
})

describe('GET test.com', () => {
	test('Nothing Found', async () => {
		await request(app)
			.get('/test/subdir/test/')
			.set('Host', 'test.com')
			.set('Protocol', 'https')
			.expect(404)
	})
})