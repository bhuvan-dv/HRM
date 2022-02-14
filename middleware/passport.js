const Localstrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const USERSCHEMA = require("../Model/Auth");
module.exports = passport => {
  passport.use(
    new Localstrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        let user = await USERSCHEMA.findOne({ email: email });
        //checking username
        if (!user) {
          return done(null, false, "User does not exists");
          //1st argument for error handling
          //2nd argument user or false
          //3rd argument is a message
        }
        //match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (!isMatch) {
            return done(null, false, { message: "Password is not match" });
          } else {
            return done(null, user);
          }
        });
      }
    )
  );
  //used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function (id, done) {
    USERSCHEMA.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
