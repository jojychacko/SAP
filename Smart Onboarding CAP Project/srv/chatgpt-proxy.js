if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const OpenAI = require('openai');
const cds = require('@sap/cds');

const contextDictionary = require('./context');
const mapGenericPromptsToWhere = require('./prompt-mapping');

module.exports = async function (app) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('Missing OPENAI_API_KEY environment variable');
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    app.use(express.json());

    app.post('/chatgpt', async (req, res) => {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        try {
            const db = await cds.connect.to('db');

            let table = 'onboard_Employees';
            if (/documents?/i.test(message)) table = 'onboard_Documents';
            else if (/role|suggest/i.test(message)) table = 'onboard_RoleSuggestions';

            const { columns, uniqueValues } = contextDictionary[table];
            const sqlKeywords = ['where', 'and', 'or', 'like', 'not', 'in', 'null', '=', '>', '<', '>=', '<=', '!=', 'between'];
            const knownValues = Object.values(uniqueValues).flat().map(val => val.toLowerCase());

            const manualWhere = mapGenericPromptsToWhere(message, table);
            if (manualWhere) {
                const query = `SELECT * FROM ${table} ${manualWhere}`;
                const result = await db.run(query);
                return res.json({ data: result });
            }

            if (/sql/i.test(message.toLowerCase())) {
                const chat = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'user',
                        content: `Give SQL only for SQLite DB. Use table ${table} with columns (${columns.join(', ')}). Here is the question: ${message}`
                    }],
                    temperature: 0
                });
                let reply = chat.choices[0].message.content.trim();
                reply = reply.replace(/\bEmployees\b/gi, 'onboard_Employees')
                             .replace(/\bDocuments\b/gi, 'onboard_Documents')
                             .replace(/\bRoleSuggestions\b/gi, 'onboard_RoleSuggestions');
                return res.json({ reply });
            }

            if (/employees|documents|rolesuggestions|joined|after|before|status|gender|role|department/i.test(message.toLowerCase())) {
                const chat = await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'user',
                        content: `Given this question: "${message}", respond only with valid SQLite WHERE clause for ${table} with columns (${columns.join(', ')}). Only return WHERE clause, no explanation.`
                    }],
                    temperature: 0
                });

                let condition = chat.choices[0].message.content.trim();
                condition = condition.replace(/Employees/gi, table)
                                     .replace(/Documents/gi, table)
                                     .replace(/RoleSuggestions/gi, table)
                                     .replace(/JOIN_DATE/gi, 'joindate')
                                     .replace(/''/g, "'");

                if (!/^WHERE/i.test(condition)) {
                    condition = `WHERE ${condition}`;
                }

                condition = condition.replace(/(\d{4}-\d{2}-\d{2})/g, "'$1'");
                condition = condition.replace(/=\s*([^\s']+)/gi, (match, p1) => {
                    if (!/^'/.test(p1) && isNaN(p1)) {
                        return `= '${p1}'`;
                    }
                    return match;
                });

                const words = condition.toLowerCase().split(/\W+/);
                const invalidCols = words.filter(word =>
                    word &&
                    !columns.includes(word) &&
                    !sqlKeywords.includes(word) &&
                    !knownValues.includes(word) &&
                    !/^'/.test(word) &&
                    !/^\d+$/.test(word)
                );

                if (invalidCols.length > 0) {
                    return res.json({
                        reply: `Invalid columns: ${invalidCols.join(', ')}. Valid columns in ${table}: ${columns.join(', ')}`
                    });
                }

                const query = `SELECT * FROM ${table} ${condition}`;
                const result = await db.run(query);
                return res.json({ data: result });
            }

            const chat = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'user',
                    content: message
                }],
                temperature: 0.7
            });

            const reply = chat.choices[0].message.content.trim();
            return res.json({ reply });

        } catch (err) {
            console.error('ChatGPT API or DB Error:', err);
            res.status(500).json({ error: 'Failed to process your request' });
        }
    });
};
