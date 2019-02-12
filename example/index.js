'use strict';
const http = require('http');
const express = require('express');
const Sequelize = require('sequelize');
const admin = require('../index');

const sequelize = new Sequelize('sqlite://:memory:', {operatorsAliases: false, logging: false});

const User = sequelize.define('User', {
    name: Sequelize.STRING,
});

const Post = sequelize.define('Post', {
    title: Sequelize.STRING,
    text: Sequelize.TEXT,
});

Post.belongsTo(User);
User.hasMany(Post);

const app = express();
app.use('/admin', admin(sequelize, {deletable: true, editable: true}));
app.get('/', (req, res) => res.send('<a href="/admin">Admin</a>'));

(async () => {
    await sequelize.sync();
    await User.bulkCreate([
        {id: 1, name: 'Evelyn Compton'},
        {id: 2, name: 'Emiliano Vaughn'},
        {id: 3, name: 'Audrey Davies'},
    ]);
    await Post.bulkCreate([
        {
            UserId: 1,
            title: 'Lorem ipsum dolor sit amet',
            text:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus efficitur mauris a tellus sodales molestie. Praesent malesuada ex non enim commodo porttitor. Donec nec risus non eros interdum lobortis finibus at dui. Suspendisse lacus sem, tempus non mollis vel, tristique nec quam. Aenean pulvinar aliquet lacus sit amet vestibulum. Sed accumsan eget erat et feugiat. Mauris varius scelerisque sapien at aliquam. Sed pellentesque enim ac augue cursus, sed condimentum tortor elementum. Quisque nec efficitur sem, id consectetur enim. In est augue, tincidunt eget diam non, molestie pharetra neque. Mauris eleifend arcu quis risus convallis, at porttitor diam pulvinar.',
        },
        {
            UserId: 1,
            title: 'Integer ultricies volutpat velit quis ullamcorper',
            text:
                'Maecenas ut sodales nunc, non commodo mi. Aenean dapibus nibh elit, at rhoncus lacus pharetra vitae. Cras quis purus pharetra, pharetra tortor a, mattis sem. Suspendisse euismod gravida metus. Sed nisl leo, consectetur et lorem nec, iaculis ornare sapien. Vivamus posuere venenatis erat bibendum dapibus. Aenean risus nunc, suscipit eget vehicula vitae, facilisis eget felis.',
        },
        {
            UserId: 2,
            title: 'Phasellus maximus facilisis magna vel malesuada',
            text:
                'Quisque interdum urna metus, at volutpat tortor aliquet eu. Fusce condimentum tellus et neque sollicitudin euismod. Cras sed dignissim odio, dictum ultrices eros. Donec a mauris sit amet tellus vestibulum malesuada. Etiam vulputate porta mi nec sagittis. Fusce accumsan ex sit amet purus lacinia efficitur. Fusce quis sem tellus. Duis arcu erat, rhoncus vel felis non, scelerisque cursus eros. Maecenas interdum ornare neque, nec volutpat tellus sollicitudin sit amet. Aenean nibh elit, volutpat et faucibus sit amet, fringilla sit amet ligula. Praesent eget consequat dui, eu laoreet leo. Curabitur eleifend dolor rutrum mi vehicula, consectetur feugiat velit ultrices.',
        },
        {
            UserId: 2,
            title: 'Curabitur ac accumsan tellus',
            text:
                'Donec tincidunt enim at massa tempor, et cursus erat consectetur. Donec a blandit elit. Quisque eu dui at nulla cursus pellentesque. Pellentesque fermentum maximus turpis, vel tempus augue mollis ac. Phasellus non pulvinar metus. Suspendisse dapibus, lorem elementum efficitur accumsan, dui enim tristique magna, id semper felis metus vel elit. Fusce vitae rutrum leo, blandit condimentum tortor. Fusce ornare, urna a dapibus aliquam, libero augue consectetur augue, a elementum est libero a turpis. Integer est ipsum, imperdiet vel faucibus ac, interdum in nibh. Etiam in nisl sit amet elit cursus tincidunt. Suspendisse potenti.',
        },
        {
            UserId: 3,
            title: 'Proin scelerisque venenatis nisl, ut mattis neque sodales vel',
            text:
                'Mauris urna dolor, tempus nec consequat nec, ultrices in metus. Donec mattis vestibulum nulla in malesuada. Aenean cursus, elit quis lobortis lobortis, dui leo dictum arcu, non sollicitudin massa lectus vel erat. Donec lectus tellus, maximus vitae imperdiet quis, laoreet et metus. Morbi a augue ac mi hendrerit elementum id finibus sem. Donec non nisl non diam eleifend cursus. Sed orci est, congue in leo sit amet, aliquam porta purus. Cras pellentesque est enim, malesuada scelerisque odio tempus feugiat. Quisque lorem lacus, placerat a diam et, malesuada aliquet libero. Aliquam ut quam elit. Donec condimentum diam ut sagittis bibendum. Cras et lacus a augue consectetur viverra.',
        },
        {
            UserId: 3,
            title: 'Nam eu metus quis odio bibendum tempus in vel nulla',
            text:
                'Proin a nulla feugiat mi feugiat rutrum vel nec ex. Donec ac viverra libero, sed viverra est. Vivamus rhoncus molestie nulla. Etiam iaculis lectus ut augue porttitor, quis ultricies dui lacinia. Pellentesque scelerisque nunc non tellus efficitur, in venenatis odio lacinia. Duis sollicitudin ipsum in magna egestas maximus. Proin vitae tristique metus, ac ullamcorper augue. Mauris ornare quam felis, eu hendrerit ante sollicitudin nec.',
        },
    ]);
    await new Promise((resolve, reject) =>
        http
            .Server(app)
            .listen(3000, resolve)
            .on('error', reject)
    );
    console.info('Server is running...');
})().catch(err => console.error(err));
