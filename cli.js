#!/usr/bin/env node
const { program } = require('commander');
const inquirer = require('inquirer');
const api = require('./index.js');
const pkg = require('./package.json');

let operateList = {
    exit() { },
    hasDone(list, index) {
        list[index].done = true
        this.writeToDb(list)
    },
    unDone(list, index) {
        list[index].done = false
        this.writeToDb(list)
    },
    removeTask(list, index) {
        list.splice(index, 1)
        this.writeToDb(list, '删除成功', '删除失败')
    },
    askAsmdfTask(list, operate = 'add', index) {
        let questions = [{
            type: 'input',
            name: 'name',
            message: "请输入任务名称",
            default: function () {
                return '这懒鬼没输入';
            }
        }]
        inquirer.prompt(questions).then(answers => {
            if (operate === 'add') {
                list.push({ txt: answers.name, done: false })
            } else {
                list[index].txt = answers.name
            }
            this.writeToDb(list)
        });
    },
    writeToDb(list, successTxt = '操作成功', failTxt = '操作失败') {
        api.write(list).then(() => { this.successHandle(successTxt) }).catch(() => { this.failHandle(failTxt) })
    },
    successHandle(txt = '操作成功') {
        console.log(txt)
    },
    failHandle(txt = '操作失败') {
        console.log(txt)
    }
}

function askAsOpearTask(list, index) {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'go',
                message: '你的操作是?',
                choices: [{ name: '退出', value: 'exit' }, { name: '已完成', value: 'hasDone' }, { name: '未完成', value: 'unDone' }, { name: '删除', value: 'removeTask' }, { name: '改标题', value: 'askAsmdfTask' }]
            }
        ])
        .then(taskRet => {
            if (taskRet.go === 'askAsmdfTask') {
                operateList['askAsmdfTask'](list, 'mdf', index)
            } else {
                operateList[taskRet.go](list, index)
            }
        });
}

function showList(list) {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'index',
                message: '请选择你要操作的任务?',
                choices: [{ name: '退出', value: '-1' }, ...list.map((item, index) => {
                    return { name: `${item.done ? '[X]' : '[_]'}  ${index + 1} - ${item.txt}`, value: index }
                }), { name: '+ 添加任务', value: '-2' }]
            }
        ])
        .then(listRet => {
            let listIndex = parseInt(listRet.index)
            // console.log(index);
            if (listIndex >= 0) {
                askAsOpearTask(list, listIndex)
            } else if (listIndex === -2) {
                operateList['askAsmdfTask'](list)
            }
        });
}

program
    .version(pkg.version);

program
    .command('add <a>')
    .description('add todos')
    .action((...args) => {
        let wordTitle = args[0]
        api.add(wordTitle).then(() => { console.log('添加成功') }).catch(() => { console.log('添加失败！请重试') })
    });
program
    .command('clear')
    .description('clear all todos')
    .action((...args) => {
        api.clear().then((r) => { console.log('清除成功') }).catch((e) => { console.log('清除失败') })
    });
program
    .command('list')
    .description('show todo list')
    .action(() => {
        let list = api.getAll()
        showList(list)
    });

program.parse(process.argv);
// 0 是node的系统路径，1是该项目的路径
// if (process.argv.length === 3) {
    // let list = api.getAll()
    // list.forEach((item, index) => {
    //     console.log(`${item.done ? '[X]' : '[_]'}  ${index + 1} - ${item.txt}`)
    // })

// }



