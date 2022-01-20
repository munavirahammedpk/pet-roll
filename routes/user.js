var express = require('express');
var router = express.Router();
var petsHelpers = require('../helpers/pets-helpers');
var buyerHelpers = require('../helpers/buyer-helpers');
var sellerHelpers = require('../helpers/seller-helpers');
const { response } = require('express');
const fs = require('fs');
const path = require('path');
var Handlebars = require('handlebars');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
//const Mailgun = require('mailgun-js');
//const formData = require('form-data');
//const API_KEY = '25ef8385f3bddb172a010fb21b868ae6-76f111c4-b0f908b6';

//const DOMAIN = 'sandboxbe50611d25664584b65883ca6bc8f2f0.mailgun.org';
//const mg = Mailgun({ apiKey: API_KEY, domain: DOMAIN });
//const { getMaxListeners } = require('process');
const jwt_secret = 'some super secret...'

const verifyLogin = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
}

function isImage() {
  Handlebars.registerHelper("ifSecond", function (value, options) {
    //console.log(value);
    let path = './public/pet-images/' + value + '/' + value + 1 + '.jpg'
    //console.log(path);
    if (fs.existsSync(path)) {
      //console.log('exist');
      return true
    } else {
      return false
      //console.log('not');
    }
    //return value+'/2';
  })
  Handlebars.registerHelper("ifThird", function (value, options) {
    //console.log(value);
    let path = './public/pet-images/' + value + '/' + value + 2 + '.jpg'
    //console.log(path);
    if (fs.existsSync(path)) {
      //console.log('exist');
      return true
    } else {
      return false
      //console.log('not');
    }
    //return value+'/2';
  })
  Handlebars.registerHelper("ifFourth", function (value, options) {
    //console.log(value);
    let path = './public/pet-images/' + value + '/' + value + 3 + '.jpg'
    //console.log(path);
    if (fs.existsSync(path)) {

      return true
    } else {
      return false

    }

  })

}



/* GET home page. */
router.get('/', async (req, res, next) => {
  var user = req.session.user

  isImage()

  petsHelpers.getAllPets().then((pets) => {

    //console.log(favitems);
    // console.log(user);
    res.render('buyer/view-pets', { pets, user, home: true })
  })
});

router.get('/seller', verifyLogin, (req, res) => {
  let user = req.session.user
  res.render('seller/add-pets', { user })
})
router.post('/add-pets', (req, res) => {
  petsHelpers.addPets(req.body).then((id) => {

    //sellerHelpers.addToDashboard()

    let image0 = req.files.image0
    let image1 = req.files.image1
    let image2 = req.files.image2
    let image3 = req.files.image3

    fs.mkdir(path.join(__dirname, '../public/pet-images/' + id + '/'), {}, err => {
      if (err) throw err;
      console.log('file created...');

    })
    console.log(req.body.userid);
    image0.mv('./public/pet-images/' + id + '/' + id + 0 + '.jpg')

    if (image1) {
      image1.mv('./public/pet-images/' + id + '/' + id + 1 + '.jpg')
    }
    if (image2) {
      image2.mv('./public/pet-images/' + id + '/' + id + 2 + '.jpg')
    }
    if (image3) {
      image3.mv('./public/pet-images/' + id + '/' + id + 3 + '.jpg')
    }
    sellerHelpers.addToDashboard(req.session.user._id, id)


    res.render('seller/add-pets')



  })
})
router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')

  } else {
    res.render('buyer/login', { error: req.session.logginErr })
    req.session.logginErr = false
  }

})
router.get('/signup', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {
    res.render('buyer/signup', { error: req.session.logginErr })
    req.session.logginErr = false
  }
})
router.post('/signup', (req, res) => {
  buyerHelpers.doSignUp(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.logginErr = true
      res.redirect('/signup')
    }
  })
})
router.post('/login', (req, res) => {
  //console.log(req.body.email);
  buyerHelpers.doLogin(req.body).then((response) => {
    // console.log(response);
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user

      res.redirect('/')
    } else {
      req.session.logginErr = true
      res.redirect('/login')
    }
  })

})
router.get('/logout', (req, res) => {
  req.session.user = null
  res.redirect('/')
})
router.get('/more/:id', (req, res) => {
  isImage()
  Handlebars.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
  })
  buyerHelpers.getDetails(req.params.id).then((details) => {
    buyerHelpers.getOwnerId(req.params.id).then((id) => {
      //console.log(id);
      buyerHelpers.getOtherPets(id).then((others) => {
        let user = req.session.user
        res.render('buyer/more', { details, user, others })
      })

    })

  })

})
router.get('/animal/:category', async (req, res) => {
  //console.log(req.params.category);
  isImage()
  let details = await petsHelpers.Animal(req.params.category)
  //console.log(dog);
  let user = req.session.user
  res.render('buyer/category', { details, user, buyer: true })
})
router.get('/dashboard', verifyLogin, (req, res) => {
  //console.log(req.session.user._id);
  let user = req.session.user
  sellerHelpers.getDashboard(req.session.user._id).then((details) => {
    //console.log(details.status);
    if (details) {
      res.render('seller/view-dashboard', { details, user })
    }
  })

})
router.get('/edit-pet/:id', async (req, res) => {
  let details = await petsHelpers.getPetDetails(req.params.id)
  //console.log(details);
  isImage()
  let user = req.session.user
  res.render('seller/edit-pets', { details, user })
})
router.post('/edit-pet/:id', (req, res) => {
  // console.log(req.body);
  petsHelpers.updatePet(req.params.id, req.body).then(() => {
    res.redirect('/dashboard')
    let id = req.params.id
    let image0 = req.files.image0
    let image1 = req.files.image1
    let image2 = req.files.image2
    let image3 = req.files.image3
    if (image0) {
      image0.mv('./public/pet-images/' + id + '/' + id + 0 + '.jpg')
    }
    if (image1) {
      image1.mv('./public/pet-images/' + id + '/' + id + 1 + '.jpg')
    }
    if (image2) {
      image2.mv('./public/pet-images/' + id + '/' + id + 2 + '.jpg')
    }
    if (image3) {
      image3.mv('./public/pet-images/' + id + '/' + id + 3 + '.jpg')
    }

  })
})
router.get('/delete-pet/:id', (req, res) => {
  //console.log(req.params.id);
  var id = req.params.id
  petsHelpers.deletePet(req.params.id).then(() => {
    const pathToDir = path.join(__dirname, '../public/pet-images/' + id)
    fs.rmdir(pathToDir, { recursive: true }, (err) => {
      if (err) {
        throw err
      }
    })
    res.redirect('/dashboard')
  })
})
router.get('/add-favourite/:id', (req, res) => {
  // console.log(req.params.id);
  buyerHelpers.addToFavourite(req.params.id, req.session.user._id).then((response) => {
    //console.log(response.status);
    if (response.status) {
      res.json({ status: true })
    }
  })
})
router.get('/delete-favourite/:id', (req, res) => {
  buyerHelpers.deleteFav(req.params.id, req.session.user._id).then((response) => {
    if (response.status) {
      //console.log(response.status);
      res.json({ status: true })
    }
  })
})
router.get('/favourite', verifyLogin, (req, res) => {
  let user = req.session.user
  buyerHelpers.getFavourite(req.session.user._id).then((details) => {

    res.render('buyer/favourites', { details, user })


  })
})
router.get('/search', async (req, res) => {
  isImage()
  let searched = await petsHelpers.searched(req.query.search)
  res.render('buyer/searched', { searched, buyer: true })
})
router.post('/getPets', async (req, res) => {
  let payload = req.body.payload
  let search = await petsHelpers.searchPet(payload)
  res.json({ payload: search })
})
router.get('/addToFav', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user._id })
  } else {
    res.json({ user: false })
  }
})
router.get('/forgot', (req, res) => {
  res.render('buyer/forgot')
})
router.post('/forgot', (req, res) => {
  //console.log(req.body.email);
  buyerHelpers.emailExist(req.body.email).then((response) => {
    //console.log(response); 
    //console.log('hiiiiiiii');
  if (response !== null) {
    console.log(response.password);
    const secret = jwt_secret + response.password
    const payload = {
      email: response.email,
      id: response._id
    }
    const token = jwt.sign(payload, secret, { expiresIn: '15m' })
    const link = 'http://localhost:7000/rest-password/' + response._id + '/' + token
    console.log(link);
    //console.log(response.email);

  const data = {
    from: 'PetsBay<mnvrahmd786@gmail.com>',
    to: response.email,
    subject: 'Reset Password Link',
    html:'<p>Reset Your Password...</p><a style="font-size:25px" href='+link+'>Click here</a><p> Valid for 10 Minutes</p>'
  };

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    // true for 465, false for other ports
    auth: {
      user: 'mnvrahmd786@gmail.com', // generated ethereal user
      pass: '8078745821', // generated ethereal password
    },
  });
  transporter.sendMail(data, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent..' + info);
    }
  })
  res.render('buyer/send-message')
 } else {
   res.render('buyer/no-user')
 }
  })
})
router.get('/rest-password/:id/:token', (req, res) => {
  const { id, token } = req.params
  buyerHelpers.checkIdExist(id).then((response) => {
    console.log(response.password);
    const secret = jwt_secret + response.password
    try {
      const payload = jwt.verify(token, secret)

      res.render('buyer/reset-pass', { email: response.email })
    } catch (error) {
      console.log(error.message);
    }
  })
})
router.post('/rest-password/:id/:token', (req, res) => {
  const { id, token } = req.params
  buyerHelpers.restPassword(req.body.newpass,id).then(()=>{
    res.redirect('/login')
  })
})

module.exports = router;

