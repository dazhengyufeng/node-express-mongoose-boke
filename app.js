// modules
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

// swagger1
const swaggerUi = require('swagger-ui-express')
const swaggerJSDoc = require('swagger-jsdoc')

// import 等语法要用到 babel 支持
require('babel-register');

const app = express();
const expressSwagger = require('express-swagger-generator')(app);

// swagger2
// 配置 swagger-jsdoc
let options = {
    swaggerDefinition: {
        info: {
            description: 'This is a sample server',
            title: 'Swagger',
            version: '1.0.0',
        },
        host: 'localhost:3000',
        basePath: '/',
        produces: [
            "application/json",
            "application/xml"
        ],
        schemes: ['http', 'https'],
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: "",
            }
        }
    },
    route: {
        url:'/swagger',
        docs:'/swagger.json',    //swagger文件 api
    },
    basedir: __dirname, //app absolute path
    files: ['./routes/*.js'] //Path to the API handle folder
};
expressSwagger(options)
// swagger3
// const swaggerSpec = swaggerJSDoc(options)
// 开放 swagger 相关接口，
// app.get('/swagger.json', function(req, res) {
//    res.setHeader('Content-Type', 'application/json');
//    res.send(swaggerSpec);
// });
// 使用 swaggerSpec 生成 swagger 文档页面，并开放在指定路由
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser('blog_node_cookie'));
app.use(
	session({
		secret: 'blog_node_cookie',
		name: 'session_id', //# 在浏览器中生成cookie的名称key，默认是connect.sid
		resave: true,
		saveUninitialized: true,
		cookie: { maxAge: 60 * 1000 * 30, httpOnly: true }, //过期时间
	}),
);

const mongodb = require('./core/mongodb');

// data server
mongodb.connect();

//将路由文件引入
const route = require('./routes/index');

//初始化所有路由
route(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
