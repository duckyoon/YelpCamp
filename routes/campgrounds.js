const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds');

const multer = require('multer');
// 찾을 파일 입력을 안하면 해당 폴더에서 자동으로 index 파일을 찾는다.
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');


router.route('/')
    .get(catchAsync(campgrounds.index))
    // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))
    .post(upload.array('image'), (req, res) => {
        console.log(req.body, req.files);
        res.send('It works!')
    })

router.route('/new')
    .get(isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground))

router.route('/:id/edit')
    .get(isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))



module.exports = router;