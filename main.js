const electron = require('electron')
const url = require('url')
const path = require('path')

const { 
    app, 
    BrowserWindow, 
    Menu,
    ipcMain
} = electron

let mainWindow
let addItemWindow

// Current environment:
//process.env.NODE_ENV = 'production'

// on app is ready the window is created:
app.on('ready', ()=>{
    //window creation
    mainWindow = new BrowserWindow({webPreferences: {nodeIntegration: true}})
    //loading html into window:
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }))
    // When hit quit on main window, closes all:
    mainWindow.on('closed', ()=>{
        app.quit()
    })
    
    // building menu from template:
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    // inserting menu:
    Menu.setApplicationMenu(mainMenu)
})

// Functions ---------------------------------------------------------------------
let createAddItemWindow = () =>{
    addItemWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Adicione um novo item à lista:',
        webPreferences: {nodeIntegration: true}
    })

    //loading html into window:
    addItemWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addItemWindow.html'),
        protocol: 'file:',
        slashes: true
    }))
    // garbage collection handle:
    addItemWindow.on('close', ()=>{
        addItemWindow = null
    })
}

// Catching item data from html page:
ipcMain.on('item:add', (e, item)=>{
    //console.log(item)
    mainWindow.webContents.send('item:add', item)
    addItemWindow.close()
})


// Menu template:
const mainMenuTemplate = [
    {
        label: 'Início',
        submenu: [
            {
                label: 'Adicionar um item',
                accelerator: process.platform == 'darwin' ? 'Command+Shift+A' : 'Ctrl+Shift+A',
                click(){
                    createAddItemWindow()
                }
            },
            {
                label: 'Limpar todos os itens',
                click(){
                    mainWindow.webContents.send('item:clear')
                }
            },
            {
                label: 'Sair',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit()
                }
            }
        ]
    }
]

//Hotfix for mac Users
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({})
}

// Add devtools if is not in production:
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'DeveloperTools',
        submenu: [
            {
                label: 'Toogle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools()
                }                
            },
            {
                role: 'reload'
            }
        ]
    })
}

// Stops on 33:00