process.chdir( process.argv[1].replace(/[^/]+$/, "") )

var crypto = require("../").crypto

crypto.DEFAULT_ENCODING = "hex"

require("testman").
describe("crypto-lite").
	it ("should hash sha1", {skip:"manual"}).
		ok(function(){
		equal(crypto.sha1("abc") , "a9993e364706816aba3e25717850c26c9cd0d89d").
		equal(crypto.sha1("abc1ö") , "ed9006416a835d01c054c9272c52a1885571a9fc").
		equal(crypto.sha1("kkkkkkkkkkkkkkkkkkkkkkkkk") , "005cb6065579bb259bdc966dcc3d800b4c0e631b").
		equal(crypto.sha1("efgfsfgjfkdslkeföl") , "3228c5ff9b3f008816452fd2c55b6063abfcebf3").

	it ("should hash sha256", {skip:1}).
		equal(crypto.sha256("abc") , "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad").
		equal(crypto.sha256("abc1ö") , "555944eb51d8305f11989edc037c0a0fa9999b470c327b3940377fd2c6507ab3")
		}).

	it ("should have hmac").
		equal(crypto.hmac("sha1", "w", "q") , "697e084de5f14b207f78bd51e748fdd625e5d4e3").
		equal(crypto.hmac("sha1", "w23e", "8d48be98c11eb482f08afbce6d1902b0f0c028f987d58a595fd7fbf365a3dcc95") , "d2308ef241f9163aa65105959600f870f8c0e60b").

		equal(crypto.hmac("sha256", "w", "q") , "aa0faac9b60e5d328675f33221327654ad791e2935a4ae12e94c1ac939afdf22").
		equal(crypto.hmac("sha256", "w23e", "8d48be98c11eb482f08afbce6d1902b0f0c028f987d58a595fd7fbf365a3dcc95") , "1769221eb6c4f6e52bed133c64d1ba118ef72bfaf91b39f065e0aa43a4788031").

	it ("should hash pbkdf2 with sha1").
		equal(crypto.pbkdf2Sync("password", "salt", 1, 20) , "0c60c80f961f0e71f3a9b524af6012062fe037a6").
		equal(crypto.pbkdf2Sync("password", "salt", 2, 20) , "ea6c014dc72d6f8ccd1ed92ace1d41f0d8de8957").
		equal(crypto.pbkdf2Sync("password", "salt", 1, 20, "sha1") , "0c60c80f961f0e71f3a9b524af6012062fe037a6").
		equal(crypto.pbkdf2Sync("password", "salt", 2, 20, "sha1") , "ea6c014dc72d6f8ccd1ed92ace1d41f0d8de8957").
		equal(crypto.pbkdf2Sync("password", "salt", 1, 32, "sha256") , "120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b").
		equal(crypto.pbkdf2Sync("password", "salt", 2, 32, "sha256") , "ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43").
done()

