const express = require("express");
const router = express.Router();
const User = require("../models/User"); //importing user model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
router.get("/", auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password"); //finds the id from mongodb corresponding that particular user whose id is stored in req after authenticting by token in middleware
		res.json(user);
	} catch (err) {
		console.error(err);
		res.send(500).send("Server error");
	}
});

router.post(
	"/",
	[
		check("email", "Please Enter Valid Email").isEmail(), //validating the fields
		check("password", "Please Enter Valid Password").exists(),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body; //taking the fields from the body

		try {
			//await is using instead of promises of .then and we always use async with await
			let user = await User.findOne({ email: email }); //checking if there is another user with same email, findOne is a method of mongodb

			if (!user) {
				//if there is no user for that particular email id
				return res.status(400).json({ msg: "Invalid Credentials" }); //return status 400 with a json message
			}

			const isMatch = await bcrypt.compare(password, user.password); //now taking the password and matching it from stored password

			if (!isMatch) {
				return res.status(400).json({ msg: "Password Don't Match" });
			}
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
