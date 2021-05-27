const { dialog } = require('electron').remote
const ObservationDatabase = require('../assets/better-sqlite');

document.getElementById("select_file").addEventListener("click", selectFile);
document.getElementById("select_output").addEventListener("click", selectFolder);
document.getElementById("process").addEventListener("click", processFile);

function selectFile() {
    dialog.showOpenDialog([], {
        title: "Select Observation List Spreadsheet",
        filters: [
            { name: 'Spreadsheet', extensions: ['xls', 'xlsx', 'xlsm', 'xlsb'] },
        ],
        properties: [
            'openFile'
        ]
    }).then(result => {
        if (!result.canceled) {
            document.getElementById("selected_file").innerHTML = result.filePaths[0];
        } else {
            new Toast('File Picker Cancelled');
        }
    })
}

function selectFolder() {
    dialog.showSaveDialog([], {
        title: "Save as",
        filters: [
            { name: 'Spreadsheet', extensions: ['xls', 'xlsx', 'xlsm', 'xlsb'] },
        ]
    }).then(result => {
        if (!result.canceled) {
            document.getElementById("selected_output").innerHTML = result.filePath;
        } else {
            new Toast('File Picker Cancelled');
        }
    })
}

function processFile() {
    //getMaximoData();
    const worker = new WorkerHandler;
    const ws_name = document.getElementById("ws-name").value;
    const wb_path = document.getElementById("selected_file").innerHTML;
    worker.work(['processObservationList', [wb_path, ws_name]], saveReadObserves);
}

function saveReadObserves(data) {
    const sqlite = new ObservationDatabase();
    sqlite.createTables();
    sqlite.insertMeter(data[0][0]);
    sqlite.insertObservation(data[0][1]);
    getMaximoData();
}

function getMaximoData() {
    const worker = new WorkerHandler;
    worker.work(['getMaximoObservation'], compareObservLists);
}

function compareObservLists(data) {
    const worker = new WorkerHandler;
    const save_path = document.getElementById("selected_output").innerHTML;
    worker.work(['compareObservLists', data[0], save_path], undefined);
}