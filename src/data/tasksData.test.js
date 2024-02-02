const { calculateCompleted } = require('./tasksData');

describe('Task Data test suite', () => {
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

    it('Should return false for a completed task for multiple instance duration type where day not today', () => {
        const sut = calculateCompleted;
        const expected = false;

        let last_update = new Date((new Date().getDate() - 1));
        last_update = new Date(last_update.toDateString());
        const actual = sut({duration_type: 1, completed: true, days: [0,0,0,0,0,0,0], last_update});

        expect(actual).toBe(expected);
    })

    it('Should return true for a completed task for multiple instance duration type where day is today', () => {
        const sut = calculateCompleted;
        const expected = true;

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