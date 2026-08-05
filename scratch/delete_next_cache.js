const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', '.next');
console.log('Checking path:', targetPath);

function deleteFolderRecursive(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        fs.readdirSync(directoryPath).forEach((file, index) => {
            const curPath = path.join(directoryPath, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(directoryPath);
    }
}

try {
    const exists = fs.existsSync(targetPath);
    console.log('Exists:', exists);
    if (exists) {
        console.log('Deleting .next folder recursively...');
        deleteFolderRecursive(targetPath);
        console.log('.next folder deleted successfully.');
    } else {
        console.log('.next folder does not exist, nothing to delete.');
    }
} catch (e) {
    console.error('Error deleting path:', e);
}
