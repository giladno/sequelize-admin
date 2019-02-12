'use strict';
const path = require('path');
const express = require('express');

module.exports = (
    sequelize,
    {
        limit = 50,
        include = {},
        exclude = {},
        title = 'Sequelize Admin',
        logo,
        navbar = 'light',
        backgroundColor = '#e3f2fd',
    } = {}
) => {
    const app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.resolve(__dirname, './views'));
    app.use(express.urlencoded({extended: true}));

    app.get('/', async (req, res, next) => {
        try {
            res.render('admin', {
                url: req.originalUrl,
                models: Object.entries(sequelize.models)
                    .filter(([name]) => exclude[name] !== true)
                    .reduce(
                        (models, [name, {rawAttributes}]) =>
                            Object.assign(models, {
                                [name]: Object.values(rawAttributes)
                                    .filter(({type, fieldName}) => {
                                        return (
                                            type.key != 'VIRTUAL' &&
                                            (!include[name] || include[name].includes(fieldName)) &&
                                            (!exclude[name] || !exclude[name].includes(fieldName))
                                        );
                                    })
                                    .map(({fieldName}) => ({title: fieldName, data: fieldName})),
                            }),
                        {}
                    ),
                limit,
                title,
                logo,
                navbar,
                backgroundColor,
            });
        } catch (err) {
            next(err);
        }
    });

    app.post('/', async (req, res, next) => {
        try {
            let {count: recordsTotal, rows: data} = await sequelize.models[req.body.model].findAndCountAll({
                where: {},
                offset: +req.body.start || 0,
                limit: Math.min(Math.max(+req.body.length || 0, 0), limit),
                order: req.body.order.map(({column, dir}) => [req.body.columns[+column].data, dir]),
            });
            res.json({
                draw: +req.body.draw || 0,
                recordsTotal,
                recordsFiltered: recordsTotal,
                data,
            });
        } catch (err) {
            next(err);
        }
    });

    return app;
};
