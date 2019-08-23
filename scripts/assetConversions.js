const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const queue = [];

function queueFolder(folder) {
    return new Promise((resolve, reject) => {
        queue.push(`pngquant -ext .lq.png ${folder}*.png`);
        fs.readdir(folder, (err, files) => {
            if (err) {
                console.log(err);
                return;
            }
            const subPromises = files.filter((file) => {
                const ext = file.match(/\..*?$/);
                if (ext && ext[0] !== '.png') return false;
                return true;
            }).map((file) => {
                return new Promise((resolve, reject) => {
                    fs.lstat(path.join(folder, file), (err, stat) => {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        if (stat.isDirectory()) {
                            queueFolder(path.join(folder, file) + '/')
                                .then(() => resolve())
                                .catch(() => reject());
                        } else if (file.match(/\.png$/)) {
                            queueFile(path.join(folder, file));
                            resolve();
                        } else {
                            resolve();
                        }
                    })
                })
            });

            Promise.all(subPromises)
                .then(() => resolve())
                .catch((reason) => reject(reason));
        });
    });
}

/**
 * 
 * @param {string} file 
 */
function queueFile(file) {
    const webpLqFile = file.replace(/\.png$/, '.lq.webp');
    const webpFile = file.replace(/\.png$/, '.webp');
    queue.push(`cwebp -lossless ${file} -o ${webpFile}`);
    queue.push(`cwebp -near_lossless 50 ${file} -o ${webpLqFile}`);
}

queueFolder('./public/assets/')
    .then(() => {
        function runner() {
            const next = queue.shift();

            if (!next) return;

            console.log(next);
            exec(next, (error, stdout) => {
                runner();
            });
        }

        // run 10 threads in parallel
        for (var i = 0; i < 10; ++i) runner();
    })
    .catch((reason) => console.error(reason));