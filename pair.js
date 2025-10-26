const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require('pino');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require('@whiskeysockets/baileys');

// URL de l'image KING
const KING_IMAGE_URL = 'https://files.catbox.moe/ndj85q.jpg';

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    
    // Validation du numéro
    if (!num) {
        return res.status(400).send({ error: 'Le numéro est requis' });
    }

    // Nettoyage du numéro
    num = num.replace(/[^0-9]/g, '');
    
    // Vérification du format du numéro
    if (num.length < 10) {
        return res.status(400).send({ error: 'Numéro invalide' });
    }

    async function KING_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Pair_Code_By_KING = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: Browsers.macOS('Safari'),
                syncFullHistory: false,
                generateHighQualityLinkPreview: true,
                markOnlineOnConnect: false
            });

            if (!Pair_Code_By_KING.authState.creds.registered) {
                await delay(2000);
                
                try {
                    const code = await Pair_Code_By_KING.requestPairingCode(num);
                    console.log('Pair code generated:', code);
                    
                    if (!res.headersSent) {
                        await res.send({ 
                            success: true,
                            code: code,
                            sessionId: id,
                            message: 'Code de pairing généré avec succès'
                        });
                    }
                } catch (pairError) {
                    console.error('Error generating pair code:', pairError);
                    if (!res.headersSent) {
                        await res.status(500).send({ 
                            error: 'Erreur lors de la génération du code',
                            details: pairError.message 
                        });
                    }
                    return;
                }
            } else {
                if (!res.headersSent) {
                    await res.send({ 
                        error: 'Déjà enregistré',
                        message: 'Ce numéro est déjà enregistré' 
                    });
                }
                return;
            }

            Pair_Code_By_KING.ev.on('creds.update', saveCreds);
            
            Pair_Code_By_KING.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect, qr } = s;
                
                console.log('Connection update:', connection);
                
                if (connection === 'open') {
                    console.log('Connexion établie avec succès');
                    
                    await delay(3000);
                    
                    try {
                        // Vérifier si la session est valide
                        if (Pair_Code_By_KING.user && Pair_Code_By_KING.user.id) {
                            // Envoyer l'image de bienvenue KING
                            await Pair_Code_By_KING.sendMessage(Pair_Code_By_KING.user.id, {
                                image: { url: KING_IMAGE_URL },
                                caption: '👑 *CONNEXION ROYALE ÉTABLIE* 👑\n\nBienvenue dans le royaume KING DIVIN !\nVotre session a été connectée avec succès via Pair Code.'
                            });

                            const KING_MD_TEXT = `

╭─═━⌬━═─⊹⊱✦⊰⊹─═━⌬━═─ 
╎   『 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 』   
╎  ✦ KING DIVIN SESSION
╎  ✦  BY DEV KERVENS KING
╰╴╴╴╴

▌   『 🔐 𝐒𝐄𝐋𝐄𝐂𝐓𝐄𝐃 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 』   
▌  • Session ID: ${id}
▌  • Méthode: 📱 Pair Code
▌  • Statut: ✅ ACTIVE

╔═
╟   『 𝐂𝐎𝐍𝐓𝐀𝐂𝐓 & 𝐒𝐔𝐏𝐏𝐎𝐑𝐓 』  
╟  👑 𝐎𝐰𝐧𝐞𝐫: 50942588377  
╟  💻 𝐑𝐞𝐩𝐨: github.com/Kervens-King
╟  👥 𝐖𝐚𝐆𝐫𝐨𝐮𝐩: https://chat.whatsapp.com/GIIGfaym8V7DZZElf6C3Qh
╟  📢 𝐖𝐚𝐂𝐡𝐚𝐧𝐧𝐞𝐥: https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20
╟  🎭 𝐋𝐞𝐠𝐞𝐧𝐝: Éternelle
╰  
✦⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅✦  
   𝐄𝐍𝐉𝐎𝐘 𝐊𝐈𝐍𝐆 𝐃𝐈𝐕𝐈𝐍!  
✦⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅⋆⋅✦  

🎭 "Au stade le plus tragique et plus belle"
__________________________________________
★彡[ᴅᴏɴ'ᴛ ғᴏʀɢᴇᴛ ᴛᴏ sᴛᴀʀ ᴛʜᴇ ʀᴇᴘᴏ!]彡★
`;

                            await Pair_Code_By_KING.sendMessage(Pair_Code_By_KING.user.id, { text: KING_MD_TEXT });

                            // Message final avec invitations
                            await Pair_Code_By_KING.sendMessage(Pair_Code_By_KING.user.id, {
                                image: { url: KING_IMAGE_URL },
                                caption: '🎊 **INITIATION PAIR CODE TERMINÉE** 🎊\n\nVotre connexion au royaume est confirmée.\n\nRejoignez nos communautés :\n📢 Canal: whatsapp.com/channel/0029Vb6KikfLdQefJursHm20\n👥 Groupe: chat.whatsapp.com/GIIGfaym8V7DZZElf6C3Qh\n\nProfitez de votre séjour royal ! 👑\n— KING DIVIN 🤴'
                            });

                            console.log('Messages de bienvenue envoyés avec succès');
                        }
                    } catch (messageError) {
                        console.error('Error sending welcome messages:', messageError);
                    }

                    await delay(2000);
                    
                    try {
                        await Pair_Code_By_KING.ws.close();
                        console.log('Connexion fermée proprement');
                    } catch (closeError) {
                        console.error('Error closing connection:', closeError);
                    }
                    
                    try {
                        await removeFile('./temp/' + id);
                        console.log('Fichiers temporaires nettoyés');
                    } catch (cleanError) {
                        console.error('Error cleaning temp files:', cleanError);
                    }
                    
                } else if (connection === 'close') {
                    console.log('Connexion fermée');
                    if (lastDisconnect && lastDisconnect.error) {
                        console.error('Dernière déconnexion:', lastDisconnect.error);
                        
                        // Reconnexion seulement pour certaines erreurs
                        if (lastDisconnect.error.output?.statusCode !== 401) {
                            console.log('Tentative de reconnexion...');
                            await delay(10000);
                            KING_PAIR_CODE();
                        } else {
                            console.log('Erreur d\'authentification, pas de reconnexion');
                            await removeFile('./temp/' + id);
                        }
                    }
                }
            });

        } catch (err) {
            console.error('Erreur générale:', err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.status(500).send({ 
                    error: 'Service Currently Unavailable',
                    details: err.message 
                });
            }
        }
    }
    
    return await KING_PAIR_CODE();
});

module.exports = router;
