const express = require("express");
const router = express.Router();
const User = require("../models/User"); //importing user model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

router.post(
	"/",
	[
		//using expressvalidator to validate the fields
		check("name", "Pleae add name").not().isEmpty(),
		check("email", "please include a valid email").isEmail(),
		check(
			"password",
			"please enter a password with 6 or more characters"
		).isLength({ min: 6 }),
	],

	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			//validating the fields
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body; //taking the fields from the body

		try {
			//await is using instead of promises of .then and we always use async with await
			let user = await User.findOne({ email: email }); //checking if there is another user with same email, findOne is a method of mongodb

			if (user) {
				//if there is a user that exists
				return res.status(400).json({ msg: "User already exists" }); //return status 400 with a json message
			}

			user = new User({
				//otherwise create a new user (this is a method of mongodb)
				name: name,
				email: email,
				password: password,
			});

			const salt = await bcrypt.genSalt(10); //generating salt means telling bcrypt how strong our hashing should be
			user.password = await bcrypt.hash(password, salt); //now taking the password and hashing it
			await user.save(); //saving the new user created

			const payload = {
				//creating payload ie what jwt token should have in header
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				config.get("jwtSecret"),
				{
					expiresIn: 360000,
				},
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send("Server Error");
		}
	}
);

module.exports = router;
