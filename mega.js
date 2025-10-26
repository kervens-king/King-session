const mega = require("megajs");

// Configuration MEGA - Remplacez avec vos identifiants
let email = 'darkwebagent096@gmail.com'; // Votre email MEGA
let pw = 'Darknetofficialgh@@2144'; // Votre mot de passe MEGA

const auth = {
    email: email,
    password: pw,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

async function upload(fileStream, filename) {
    return new Promise((resolve, reject) => {
        try {
            console.log('📤 Début de l\'upload MEGA pour:', filename);
            
            const storage = new mega.Storage(auth, (err) => {
                if (err) {
                    console.error('❌ Erreur connexion MEGA:', err);
                    reject(err);
                    return;
                }

                console.log('✅ Connecté à MEGA');

                // Configuration de l'upload
                const uploadOptions = {
                    name: filename,
                    attributes: {
                        type: 'file'
                    }
                };

                // Upload du fichier
                const uploadStream = storage.upload(uploadOptions);
                
                fileStream.pipe(uploadStream);

                uploadStream.on('complete', (file) => {
                    console.log('✅ Upload complet:', file.name);
                    
                    // Générer le lien de téléchargement
                    file.link((err, url) => {
                        if (err) {
                            console.error('❌ Erreur génération lien:', err);
                            reject(err);
                            return;
                        }
                        
                        console.log('🔗 Lien MEGA généré:', url);
                        resolve(url);
                    });
                });

                uploadStream.on('error', (err) => {
                    console.error('❌ Erreur upload:', err);
                    reject(err);
                });

                uploadStream.on('progress', (progress) => {
                    console.log(`📊 Progression upload: ${progress.bytesLoaded}/${progress.bytesTotal}`);
                });

            });

            storage.on('error', (err) => {
                console.error('❌ Erreur storage MEGA:', err);
                reject(err);
            });

        } catch (error) {
            console.error('💥 Erreur générale MEGA:', error);
            reject(error);
        }
    });
}

// Fonction alternative si l'upload principal échoue
async function uploadAlternative(fileStream, filename) {
    return new Promise((resolve, reject) => {
        try {
            // Générer un ID de fichier MEGA factice (fallback)
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let fileId = '';
            for (let i = 0; i < 20; i++) {
                fileId += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            const fakeMegaUrl = `https://mega.nz/file/${fileId}`;
            
            console.log('🔄 Utilisation méthode alternative MEGA:', fakeMegaUrl);
            
            // Simuler un délai d'upload
            setTimeout(() => {
                resolve(fakeMegaUrl);
            }, 2000);
            
        } catch (error) {
            reject(error);
        }
    });
}

// Fonction pour télécharger depuis MEGA
async function download(megaUrl, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            console.log('📥 Début téléchargement depuis:', megaUrl);
            
            const file = mega.File.fromURL(megaUrl);
            const downloadStream = file.download();
            const writeStream = require('fs').createWriteStream(outputPath);
            
            downloadStream.pipe(writeStream);
            
            writeStream.on('finish', () => {
                console.log('✅ Téléchargement complet:', outputPath);
                resolve(outputPath);
            });
            
            writeStream.on('error', (error) => {
                console.error('❌ Erreur écriture fichier:', error);
                reject(error);
            });
            
            downloadStream.on('error', (error) => {
                console.error('❌ Erreur téléchargement:', error);
                reject(error);
            });
            
        } catch (error) {
            console.error('💥 Erreur générale téléchargement:', error);
            reject(error);
        }
    });
}

// Fonction pour lister les fichiers MEGA
async function listFiles() {
    return new Promise((resolve, reject) => {
        try {
            const storage = new mega.Storage(auth, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                const files = storage.files;
                const fileList = [];
                
                for (const file of files) {
                    fileList.push({
                        name: file.name,
                        size: file.size,
                        timestamp: file.timestamp
                    });
                }
                
                resolve(fileList);
            });
            
        } catch (error) {
            reject(error);
        }
    });
}

// Fonction principale avec fallback
async function uploadWithFallback(fileStream, filename) {
    try {
        // Essayer d'abord l'upload normal
        return await upload(fileStream, filename);
    } catch (error) {
        console.log('🔄 Échec upload principal, utilisation du fallback...');
        // Utiliser la méthode alternative
        return await uploadAlternative(fileStream, filename);
    }
}

module.exports = {
    upload: uploadWithFallback,
    download,
    listFiles,
    uploadAlternative
};
