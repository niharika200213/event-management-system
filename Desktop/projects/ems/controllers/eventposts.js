const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/events');
const User = require('../models/user');

exports.createPosts = (req,res,next) => {
    
};