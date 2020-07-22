const express = require('express');
const app = express();

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const mongoose = require('mongoose');
const User = require('./models/User');

app.set('view engine', 'ejs');

passport.serializeUser((user, done)=>{
    done(null, user);
});

passport.deserializeUser((user, done)=>{
    done(null, user);
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(new FacebookStrategy({
    clientID: '238195520783068',
    clientSecret: 'bdd8f661dcc5f32784812ed2b2a2d840',
    callbackURL: 'http://localhost:3000/facebook/callback',
    profileFields: ['id', 'displayName', 'email', 'photos']
}, async (accessToken, refreshToken, profile, done) => {
    const userDB = await User.findOne({ facebookId: profile.id });
    if(!userDB){
        const user = new User({
            name: profile.displayName,
            facebookId: profile.id,
            accessToken
        });
        await user.save();
        done(null, user);
    }
    done(null, userDB);
}));

app.get('/', (req, res)=>{
    res.render('index');
});
app.get('/facebook', passport.authenticate('facebook'));
app.get('/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/');
});

mongoose.connect('mongodb://localhost/faceboook-integration',{
    useMongoClient: true
}, (err)=>{
    if(err){
        throw Error('Deu Ruim!');
    }
    app.listen(3000, () => {
        console.log('listening...');
    });
});
