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
    Browsers, 
    makeCacheableSignalKeyStore,
    getAggregateVotesInPollMessage,
    DisconnectReason,
    WA_DEFAULT_EPHEMERAL,
    jidNormalizedUser,
    proto,
    getDevice,
    generateWAMessageFromContent,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    getContentType,
    generateForwardMessageContent,
    downloadContentFromMessage,
    jidDecode 
} = require('@whiskeysockets/baileys');

const { upload } = require('./mega');

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
    num = num.replace(/[^0-9]/g, '');
    if (num.length < 10) {
        return res.status(400).send({ error: 'Numéro invalide' });
    }

    async function KING_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            var items = ["Safari"];
            function selectRandomItem(array) {
                var randomIndex = Math.floor(Math.random() * array.length);
                return array[randomIndex];
            }
            var randomItem = selectRandomItem(items);
            
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS(randomItem)
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                
                if (connection == "open") {
                    await delay(5000);
                    
                    try {
                        // Upload de la session sur MEGA
                        let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                        let rf = __dirname + `/temp/${id}/creds.json`;
                        
                        function generateRandomText() {
                            const prefix = "KING";
                            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                            let randomText = prefix;
                            for (let i = prefix.length; i < 22; i++) {
                                const randomIndex = Math.floor(Math.random() * characters.length);
                                randomText += characters.charAt(randomIndex);
                            }
                            return randomText;
                        }
                        const randomText = generateRandomText();

                        // Upload sur MEGA
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let king_session = "king~" + string_session;
                        
                        // Envoyer la session ID
                        let sessionMsg = await sock.sendMessage(sock.user.id, { text: king_session });

                        // Envoyer l'image de bienvenue KING
                        await sock.sendMessage(sock.user.id, {
                            image: { url: KING_IMAGE_URL },
                            caption: '👑 *CONNEXION ROYALE ÉTABLIE* 👑\n\nBienvenue dans le royaume KING DIVIN !\nVotre session a été connectée avec succès via Pair Code.'
                        });

                        await delay(2000);

                        // Message KING DIVIN formaté
                        const KING_MD_TEXT = `
╭─═━⌬━═─⊹⊱✦⊰⊹─═━⌬━═─ 
╎   『 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 』   
╎  ✦ KING DIVIN SESSION
╎  ✦ BY DEV KERVENS KING
╰╴╴╴╴

▌   『 🔐 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐈𝐍𝐅𝐎 』   
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

                        let textMsg = await sock.sendMessage(sock.user.id, { text: KING_MD_TEXT });

                        await delay(2000);

                        // Message final avec invitations
                        await sock.sendMessage(sock.user.id, {
                            text: '🎊 **INITIATION PAIR CODE TERMINÉE** 🎊\n\nVotre connexion au royaume est confirmée.\n\nRejoignez nos communautés :\n📢 Canal: https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20\n👥 Groupe: https://chat.whatsapp.com/GIIGfaym8V7DZZElf6C3Qh\n\nProfitez de votre séjour royal ! 👑\n— KING DIVIN 🤴',
                            contextInfo: {
                                externalAdReply: {
                                    title: "👑 KING DIVIN",
                                    body: "Session Connected Successfully",
                                    thumbnailUrl: KING_IMAGE_URL,
                                    sourceUrl: "https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }  
                            }
                        }, { quoted: textMsg });

                    } catch (e) {
                        console.error("Error:", e);
                        // Message d'erreur stylisé
                        let errorMsg = await sock.sendMessage(sock.user.id, { text: "❌ Erreur: " + e.message });
                        
                        await sock.sendMessage(sock.user.id, {
                            text: "❌ *Erreur lors du processus*\n\nMais votre session KING DIVIN est bien connectée ! 👑\n\nContact: 50942588377",
                            contextInfo: {
                                externalAdReply: {
                                    title: "👑 KING DIVIN",
                                    body: "Session Connected",
                                    thumbnailUrl: KING_IMAGE_URL,
                                    sourceUrl: "https://github.com/Kervens-King",
                                    mediaType: 1
                                }  
                            }
                        }, { quoted: errorMsg });
                    }

                    await delay(100);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👑 ${sock.user.id} KING DIVIN Connected ✅`);
                    await delay(100);
                    process.exit();

                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    KING_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log("Service restarted - KING DIVIN");
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "Service Currently Unavailable" });
            }
        }
    }
   
    return await KING_PAIR_CODE();
});

module.exports = router;
