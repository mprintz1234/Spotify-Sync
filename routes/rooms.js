var express = require('express');
var router = express.Router();

/* GET rooms listing. */
router.get('/:id', function(req, res, next) {
    const { id } = req.params
    res.render('rooms', { title: `${id}` });
});

module.exports = router;
