const bcrypt = require('bcrypt');
const password = 'bestlab'; // The password you want to hash
const saltRounds = 10; // Increase this number for a more secure hash

bcrypt.hash(password, saltRounds, function (err, hash) {
	console.log(hash);
});
