const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require('pino');
const {
    default: KING_MD,
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
    
    async function KING_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Pair_Code_By_KING = KING_MD({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: Browsers.macOS('Safari')
            });

            if (!Pair_Code_By_KING.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Pair_Code_By_KING.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Pair_Code_By_KING.ev.on('creds.update', saveCreds);
            Pair_Code_By_KING.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    await delay(5000);
                    let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(800);
                    let b64data = Buffer.from(data).toString('base64');
                    
                    // Envoyer l'image de bienvenue KING
                    await Pair_Code_By_KING.sendMessage(Pair_Code_By_KING.user.id, {
                        image: { url: KING_IMAGE_URL },
                        caption: '👑 *CONNEXION ROYALE ÉTABLIE* 👑\n\nBienvenue dans le royaume KING DIVIN !\nVotre session a été connectée avec succès via Pair Code.'
                    });

                    let KING_MD_TEXT = `

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

                    await delay(100);
                    await Pair_Code_By_KING.ws.close();
                    return await removeFile('./temp/' + id);
                } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    KING_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log('Service restarted - KING DIVIN');
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: 'Service Currently Unavailable' });
            }
        }
    }
    
    return await KING_PAIR_CODE();
});

module.exports = router;
