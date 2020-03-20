const homeDir = require('os').homedir(); // 此处是获取系统的home目录
const home = process.env.HOME || homeDir; // 此处是获取自己设置的环境变量HOME
const fs = require('fs');
const path = require('path')
const dbPath = path.resolve(home, 'fs模块-命令行工具/db.txt')

module.exports = {
    read(path = dbPath) {
        let fileData = fs.readFileSync(path, { flag: 'a+' }).toString();
        let list = null;
        try {
            list = JSON.parse(fileData);
        } catch (e) {
            list = []
        }
        return list
    },
    write(data, path = dbPath) {
        let list = JSON.stringify(data)
        return new Promise((resolve, reject) => {
            fs.writeFile(path, list + '\n', (err) => {
                if (err) {
                    return reject(err)
                }
                return resolve(true)
            })
        })
    },
    async add(title) {
        // 读取之前的文件，2. 往内容添加一个任务 3. 保存到那个文件
        let list = this.read()
        let data = {
            txt: title,
            done: false
        }
        list.push(data)
        return await this.write(list)
    },
    async clear() {
        return await this.write([])
    },
    getAll() {
        // 读取所以任务并返回
        return this.read()
    }
}