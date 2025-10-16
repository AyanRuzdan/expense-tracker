const { program } = require('commander')
const fs = require('fs')
const path = require('path')
const DATA_FILE = path.join(__dirname, 'expenses.json')
function loadData() {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
}
function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}
function addExpense(desc, amount, category) {
    const data = loadData();
    const newId = data.length ? Math.max(...data.map(e => e.id)) + 1 : 1;
    // if data.length is 0 then it return false hence id:1 is provided else final_id + 1 as new_id
    const expense = {
        id: newId,
        date: new Date().toISOString().split('T')[0], // toISOString provides YYYY-MM-DDTHH:MM:SS.sssZ
        // here split by T splits the time string between date and time
        desc, amount, category: category || null
    };
    data.push(expense);
    saveData(data);
    console.log(`Expense added successfully ${newId}`)
}
function listExpenses() {
    const data = loadData();
    if (data.length == 0) {
        console.log('No expenses found'); return;
    }
    console.log('ID Date Description Amount Category')
    data.forEach(e => {
        console.log(`${e.id} ${e.date} ${e.desc} ${e.amount} ${e.category}`)
    });
}
function deleteExpense(id) {
    const data = loadData();
    const index = data.findIndex(e => e.id === id);
    // DEF: The findIndex() method of Array instances returns the index of the first element in an array that satisfies the provided testing function. If no elements satisfy the testing function, -1 is returned.
    if (index === -1) {
        console.log(`Expense not found for id ${id}`)
        return;
    }
    data.splice(index, 1);
    saveData(data);
    console.log(`Data for index ${index} removed`)
}
function updateExpense(id, desc, amount, category) {
    const data = loadData();
    const expense = data.findIndex(e => e.id == id)
    if (!expense) {
        console.log('Expense not found for id', id);
        return
    }
    if (desc) expense.desc = desc;
    if (amount) expense.amount = amount;
    if (category) expense.category = category;
    saveData(data);
}
function summary(month) {
    const data = loadData();
    if (month) {
        const filtered = data.filter(e => {
            const [year, m] = e.date.split('-');
            // splits the ISOString into YYYY-MM-DD and takes the first two
            const currYear = new Date().getFullYear().toString();
            return year === currYear && parseInt(m) === month;
        })
        const total = filtered.reduce((sum, e) => sum + e.amount, 0);
        console.log(`Total expenses for ${month} is \$${total}`)
    } else {
        const total = data.reduce((sum, e) => sum + e.amount, 0);
        console.log(`Total expense is ${total}`);
    }
}
program.command('add').requiredOption('--description <desc>').requiredOption('--amount <amount>', 'amount', parseFloat).option('--category <cat>').action((opts) => addExpense(opts.description, opts.amount, opts.category));
program.command('list').action(listExpenses);
program.command('delete').requiredOption('--id <id>', 'expense id', parseInt).action((opts) => deleteExpense(opts.id));
program.command('update').requiredOption('--id <id>', 'expense id', parseInt).option('--description <desc>').option('--amount <amount>', 'amount', parseFloat).option('--category <cat>').action((opts) => updateExpense(opts.id, opts.description, opts.amount, opts.category));
program.command('summary').option('--month <month>', 'month number', parseInt).action((opts) => summary(opts.month));
program.parse(process.argv);