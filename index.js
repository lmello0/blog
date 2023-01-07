const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./database/database');
const session = require('express-session');

const categoriesController = require('./categories/categoriesController');
const articlesController = require('./articles/articlesController');
const usersController = require('./user/userController');

const Article = require('./articles/Article');
const Category = require('./categories/Category');


const app = express();
const PORT = 3000;

// view engine
app.set('view engine', 'ejs');

// sessions
app.use(session({
    secret: "qualquercoisa",
    cookie: {
        maxAge: 30000
    }
}));

// body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// static
app.use(express.static('public'));

// database
connection.authenticate()
    .then(() => {
        console.log('Connected to database');
    })
    .catch((error) => {
        console.log(error);
    });

// controllers
app.use('/', categoriesController);
app.use('/', articlesController);
app.use('/', usersController);

app.get('/', (req, res) => {
    Article.findAll({ order: [['id', 'DESC']], limit: 4 }).then(articles => {
        Category.findAll().then(categories => {
            res.render('index', {
                articles: articles,
                categories: categories
            });
        });
    });

});

app.get('/article/:slug', (req, res) => {
    let slug = req.params.slug;

    Article.findOne({
        where: { slug: slug }
    }).then(article => {
        if (article != undefined) {
            Category.findAll().then(categories => {
                res.render('article', {
                    article: article,
                    categories: categories
                });
            });
        } else {
            res.redirect('/');
        }
    }).catch(err => {
        res.redirect('/');
    });
});

app.get('/category/:slug', (req, res) => {
    let slug = req.params.slug;

    Category.findOne({
        where: {
            slug: slug
        },
        include: [{ model: Article }]
    }).then(category => {
        if (category != undefined) {
            Category.findAll().then(categories => {
                res.render('index', { articles: category.articles, categories: categories });
            });
        } else {
            res.redirect('/');
        }
    }).catch(error => {
        res.redirect('/');
    });
});

app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Server online on port ' + PORT);
    }
});
