const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
	const token = req.header("x-auth-token"); //we send the token that is saved in our local storage when we authenticate and when we have to hit any  endpoint we send that particular jwt saved in local storage so that server can know which particular user is using that application from the id of that jwt and the

	if (!token) {
		return res.status(401).json({ msg: "No token,authorization denied" });
	}

	try {
		const decoded = jwt.verify(token, config.get("jwtSecret")); //returns header of jwt
		req.user = decoded.user; //we get the user of that particular user id
		next();
	} catch (err) {
		res.status(401).json({ msg: "token is not valid" });
	}
};
