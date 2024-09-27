require("dotenv").config();
const connection      = require("./config/database").connect();
const express         = require("express");
const { graphqlHTTP } = require("express-graphql");
const mongoose        = require("mongoose");
const jwt             = require("jsonwebtoken");
const bcrypt          = require("bcryptjs");
var bodyParser        = require('body-parser');
const User            = require("./models/User");
const schema          = require("./graphql/Schema");
const resolvers       = require("./graphql/Resolvers");

const multer = require('multer');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate user via JWT
function authenticateToken(req, res, next) {
	//console.log('req', req)
	const authHeader = req.headers['authorization'];
	console.log('authHeader', authHeader)
	const token = authHeader && authHeader.split(' ')[1];
    console.log('token', token)
	if (!token) return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided!' });

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ success: false, message: 'Invalid Token!' });
		req.user = user; // Save user info in request
		next();
	});
}

// GraphQL Endpoint with Authentication
/*app.use("/graphql",
	authenticateToken, // Ensure that user is authenticated
	graphqlHTTP({
		schema,
		rootValue: resolvers,
		graphiql: true, // Enable GraphiQL for testing queries
	})
);*/

// GraphQL Endpoint with Authentication
app.use("/graphql",
  (req, res, next) => {
    if (req.headers['authorization']) {
      return authenticateToken(req, res, next);
    }
    next();
  },
  graphqlHTTP((req) => ({
    schema,
    rootValue: resolvers,
    graphiql: true, // Enable GraphiQL for testing queries
  }))
);

// Route to login and generate JWT token
app.post("/login",  multer().any(), async(req, res) => {
	//console.log('req.body', req.body)
	const {email, password} = req.body;
    const user = await User.findOne({email: email});
	//console.log('user', user)
	if(user){
		if (await bcrypt.compare(password, user.password)) {
			const token = jwt.sign({ user_id: user._id, email: email },	JWT_SECRET, { expiresIn: "30d" });
			return res.status(200).json({ success: true, token: token, user: user });
		}else{
			return res.status(403).json({ success: false, message: "Password does not match." });
		}
	}else{
		return res.status(403).json({ success: false,  message: "User not found." });
	}
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000/");
});