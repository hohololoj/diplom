'use strict'
import express, { json, response } from 'express';
import path, { resolve } from 'path';
import multiparty from 'multiparty';
import { MongoClient } from 'mongodb';
import {ObjectId} from 'mongodb';
import fs from 'fs';
import cookieParser from 'cookie-parser';

const __dirname = path.resolve();
const ip = "127.0.0.1";
const port =  process.env.PORT || 8000
const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.disable('x-powered-by');
app.use(cookieParser('S3uWv@'))
app.use(express.static(path.resolve('public')));

async function mongoRequest(dbName, collectionName, requestType, range, request){
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db(dbName);
        let collection;
        if(requestType != 'checkForExistence'){
            collection = db.collection(collectionName);
        }
        switch(requestType){
            case 'get':{
                if(range == 'one'){
                    let response = await collection.findOne(request);
                    return response;
                }
                if(range == 'many'){
                    let response = await collection.find(request).toArray();
                    return response;
                }
                break;
            }
            case 'put':{
                if(range == 'one'){
                    await collection.insertOne(request);
                    return true;
                }
                if(range == 'many'){
                    await collection.insertMany(request);
                    return true;
                }
                break;
            }
            case 'update':{
                collection.updateOne(request.condition, {
                    $set: request.toUpdate
                })
                break;
            }
            case 'delete':{
                collection.deleteOne(request);
                break;
            }
        }
    } 
    catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

function app_start(){
    try{
        app.listen(port, ip, function(){
            console.log(`Server Running at ${ip}:${port}`);
        })
    }
    catch(e){
        console.log(e);
    }
}

async function generateUniqueId(){
    return new Date().getTime();
}

async function addNewDish(thisDish){
    return new Promise((resolve, reject) => {
        mongoRequest('diplom', 'dishes', 'put', 'one', thisDish);
        resolve();
    })
}

async function saveImage(from, to){
    fs.rename(from, to, function (err) {
        if (err) {
            console.log(err);
        }
    })
}

async function getDishes(res){
    new Promise((resolve, reject)=>{
        let dishes = mongoRequest('diplom', 'dishes', 'get', 'many', {});
        resolve(dishes)
    })
    .then((dishes) => {
        let dishes_response = {
            soups: [],
            mains: [],
            garnish: [],
            salads: [],
            drinks: [],
            bakery: [],
            beers: [],
            snacks: []
        }
        for(let i = 0; i < dishes.length; i++){
            dishes_response[dishes[i].category].push({
                name: dishes[i].name,
                price: dishes[i].price,
                dish_id: dishes[i].dish_id,
                img_path: dishes[i].img_path
            })
        }
        res.send(dishes_response);
    })
}
app.get('/admin', function(req, res){
    console.log(req.path)
    let token = req.signedCookies.token;
    if(token == undefined){
        console.log('токен не найден')
        res.redirect(301, '/404');
        return 0;
    }
    new Promise((resolve, reject) => {
        let admin = mongoRequest('diplom', 'users', 'get', 'one', {token: token});
        resolve(admin)
    })
    .then((admin)=>{
        if(admin != null){
            if(admin.login == 'admin'){
                console.log('логин admin')
                res.sendFile(path.resolve('./public/admin.html'));
            }
            else{
                console.log('логин не admin')
                res.sendFile(path.resolve('./public/404.html'));
            }
        }
        else{
            console.log('admin == null')
            res.sendFile(path.resolve('./public/404.html'));
        }
    })
})
app.get('*', function(req, res, next){
    // console.log(req.path)
    switch(req.path){
        case '/':{
            if(req.query.action == 'logout'){
                const cookies = req.signedCookies;
                for (const cookieName in cookies) {
                    res.clearCookie(cookieName);
                }
                res.redirect('/')
            }
            else{
                res.sendFile(path.resolve('./public/index.html'));
            }
            break;
        }
        case '/menu':{
            console.log('menu')
            res.sendFile(path.resolve('./public/menu.html'));
            break;
        }
        case '/fullnews':{
            res.sendFile(path.resolve('./public/fullnews.html'));
            break;
        }
        case '/account':{
            if(req.signedCookies.admin != undefined){
                let token = req.signedCookies.token;
                new Promise((resolve, reject) => {
                    let admin = mongoRequest('diplom', 'users', 'get', 'one', {token: token});
                    resolve(admin)
                })
                .then((admin)=>{
                    if(admin != null){
                        if(admin.login == 'admin'){
                            res.redirect('/admin');
                        }
                        else{
                            res.sendFile(path.resolve('./public/404.html'));
                        }
                    }
                    else{
                        res.sendFile(path.resolve('./public/404.html'));
                    }
                })
            }
            else{
                res.sendFile(path.resolve('./public/account.html'));
            }
            break;
        }
        // case '/admin/':{
            
        //     break;
        // }
        case '/logout':{
            res.clearCookie('admin').clearCookie('token');
        }
        case '/404':{
            res.sendFile(path.resolve('./public/404.html'));
            break;
        }
        // default:{
        //     res.sendFile(path.resolve('./public/404.html'));
        // }
    }
})

function generate_token(length) {
    var a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
    var b = [];
    for (var i = 0; i < length; i++) {
        var j = (Math.random() * (a.length - 1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join('');
}

async function checkToken(token){
    return new Promise((resolve, reject) => {
        let response = mongoRequest('diplom', 'users', 'get', 'one', {token: token});
        console.log("токен проверяется")
        resolve(response)
    })
}

async function getToken(length){
    return new Promise((resolve, reject) => {
        let token = generate_token(length);
        checkToken(token).then((response) => {
            if(response == null){resolve(token)}
            else{
                getToken(length);
            }
        })
    })
}

async function logAdmin(res, thisUser){
    let admin = await mongoRequest('diplom', 'users', 'get', 'one', {login: thisUser.login, password: thisUser.password});
    if(admin != null){
        console.log('asd')
        let token = generate_token(32);
        new Promise((resolve, reject) => {
            mongoRequest('diplom', 'users', 'update', '', {condition: {login: 'admin'}, toUpdate: {token: token}});
        })
        res.cookie('token', token, {signed: true, maxAge: 99999999999999}).cookie('admin', {}, {signed: true, maxAge: 99999999999999}).redirect(301,'/admin');
    }
}

async function writeTable(table, res){
    new Promise((resolve, reject) => {
        mongoRequest('diplom', 'tables', 'put', 'one', table)
        resolve()
    })
    .then(()=>{
        res.send({status: 'success', table: table.number, time: table.time, day: `${table.day}.${table.month}`});
    })
}

app.post('*', function(req, res){
    let action = req.query.action;
    switch(action){
        case 'dish':{
            let form = new multiparty.Form();
            form.parse(req, function (err, fields, files) {
                if (err) {
                    console.log(err);
                }
                if(fields.dish_id[0] == ''){
                    let image_path;
                    let image_extname;
                    if(files.image[0].originalFilename != ''){
                        image_path = files.image[0].path;
                        image_extname = files.image[0].originalFilename.split('.').pop();
                    }
                    let generateId_promise = new Promise((resolve, reject) => {
                        let id = generateUniqueId()
                        resolve(id);
                    })
                    generateId_promise.then((id) => {
                        let path = '/public/dishes/' + id + '.' + image_extname;
                        let thisDish = {
                            dish_id: id,
                            name: fields.name[0],
                            price: fields.price[0],
                            img_path: path,
                            category: fields.category[0]
                        }
                        let saveImage_promise = new Promise((resolve, reject) => {
                            saveImage(image_path, (__dirname + path));
                            resolve();
                        })
                        let writeDish_promise = addNewDish(thisDish);
                        Promise.all([saveImage_promise, writeDish_promise])
                        .then((results) => {
                            console.log(results[0])
                            console.log(results[1])
                            res.send({dish_id: id});
                        })
                    })
                }
                else{
                    let promises = [];
                    let dish_id = parseInt(fields.dish_id[0]);
                    if(files.image[0].originalFilename != ''){
                        let image_path = files.image[0].path;
                        let image_extname = files.image[0].originalFilename.split('.').pop();
                        let newImage_path = `public/dishes/${dish_id}.${image_extname}`;
                        promises.push(
                            new Promise((resolve, reject) => {
                                saveImage(image_path, newImage_path);
                                resolve();
                            })
                        )
                    } 
                    let dish = {
                        name: fields.name[0],
                        price: fields.price[0],
                    }
                    promises.push(
                        new Promise((resolve, reject) => {
                            mongoRequest('diplom', 'dishes', 'update', '', {condition: {dish_id: dish_id}, toUpdate: dish});
                            resolve();
                        })
                    )
                    Promise.all(promises)
                    .then(()=>{
                        res.send({})
                    })
                }
            })
            break;
        }
        case 'getDishes_admin':{
            getDishes(res)
            break;
        }
        case 'addNews':{
            let form = new multiparty.Form();
            form.parse(req, function(err, fields, files){
                let image_path = files.img[0].path;
                let id = fields.news_id[0];
                let title = fields.title[0];
                let date = fields.date[0];
                let content = fields.content[0];
                let img_extname = files.img[0].originalFilename.split('.').pop();
                if(id == ''){
                    let generateId_promise = new Promise((resolve, reject) => {
                        let id = generateUniqueId()
                        resolve(id);
                    })
                    generateId_promise.then((id)=>{
                        let newImagePath = `public/news/${id}.${img_extname}`;
                        let saveImage_promise = new Promise((resolve, reject) => {
                            saveImage(image_path, newImagePath);
                            resolve();
                        })
                        let writeNews_promise = new Promise((resolve, reject)=>{
                            let news = {
                                news_id: id,
                                title: title,
                                date: date,
                                content: content,
                                img_path: newImagePath
                            }
                            mongoRequest('diplom', 'news', 'put', 'one', news);
                            resolve();
                        })
                        Promise.all([saveImage_promise, writeNews_promise])
                        .then(()=>{
                            res.send(`${id}`);
                        })
                    })
                }
                else{
                    console.log(fields)
                    let news_toUpdate = {}
                    let promises = [];
                    let news_id = parseInt(fields.news_id[0]);
                    if(files.img[0].originalFilename != ''){
                        let path = files.img[0].path;
                        let img_extname = files.img[0].originalFilename.split('.').pop();
                        let newImagePath = `public/news/${news_id}.${img_extname}`;
                        promises.push(
                            new Promise((resolve, reject) => {
                                saveImage(path, newImagePath);
                                resolve();
                            })
                        )
                    }
                    news_toUpdate['title'] = fields.title[0];
                    news_toUpdate['content'] = fields.content[0];
                    promises.push(
                        new Promise((resolve, reject) => {
                            mongoRequest('diplom', 'news', 'update', '', {condition: {news_id: news_id}, toUpdate: news_toUpdate});
                        })
                    )
                    Promise.all(promises)
                    .then(()=>{
                        res.send({});
                    })
                }
            })
            break;
        }
        case 'getNews_admin':{
            new Promise((resolve, reject)=>{
                let news = mongoRequest('diplom', 'news', 'get', 'many', {});
                resolve(news);
            })
            .then((news)=>{
                res.send(news);
            })
            break;
        }
        case 'deleteNews':{
            let news_id = parseInt(req.body.news_id);
            new Promise((resolve, reject)=>{
                let news_info = mongoRequest('diplom', 'news', 'get', 'one', {news_id: news_id});
                resolve(news_info)
            })
            .then((news_info)=>{
                let img = news_info.img_path;
                let deleteField_promise = new Promise((resolve, reject) => {
                    mongoRequest('diplom', 'news', 'delete', 'one', {news_id: news_id});
                    resolve();
                })
                let deleteImage_promise = new Promise((resolve, reject) => {
                    fs.unlink(path.resolve(img), function(err){
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Файл удалён");
                        }
                    });
                    resolve();
                })
                Promise.all([deleteField_promise, deleteImage_promise])
                .then(()=>{
                    res.send({});
                })
            })
            break;
        }
        case 'deleteDish':{
            let dish_id = parseInt(req.body.dish_id);
            new Promise((resolve, reject) => {
                let dish_info = mongoRequest('diplom', 'dishes', 'get', 'one', {dish_id: dish_id});
                resolve(dish_info);
            })
            .then((dish_info) => {
                let img_path = `.${dish_info.img_path}`;
                let deleteField_promise = new Promise((resolve, reject) => {
                    mongoRequest('diplom', 'dishes', 'delete', 'one', {dish_id: dish_id});
                    resolve();
                })
                let deleteImage_promise = new Promise((resolve, reject) => {
                    fs.unlink(path.resolve(img_path), function(err){
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Файл удалён");
                        }
                    });
                    resolve();
                })
                Promise.all([deleteField_promise, deleteImage_promise])
                .then(()=>{
                    res.send({});
                })
            })
            break;
        }
        case 'getNews':{
            new Promise((resolve, reject) => {
                let news = mongoRequest('diplom', 'news', 'get', 'many', {});
                resolve(news)
            })
            .then((news)=>{
                for(let i = 0; i < news.length; i++){
                    delete news[i]._id;
                    delete news[i].news_id;
                    delete news[i].date;
                    news[i].img_path = news[i].img_path.slice(7)
                }
                res.send(news.slice(-4));
            })
            break;
        }
        case 'getFullNews':{
            new Promise((resolve, reject) => {
                let news = mongoRequest('diplom', 'news', 'get', 'many', {});
                resolve(news)
            })
            .then((news)=>{
                for(let i = 0; i < news.length; i++){
                    delete news[i]._id;
                    delete news[i].news_id;
                    delete news[i].date;
                    news[i].img_path = news[i].img_path.slice(7)
                }
                res.send(news);
            })
            break;
        }
        case 'register':{
            let thisUser = req.body;
            if(/[0-9a-zA-Z]/.test(thisUser.surname) || thisUser.surname.length == 0){res.send({status: 'error', code:0}); break;}
            if(/[0-9a-zA-Z]/.test(thisUser.name) || thisUser.name.length == 0){res.send({status: 'error', code:1}); break;}
            if(/[a-zA-ZА-Яа-я]/.test(thisUser.phone) || thisUser.phone.length != 11){res.send({status: 'error', code:2}); break;}
            if(/[a-zA-ZА-Яа-я]/.test(thisUser.date) || thisUser.date.length != 10){res.send({status: 'error', code:3}); break;}
            if(thisUser.login.length == 0){res.send({status: 'error', code:7}); break;}
            if(thisUser.password.length == 0){res.send({status: 'error', code:6}); break;}
            //Сделать тест логина и телефона
            let checkLogin_promise = new Promise((resolve, reject) => {
                let response = mongoRequest('diplom', 'users', 'get', 'one', {login: thisUser.login});
                resolve(response);
            })
            let checkPhone_promise = new Promise((resolve, reject) => {
                let response = mongoRequest('diplom', 'users', 'get', 'one', {phone: thisUser.phone});
                resolve(response);
            })
            Promise.all([checkLogin_promise, checkPhone_promise])
            .then((valids) => {
                if(valids[1] != null){res.send({status: 'error', code:5}); return 0}
                if(valids[0] != null){res.send({status: 'error', code:4}); return 0;}
                getToken(32).then((token)=>{
                    res.cookie('token', token, {signed: true, maxAge: 99999999999999}).send({status: 'success'});
                    thisUser['token'] = token;
                    new Promise((resolve, reject) => {
                        mongoRequest('diplom', 'users', 'put', 'one', thisUser);
                        resolve();
                    })
                })
            })
            break;
        }
        case 'login':{
            let thisUser = req.body;
            if(thisUser.login == 'admin'){
                logAdmin(res, thisUser);
                break;
            }
            if(req.body.login.length == 0){res.send({status: 'error', code: 0}); break;}
            if(req.body.password.length == 0){res.send({status: 'error', code: 1}); break;}
            new Promise((resolve, reject) => {
                let user = mongoRequest('diplom', 'users', 'get', 'one', {login: req.body.login, password: req.body.password});
                resolve(user)
            })
            .then((user)=>{
                if(user == null){res.send({status: 'error', code: 2})}
                else{
                    let token = user.token;
                    res.cookie('token', token, {signed: true, maxAge: 99999999999999}).send({status: 'success'});
                }
            })
            break;
        }
        case 'checkToken':{
            let token = req.signedCookies.token;
            res.send({exists: token != undefined});
            break;
        }
        case 'getUserInfo':{
            let token = req.signedCookies.token;
            if(token == undefined){res.redirect('/')}
            new Promise((resolve, reject)=>{
                let userInfo = mongoRequest('diplom', 'users', 'get', 'one', {token: token});
                resolve(userInfo)
            })
            .then((userInfo)=>{
                let response = {
                    name: userInfo.name,
                    surname: userInfo.surname,
                    phone: userInfo.phone
                }
                res.send(response);
            })
            break;
        }
        case 'changeUserData':{
            let token = req.signedCookies.token;
            let newData = req.body;
            if(/[0-9a-zA-Z]/.test(newData.surname) || newData.surname.length == 0){res.send({status: 'error', code: 0}); break;}
            if(/[0-9a-zA-Z]/.test(newData.name) || newData.name.length == 0){res.send({status: 'error', code: 1}); break;}
            if(/[А-Яа-яa-zA-Z]/.test(newData.phone) || newData.phone.length != 11){res.send({status: 'error', code: 2}); break;}
            new Promise((resolve, reject) => {
                let thisUser_info = mongoRequest('diplom', 'users', 'get', 'one', {token: token});
                resolve(thisUser_info);
            })
            .then((thisUser_info)=>{
                let id = thisUser_info._id;
                let data_toWrite = {
                    name: newData.name,
                    surname: newData.surname,
                    phone: newData.phone,
                    id: id,
                    type: 'changeData'
                }
                new Promise((resolve, reject) => {
                    mongoRequest('diplom', 'restores', 'put', 'one', data_toWrite);
                    resolve();
                })
                .then(()=>{
                    res.send({status: 'success'});
                })
            })
            break;
        }
        case 'getRestores':{
            new Promise((resolve, reject) => {
                let restores = mongoRequest('diplom', 'restores', 'get', 'many', {});
                resolve(restores);
            })
            .then((restores)=>{
                let promises = [];
                for(let i = 0; i < restores.length; i++){
                    promises.push(
                        new Promise((resolve, reject)=>{
                            let getUserInfo_promise = new Promise((resolve, reject)=>{
                                let thisUser_info = mongoRequest('diplom', 'users', 'get', 'one', {_id: restores[i].id});
                                resolve(thisUser_info)
                            })
                            .then((thisUser_info)=>{
                                resolve({restore: restores[i], userInfo: thisUser_info})
                            })
                        })
                    )
                }
                Promise.all(promises)
                .then((restores)=>{
                    let response = [];
                    for(let i = 0; i < restores.length; i++){
                        let restore = restores[i].restore;
                        let thisUser_info = restores[i].userInfo
                        if(restore.type == 'changeData'){
                            response.push({
                                surname_from: thisUser_info.surname,
                                name_from: thisUser_info.name,
                                phone_from: thisUser_info.phone,
                                surname_to: restore.surname,
                                name_to: restore.name,
                                phone_to: restore.phone,
                                type: restore.type,
                                aid: restore._id
                            })
                        }
                        else{
                            response.push({
                                surname: thisUser_info.surname,
                                name: thisUser_info.name,
                                phone: thisUser_info.phone,
                                type: 'changePass',
                                aid: restore._id
                            })
                        }
                    }
                    res.send(response);
                })
            })
            break;
        }
        case 'changePassword':{
            let data_sent = req.body;
            if(data_sent.newpass.length == 0){res.send({status: 'error', code: 0}); break;}
            
            new Promise((resolve, reject) => {
                let thisUser_info = mongoRequest('diplom', 'users', 'get', 'one', {login: data_sent.login})
                resolve(thisUser_info)
            })
            .then((thisUser_info)=>{
                if(thisUser_info == null){res.send({status: 'error', code: 1}); return 0;}
                if(thisUser_info.name != data_sent.name){res.send({status: 'error', code: 1}); return 0;}
                if(thisUser_info.surname != data_sent.surname){res.send({status: 'error', code: 1}); return 0;}
                if(thisUser_info.phone != data_sent.phone){res.send({status: 'error', code: 1}); return 0;}
                if(thisUser_info.date != data_sent.date){res.send({status: 'error', code: 1}); return 0;}
                let obj_toWrite = {
                    surname: thisUser_info.surname,
                    name: thisUser_info.name,
                    phone: thisUser_info.phone,
                    newpass: data_sent.newpass,
                    type: 'changePassword',
                    id: thisUser_info._id
                }
                new Promise((resolve, reject) => {
                    mongoRequest('diplom', 'restores', 'put', 'one', obj_toWrite);
                    resolve()
                })
                .then(()=>{
                    res.send({status: 'success'})
                })
            })
            break;
        }
        case 'acceptRestore':{
            let aid = req.body.aid;
            let _id = new ObjectId(aid);
            new Promise((resolve, reject) => {
                let restore = mongoRequest('diplom', 'restores', 'get', 'one', {_id: _id});
                resolve(restore);
            })
            .then((restore)=>{
                if(restore.type == 'changeData'){
                    let update = new Promise((resolve, reject) => {
                        mongoRequest('diplom', 'users', 'update', '', {condition: {_id: restore.id}, toUpdate: {surname: restore.surname, name: restore.name, phone: restore.phone}})
                        resolve();
                    })
                    let delete_restore = new Promise((resolve, reject) => {
                        mongoRequest('diplom', 'restores', 'delete', 'one', {_id: _id});
                        resolve();
                    })
                    Promise.all([update, delete_restore])
                    .then(()=>{
                        res.send({})
                    })
                }
                if(restore.type == 'changePassword'){
                    let change = new Promise((resolve, reject) => {
                        mongoRequest('diplom', 'users', 'update', '', {condition: {_id: restore.id}, toUpdate: {password: restore.newpass}});
                        resolve();
                    })
                    let delete_restore = new Promise((resolve, reject) => {
                        mongoRequest('diplom', 'restores', 'delete', 'one', {_id: _id});
                        resolve();
                    })
                    Promise.all([change, delete_restore])
                    .then(()=>{
                        res.send({});
                    })
                }
            })
        }
        case 'cancelRestore':{
            let aid = req.body.aid;
            let _id = new ObjectId(aid);
            new Promise((resolve, reject) => {
                let restore = mongoRequest('diplom', 'restores', 'delete', 'one', {_id: _id});
                resolve();
            })
            .then(()=>{
                res.send({});
            })
            break;
        }
        case 'bookTable':{
            let date = req.body.date;
            let time = req.body.time;
            console.log({date: date})
            console.log({time: time})
            if(time == '' || date.year == ''){
                res.send({status: 'error', code: 1});
                break;
            }
            let today = new Date();
            let today_year = today.getFullYear();
            if(date.year != today_year){
                res.send({status: 'error', code: 0});
                break;
            }
            let time_first = time.split('-')[0];
            let hoursMinutes = time_first.split(':');
            let hours = hoursMinutes[0];
            console.log(today.getFullYear(), parseInt(date.month-1), parseInt(date.day), parseInt(hours), 0)
            let thisTime = new Date(today.getFullYear(), parseInt(date.month-1), parseInt(date.day), parseInt(hours), 0);
            console.log(thisTime)
            console.log('thisTime.getMilliseconds(): ',thisTime.getTime());
            console.log('Date.now(): ', Date.now());
            if(thisTime.getTime() < Date.now()){
                res.send({status: 'error', code: 3});
                break;
            }
            let token = req.signedCookies.token;
            console.log(token)
            new Promise((resolve, reject) => {
                let thisUser = mongoRequest('diplom', 'users', 'get', 'one', {token: token});
                resolve(thisUser);
            })
            .then((thisUser)=>{
                let id = thisUser._id;
                new Promise((resolve, reject) => {
                    let tables = mongoRequest('diplom', 'tables', 'get', 'many', {day: date.day, month: date.month, time: time});
                    resolve(tables);
                })
                .then((tables)=>{
                    let bookedNumbers = [];
                    let freeNumbers = [];
                    for(let i = 0; i < tables.length; i++){
                        let number = tables[i].number;
                        bookedNumbers.push(number);
                    }
                    for(let i = 1 ; i <= 7; i++){
                        if(!bookedNumbers.includes(i)){
                            freeNumbers.push(i);
                        }
                    }
                    console.log(freeNumbers);
                    if(freeNumbers.length != 0){
                        let table = {
                            number: freeNumbers[0],
                            person: thisUser.surname+' '+thisUser.name,
                            personid: thisUser._id,
                            time: time,
                            day: date.day,
                            month: date.month,
                        }
                        writeTable(table, res);
                    }
                    else{
                        res.send({status: 'error', code: 2});
                        return 0;
                    }
                })
            })
            break;
        }
        case 'getTables':{
            let day = req.body.day;
            let month = req.body.month;

            new Promise((resolve, reject) => {
                let tables = mongoRequest('diplom', 'tables', 'get', 'many', {day: day, month: month});
                resolve(tables);
            })
            .then((tables) => {
                let tables_toReturn = {
                    table1:[],
                    table2:[],
                    table3:[],
                    table4:[],
                    table5:[],
                    table6:[],
                    table7:[]
                }
                for(let i = 0; i < tables.length; i++){
                    tables_toReturn[`table${tables[i].number}`].push({
                        id: tables[i]._id,
                        time: tables[i].time,
                        person: tables[i].person
                    })
                }
                res.send(tables_toReturn);
            })
            break;
        }
        case 'unbook':{
            let table_id = req.body.table_id;
            let id = new ObjectId(table_id);
            new Promise((resolve, reject) => {
                mongoRequest('diplom', 'tables', 'delete', 'one', {_id: id});
                resolve();
            })
            .then(() => {
                res.send({});
            })
        }
    }
})
app_start();