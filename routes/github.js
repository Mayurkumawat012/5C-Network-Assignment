const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../conn/db');
const format = require('pg-format');

async function getDataById(id) {
    try {
        console.log({ id });
        const query = "SELECT * FROM github where id = '" + id + "'";
        const { rows } = await pool.query(query);
        return rows;
    } catch (err) {
        throw err.message;
    }
}

async function insertOneByOne(element) {
    try {
        let record = [
            element.id,
            element.name,
            element.html_url,
            element.description,
            element.created_at,
            element.open_issues,
            element.watchers,
            JSON.stringify({
                id: element.owner.id,
                avatar_url: element.owner.avatar_url,
                html_url: element.owner.html_url,
                type: element.owner.type,
                site_admin: element.owner.site_admin
            })
        ];

        const query = format(
            'INSERT INTO github ( id, name, html_url, description, created_at, open_issues,watchers, owner) VALUES %L',
            [record]
        );
        console.log({ query });
        await pool.query(query);
        return { [element.id]: 'Data Recorded Successfully' };
    } catch (error) {
        return { [element.id]: error.message };
    }
}

router
    .post('/', async function (req, res) {
        try {
            const { url } = req.body;
            const { data: gitData } = await axios.get(url);
            let result = [];
            gitData.forEach(async element => {
                result.push(insertOneByOne(element));
            });
            result = await Promise.all(result);
            return res.send({ result });
        } catch (err) {
            return res.status(500).send({ error: err.message });
        }
    })
    .get('/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const rows = await getDataById(id);
            if (!rows.length) {
                res.status(400).send({ error: 'Id is Invalid' });
            }
            res.json(rows[0]);
        } catch (err) {
            res.status(500).send({ error: err.message });
        }
    });

module.exports = router;
