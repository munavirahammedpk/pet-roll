var express = require('express');
var router = express.Router();
var Handlebars = require('handlebars');
const { handlebars } = require('hbs');
const path = require('path')
const fs = require('fs');
const adminHelper = require('../models/admin-model');

const verifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}

/* GET users listing. */
router.get('/', verifyLogin, function (req, res, next) {
  Handlebars.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
  })
  let admin = req.session.admin
  adminHelper.getUsers().then((users) => {
    res.render('admin/view-users', { users, admin });
  })
});
router.get('/delete-user/:id', (req, res) => {
  let userId=req.params.id
  adminHelper.deleteUser(userId).then(() => {
    res.redirect('/admin')
  })
})
router.get('/view-pets/:id', async (req, res) => {
  Handlebars.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
  })
  let admin = req.session.admin
  await adminHelper.getPets(req.params.id).then((pets) => {
    res.render('admin/view-pets', { pets, admin })
  })
})
router.get('/delete-pet/:id', (req, res) => {
  let id=req.params.id
  adminHelper.deletePet(req.params.id).then(() => {
    const pathToDir = path.join(__dirname, '../public/pet-images/' + id)
    fs.rmdir(pathToDir, { recursive: true }, (err) => {
      if (err) {
        throw err
      }
    })
    res.redirect('/admin')
  })
})
router.get('/signup', (req, res) => {
  res.render('admin/signup')
})
router.post('/signup', (req, res) => {
  //console.log(req.body)
  adminHelper.doSignUp(req.body).then((response) => {
    if (response.status) {
      req.session.loggedadmin = true
      req.session.admin = response.admin
    }
    res.redirect('/admin')
  })
})
router.get('/login', (req, res) => {
  if (req.session.admin) {
    res.redirect('/admin')

  } else {
    res.render('admin/login', { error: req.session.logginErr })
    req.session.logginErr = false
  }
})
router.post('/login', (req, res) => {
  adminHelper.doLogin(req.body).then((response) => {
    //console.log(response);
    if (response.status) {
      req.session.loggedIn = true
      req.session.admin = response.admin

      res.redirect('/admin')
    } else {
      req.session.logginErr = true
      res.redirect('/admin/login')
    }
  })
  //console.log(req.body);
})
router.get('/logout', (req, res) => {
  req.session.admin = null
  res.redirect('/admin')
})


module.exports = router;
