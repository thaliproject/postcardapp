


/*
* @version  0.0.4
* @author   Lauri Rooden <lauri@rooden.ee>
* @license  MIT License
*/



!function(root, nuls) {
	var crypto = root.crypto || (root.crypto = {})


	function i2s(a) { // integer array to hex string
		for (var i = a.length; i--;) a[i] = ("0000000"+(a[i]>>>0).toString(16)).slice(-8)
		return a.join("")
	}

	function s2i(s) { // string to integer array
		s = unescape(encodeURIComponent(s))
		var len = s.length
		, i = 0
		, bin = []

		while (i < len) {
			bin[i>>2] = s.charCodeAt(i)<<24|s.charCodeAt(i+1)<<16|s.charCodeAt(i+2)<<8|s.charCodeAt(i+3)
			i+=4
		}
		bin.len = len
		return bin
	}


	//** HMAC
	function hmac(hasher, key, txt, raw) {
		var len
		, i = 0
		, ipad = []
		, opad = []

		key = (key.length > 64) ? hasher(key, true) : s2i(key)

		while (i < 16) {
			ipad[i] = key[i]^0x36363636
			opad[i] = key[i++]^0x5c5c5c5c
		}

		if (typeof txt == "string") {
			txt = s2i(txt)
			len = txt.len
		} else len = txt.length * 4
		i = hasher(opad.concat(hasher(ipad.concat(txt), 1, 64 + len)), 1)
		return raw ? i : i2s(i)
	}

	crypto.hmac = function(digest, key, message) {
		var hasher = crypto[digest] || crypto.sha1
		return hmac(hasher, key, message)
	}

	//*/

	/**
	 * A minimum iteration count of 1,000 is recommended. 
	 * For especially critical keys, 
	 * or for very powerful systems 
	 * or systems where user-perceived performance is not critical, 
	 * an iteration count of 10,000,000 may be appropriate.
	 *
	 * PBKDF2 is always used with HMAC, 
	 * which is itself a construction which is built over 
	 * an underlying hash function. 
	 * So when we say "PBKDF2 with SHA-1", 
	 * we actually mean "PBKDF2 with HMAC with SHA-1".
	 */

	//** PBKDF2
	// pbkdf2(sha256, this, salt, count, length || 32)
	// crypto.pbkdf2('secret', 'salt', 4096, 512, 'sha256', function(err, key) {

	crypto.pbkdf2 = crypto.pbkdf2Sync = pbkdf2

	// crypto.pbkdf2('secret', 'salt', 4096, 512, 'sha256', function(err, key) {

	function pbkdf2(secret, salt, count, length, digest, callback) {
		if (typeof digest == "function") {
			callback = digest
			digest = "sha1"
		}
		var hasher = crypto[digest] || crypto.sha1
		count = count || 1000

		var u, ui, i, j, k
		, out = []
		, wlen = length>>2 || 5

		for (k = 1; out.length < wlen; k++) {
			u = ui = hmac(hasher, secret, salt+String.fromCharCode(k >> 24 & 0xF, k >> 16 & 0xF, k >>  8 & 0xF, k  & 0xF), 1)

			for (i = count; --i;) {
				ui = hmac(hasher, secret, ui, 1)
				for (j = ui.length; j--;) u[j] ^= ui[j]
			}

			//out = out.concat(u)
			out.push.apply(out, u)
		}
		out = i2s(out).slice(0, length*2 || 40)
		if (callback) callback(null, out)
		else return out
	}

	//*/


	function sha_init(bin, len) {
		if (typeof bin == "string") {
			bin = s2i(bin)
			len = bin.len
		} else len = len || bin.length<<2

		bin[len>>2] |= 0x80 << (24 - (31 & len<<3))
		return bin.concat(nuls.slice( bin.length & 15 ), [0, len<<3])
	}

	//** sha1
	function l(x, n) { // rotate left
		return (x<<n) | (x>>>(32-n))
	}

	function sha1(data, raw, _len) {
		var a, b, c, d, e, t, j
		, i = 0
		, w = []
		, A = 0x67452301
		, B = 0xefcdab89
		, C = 0x98badcfe
		, D = 0x10325476
		, E = 0xc3d2e1f0
		, bin = sha_init(data, _len)
		, len = bin.length

		while (i < len) {
			w = bin.slice(i, i+=(j=16))
			while (j < 80) w[j++] = l(w[j-4]^w[j-9]^w[j-15]^w[j-17], 1)
			a = A
			b = B
			c = C
			d = D
			e = E
			j = 0
			while (j<80) {
				t = (j<20 ? ((b&c)|(~b&d))+0x5A827999 : j<40 ? (b^c^d)+0x6ED9EBA1 : j<60 ? ((b&c)|(b&d)|(c&d))+0x8F1BBCDC : (b^c^d)+0xCA62C1D6)+l(a,5)+e+w[j++]
				e = d
				d = c
				c = l(b,30)
				b = a
				a = t>>>0
			}
			A += a
			B += b
			C += c
			D += d
			E += e
		}
		t = [A, B, C, D, E]
		return raw ? t : i2s(t)
	}

	crypto.sha1 = sha1
	//*/


	/** HMAC
	//** sha1
	crypto.hmac_sha1 = function(key) {
		return hmac(sha1, key, ""+this)
	}
	//*/

	//** sha256
	var initial_map = [], constants_map = []

	function build_maps() {
		// getFractionalBits
		function a(e) {
			return (e - (e>>>0)) * 0x100000000 | 0
		}

		outer: for (var b = 0, c = 2, d; b < 64; c++) {
			// isPrime
			for (d = 2; d * d <= c; d++) if (c % d === 0) continue outer;
			if (b < 8) initial_map[b] = a(Math.pow(c, .5));
			constants_map[b++] = a(Math.pow(c, 1 / 3));
		}
	}

	function sha256(data, raw, _len) {
		initial_map[0] || build_maps()

		var a, b, c, d, e, f, g, h, t1, t2, j
		, i = 0
		, w = []
		, bin = sha_init(data, _len)
		, A = initial_map[0]
		, B = initial_map[1]
		, C = initial_map[2]
		, D = initial_map[3]
		, E = initial_map[4]
		, F = initial_map[5]
		, G = initial_map[6]
		, H = initial_map[7]
		, len = bin.length
		, K = constants_map


		while (i < len) {
			a = A
			b = B
			c = C
			d = D
			e = E
			f = F
			g = G
			h = H

			j = 0
			while (j < 64) {
				if (j < 16) w[j] = bin[i+j]
				else {
					t1 = w[j-2]
					t2 = w[j-15]
					w[j] = (t1>>>17^t1<<15^t1>>>19^t1<<13^t1>>>10) + w[j-7] + (t2>>>7^t2<<25^t2>>>18^t2<<14^t2>>>3) + w[j-16]
				}

				t1 = w[j] + h + (e>>>6^e<<26^e>>>11^e<<21^e>>>25^e<<7) + ((e&f)^((~e)&g)) + K[j]
				t2 = (a>>>2^a<<30^a>>>13^a<<19^a>>>22^a<<10) + ((a&b)^(a&c)^(b&c))

				h = g
				g = f
				f = e
				e = (d + t1)>>>0
				d = c
				c = b
				b = a
				a = (t1 + t2)>>>0
				j++
			}
			A += a
			B += b
			C += c
			D += d
			E += e
			F += f
			G += g
			H += h
			i+=16
		}
		t = [A, B, C, D, E, F, G, H]
		return raw ? t : i2s(t)
	}

	crypto.sha256 = sha256
	//*/


	/** HMAC
	//** sha256
	crypto.hmac_sha256 = function(key) {
		return hmac(sha256, key, ""+this)
	}
	//*/

}(this, [0,0,0,0,0,0,0,0,0,0,0,0,0,0])


