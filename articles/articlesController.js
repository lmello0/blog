const express = require('express');
const router = express.Router();
const Category = require('../categories/Category');
const Article = require('./Article');
const slugify = require('slugify');
const adminAuth = require('../middlewares/adminAuth');

router.get('/admin/articles', adminAuth, (req, res) => {
    Article.findAll({
        include: [{ model: Category }]
    }).then(articles => {
        res.render('admin/articles/index', { articles: articles });
    });

});

router.get('/admin/articles/new', adminAuth, (req, res) => {
    Category.findAll().then(categories => {
        res.render('admin/articles/new', { categories: categories });
    })
});

router.post('/articles/save', (req, res) => {
    let title = req.body.title;
    let body = req.body.body;
    let category = req.body.category;

    Article.create({
        title: title,
        slug: slugify(title, { lower: true }),
        body: body,
        categoryId: category
    }).then(() => {
        res.redirect('/admin/articles');
    });
});

router.post('/articles/delete', (req, res) => {
    let id = req.body.id;

    if (id != '') {
        if (!isNaN(id)) {
            Article.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect('/admin/articles');
            });
        } else {
            res.redirect('/admin/articles');
        }
    } else {
        res.redirect('/admin/articles');
    }
});

router.get('/admin/article/edit/:id', adminAuth, (req, res) => {
    let id = req.params.id;

    if (isNaN(id)) {
        res.redirect('/admin/articles');
    } else {
        Article.findByPk(id).then(article => {
            if (article != undefined) {
                Category.findAll().then(categories => {
                    res.render('admin/articles/edit', { article: article, categories: categories });
                });

            } else {
                res.redirect('/admin/articles');
            }
        }).catch(error => {
            res.redirect('/admin/articles');
        });
    }
});

router.post('/article/update', (req, res) => {
    let id = req.body.id;
    let title = req.body.title;
    let body = req.body.body;
    let category = req.body.category;

    Article.update({
        title: title,
        slug: slugify(title, { lower: true }),
        body: body,
        categoryId: category
    }, {
        where: {
            id: id
        }
    }).then(() => {
        res.redirect('/admin/articles');
    }).catch((error) => {
        res.redirect('/admin/articles');
    })
});

router.get('/articles/page/:num', (req, res) => {
    let page = parseInt(req.params.num);
    let offset;
    let totalElements = 4;

    if (isNaN(page) || page == 1) {
        offset = 0;
    } else {
        offset = (page - 1) * totalElements;
    }

    Article.findAndCountAll({
        limit: totalElements,
        offset: offset,
        order: [['id', 'DESC']]
    }).then(articles => {
        let next = true;
        
        if (offset + 4 >= articles.count) {
            next = false
        }

        let result = {
            page: page,
            next: next,
            articles: articles
        }

        Category.findAll().then(categories => {
            res.render('admin/articles/page', { result: result, categories: categories});
        });
    }).catch();
});

module.exports = router;