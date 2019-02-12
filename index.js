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
        deletable = false,
        editable = false,
    } = {}
) => {
    const models = Object.entries(sequelize.models)
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
                        .map(({fieldName, type}) => ({
                            title: fieldName,
                            data: fieldName,
                            type: type.key,
                            ...(type.key == 'ENUM' ? {options: type.options.values} : {}),
                        })),
                }),
            {}
        );
    const app = express();
    app.set('view engine', 'ejs');
    app.set('views', path.resolve(__dirname, './views'));
    app.use(express.static(path.resolve(__dirname, './static')));
    app.use(express.urlencoded({extended: true}));

    app.get('/', async (req, res, next) => {
        try {
            res.render('admin', {
                url: req.originalUrl,
                models,
                limit,
                title,
                logo,
                navbar,
                backgroundColor,
                deletable,
                editable,
            });
        } catch (err) {
            next(err);
        }
    });

    app.post('/', async (req, res, next) => {
        try {
            if (!models[req.body.model]) return res.status(400).end();
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

    if (editable) {
        app.get('/edit/:id', async (req, res, next) => {
            try {
                const fields = models[req.query.model];
                if (!fields) return res.status(400).end();
                res.render('edit', {
                    url: req.originalUrl,
                    fields,
                    item: await sequelize.models[req.query.model].findOne({where: {id: +req.params.id || 0}}),
                });
            } catch (err) {
                next(err);
            }
        });
        app.post('/edit/:id', async (req, res, next) => {
            try {
                const fields = models[req.query.model];
                if (!fields) return res.status(400).end();
                await sequelize.models[req.query.model].update(
                    fields.reduce((item, {data, type}) => {
                        if (data == 'id' || !(data in req.body)) return item;
                        switch (type) {
                            case 'JSON':
                                item[data] = JSON.parse(req.body[data].trim() || 'null');
                                break;
                            case 'ENUM':
                                item[data] = req.body[data] || null;
                                break;
                            default:
                                item[data] = req.body[data];
                        }
                        return item;
                    }, {}),
                    {where: {id: +req.params.id || 0}}
                );
                res.status(204).end();
            } catch (err) {
                next(err);
            }
        });
    }
    if (deletable) {
        app.post('/delete/:id', async (req, res, next) => {
            try {
                if (!models[req.query.model]) return res.status(400).end();
                await sequelize.models[req.query.model].destroy({where: {id: +req.params.id || 0}});
                res.status(204).end();
            } catch (err) {
                next(err);
            }
        });
    }

    return app;
};
