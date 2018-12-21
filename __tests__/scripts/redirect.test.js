const redirect = require('../../app/lib/redirect')

const multipleDesitnations = {
	domain: 'forward.com',
	redirects: [
		{
			path: '/test/sub/dir',
			destination: 'www.test.com/stuff',
			secure_destination: true,
			wildcard: false
		},
		{
			path: '/test/sub/dir',
			destination: 'www.test.com/stuff',
			secure_destination: false,
			wildcard: false
		}
	]
}

const secureDestination = {
	domain: 'forward.com',
	redirects: [
		{
			path: '/test/sub/dir',
			destination: 'www.test.com/stuff',
			wildcard: false
		}
	]
}

const forward = {
	domain: 'forward.com',
	redirects: []
}

test('redirects are longer than one', () => {
	expect(() => {
		redirect.format(multipleDesitnations.redirects)
	}).toThrow(
		new Error(
			`Found an invalid number of redirects, count: ${
				multipleDesitnations.redirects.length
			}`
		)
	)
})
test('Secure and single desitnation', () => {
	secureDestination.redirects[0].secure_destination = true
	let redirects = redirect.format(secureDestination.redirects)
	expect(redirects).toEqual({ destination: 'https://www.test.com/stuff' })
})

test('Non-Secure and single desitnation', () => {
	secureDestination.redirects[0].secure_destination = false
	let redirects = redirect.format(secureDestination.redirects)
	expect(redirects).toEqual({ destination: 'http://www.test.com/stuff' })
})

test('No Redirects', () => {
	expect(() => {
		redirect.format(forward.redirects)
	}).toThrow(
		`Found an invalid number of redirects, count: ${forward.redirects}`
	)
})

test('http to https', async () => {
	let redirects = await redirect.get('nonsecure.com', '/secure')
	expect(redirects).toEqual({ destination: 'https://www.secure.com' })
})

test('http to http', async () => {
	let redirects = await redirect.get('nonsecure.com', '/nonsecure')
	expect(redirects).toEqual({ destination: 'http://www.nonsecure.com' })
})

test('https to http', async () => {
	let redirects = await redirect.get('secure.com', '/nonsecure')
	expect(redirects).toEqual({ destination: 'http://www.nonsecure.com' })
})

test('https to https', async () => {
	let redirects = await redirect.get('secure.com', '/secure')
	expect(redirects).toEqual({ destination: 'https://www.secure.com' })
})

test('Domain is in database more than once', async () => {
	try {
		await redirect.get('domain.com', '/secure')
	} catch (e) {
		expect(e).toEqual(new Error('multiple domains have been found'))
	}
})

test('Wildcard', async () => {
	let redirects = await redirect.get('wildcard.com', '/wildcard/test/subdir')
	expect(redirects).toEqual({
		destination: 'https://www.wildcard.com/wildcard/subdir'
	})
})

test('forward', async () => {
	let redirects = await redirect.get('forward.com', '/forward/test/subdir')
	expect(redirects).toEqual({
		destination: 'http://www.forward.com/forward/test/subdir'
	})
})
