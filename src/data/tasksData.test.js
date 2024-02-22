require('dotenv').config();
const { calculateCompleted, findAll } = require('./tasksData');
const { Pool } = require('pg');

const pool = new Pool({
    database: process.env.DATABASE,
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

const taskId = '00000fe2-afd2-45c4-ae64-302daaf76b30';
afterEach(async () => {
    await pool.query(`DELETE FROM tasks where id = $1`, [taskId]);
})
describe('Calculate complete ', () => {
    it('Should return false for a non-completed task for single instance duration type', () => {
        const sut = calculateCompleted;
        const expected = false;

        let last_update = new Date((new Date().getDate() - 1));
        last_update = new Date(last_update.toDateString());
        const actual = sut({duration_type: 0, completed: false, last_update});

        expect(actual).toBe(expected);
    })

    it('Should return true for a completed task for single instance duration type', () => {
        const sut = calculateCompleted;
        const expected = true;

        let last_update = new Date((new Date().getDate() - 1));
        last_update = new Date(last_update.toDateString());
        const actual = sut({duration_type: 0, completed: true, last_update});

        expect(actual).toBe(expected);
    })

    it('Should return true for a completed task for multiple instance duration type where day not today', () => {
        const sut = calculateCompleted;
        const expected = true;

        let last_update = new Date((new Date().getDate() - 1));
        last_update = new Date(last_update.toDateString());
        const actual = sut({duration_type: 1, completed: true, days: [0,0,0,0,0,0,0], last_update});

        expect(actual).toBe(expected);
    })

    it('Should return false for a completed task for multiple instance duration type where day is today', () => {
        const sut = calculateCompleted;
        const expected = false;

        let last_update = new Date((new Date().getDate() - 1));
        last_update = new Date(last_update.toDateString());
        const days = [0,0,0,0,0,0,0];
        days[new Date().getDay()] = 1;
        const actual = sut({duration_type: 1, completed: false, days, last_update});

        expect(actual).toBe(expected);
    })

    it('Should return false for a completed task for multiple instance duration type where day is today and amount is one', () => {
        const sut = calculateCompleted;
        const expected = false;

        let last_update = new Date((new Date().getDate() - 1));
        last_update = new Date(last_update.toDateString());
        const days = [0,0,0,0,0,0,0];
        days[new Date().getDay()] = 1;
        const actual = sut({duration_type: 1, completed: false, days, last_update, amount: 1});

        expect(actual).toBe(expected);
    })

    it('Should return true if completed is true and last updated is today', () => {
        const sut = calculateCompleted;
        const expected = true;

        const days = [0,0,0,0,0,0,0];
        const actual = sut({duration_type: 1, completed: true, days, last_updated: new Date(new Date().toDateString())});

        expect(actual).toBe(expected);
    })

    it('Should return true if completed is false and last updated is today', () => {
        const sut = calculateCompleted;
        const expected = true;

        const days = [0,0,0,0,0,0,0];
        days[new Date().getDay()] = 1;
        const actual = sut({duration_type: 1, completed: true, days, last_updated: new Date(new Date().toDateString())});

        expect(actual).toBe(expected);
    })
});

describe('Find all ', () => {
    it('Should not return a completed zero multiple task if not current day', async () => {
        //Prepare data
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const twoDaysAhead =  new Date(new Date().getDate() + 2);
        const description = 'test-item';
        const durationType = 1;
        const selectedDays = [0,0,0,0,0,0,0,0];
        selectedDays[twoDaysAhead.getDay()] = 1;
        const count = 0;
        const amount = 0;
        const completed = true;
        const deleted = false;
        await pool.query(
            `INSERT INTO tasks(id, description, duration_type, days, count, last_updated, completed, amount, deleted)
            VALUES($1,$2, $3, $4, $5, $6, $7, $8, $9)`,
            [taskId, description, durationType, selectedDays, count, yesterday, completed, amount, deleted]
        );

        const sut = findAll;

        const actual = await sut();
        expect(actual).not.toContainEqual( {
            id: taskId,
            description: 'test-item',
            durationType: 1,
            selectedDays,
            count: 0,
            lastUpdated: yesterday,
            completed: false,
            amount: 0,
            subtasks: []
    });
    });

    it('Should return a non completed zero multiple task if current day', async () => {
        //Prepare data
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const today = new Date(new Date().toDateString());
        const description = 'test-item';
        const durationType = 1;
        const selectedDays = [0, 0, 0, 0, 0, 0, 0, 0];
        selectedDays[today.getDay()] = 1;
        const count = 0;
        const amount = 0;
        const completed = true;
        const deleted = false;
        await pool.query(
            `INSERT INTO tasks(id, description, duration_type, days, count, last_updated, completed, amount, deleted, is_weekly)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [taskId, description, durationType, selectedDays, count, yesterday, completed, amount, deleted, false]
        );

        const sut = findAll;

        const actual = await sut();
        expect(actual).toContainEqual({
            id: taskId,
            description: 'test-item',
            durationType: 1,
            selectedDays,
            count: 0,
            lastUpdated: today,
            completed: false,
            amount: 0,
            subtasks: [],
            isWeekly: false
        });
    });
})