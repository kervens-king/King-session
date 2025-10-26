const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const pino = require('pino');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    delay,
    makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");

const router = express.Router();

// URL de l'image KING
const KING_IMAGE_URL = 'https://files.catbox.moe/ndj85q.jpg';

// Helper function to remove files
function removeFile(filePath) {
    if (!fs.existsSync(filePath)) return false;
    fs.rmSync(filePath, { recursive: true, force: true });
}

// Route handler
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
        const { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            const client = makeWASocket({
                printQRInTerminal: false,
                version,
                logger: pino({ level: 'silent' }),
                browser: ['Ubuntu', 'Chrome', '20.0.04'],
                auth: state,
            });

            if (!client.authState.creds.registered) {
                await delay(1500);
                const code = await client.requestPairingCode(num);

                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            client.ev.on('creds.update', saveCreds);
            client.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    await client.sendMessage(client.user.id, { text: `Génération de votre session KING DIVIN, patientez... 👑` });
                    await delay(6000);
                    
                    const data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                    await delay(5000);
                    const b64data = Buffer.from(data).toString('base64');
                    const session = await client.sendMessage(client.user.id, { text: 'king~' + b64data });

                    // Message KING DIVIN formaté
                    const KING_MD_TEXT = `

╭─✦─╮𝐊𝐈𝐍𝐆 𝐃𝐈𝐕𝐈𝐍 𝐒𝐄𝐒𝐒𝐈𝐎𝐍╭─✦─╮
│
│   🎭 *SESSION CONNECTÉE AVEC SUCCÈS* 🎭
│   ✦ Créateur : Kervens
│   ✦ Statut : ✅ **ACTIVE & FONCTIONNELLE**
│
│   🔐 *INFORMATIONS SESSION*
│   ├• ID : ${id}
│   ├• Méthode : Pair Code 📱
│   └• Plateforme : WhatsApp Web
│
│   📞 *CONTACT ROYAL*
│   ├• 👑 Kervens : 50942588377
│   ├• 💻 GitHub : Kervens-King
│   ├• 👥 Groupe : chat.whatsapp.com/GIIGfaym8V7DZZElf6C3Qh
│   └• 📢 Canal : whatsapp.com/channel/0029Vb6KikfLdQefJursHm20
│
│   🌟 *FONCTIONNALITÉS*
│   ├• Messages Illimités
│   ├• Multi-appareils
│   ├• Stabilité Garantie
│   └• Support 24/7
│
╰─✦─╯𝐋𝐄𝐆𝐄𝐍𝐃𝐄 𝐃𝐈𝐕𝐈𝐍𝐄╰─✦─╯

▄︻デ══━一 *« Au stade le plus tragique et plus belle »* 一━══デ︻▄
★彡 [ᴅᴇᴠᴇʟᴏᴘᴘé ᴘᴀʀ ᴋᴇʀᴠᴇɴs] 彡★
`;

                    await client.sendMessage(client.user.id, { text: KING_MD_TEXT }, { quoted: session });

                    // Envoyer l'image KING
                    await client.sendMessage(client.user.id, {
                        image: { url: KING_IMAGE_URL },
                        caption: '👑 *KING DIVIN - Légende Divine* 👑\n\nVotre session a été connectée avec succès !\n\nRejoignez le royaume :\n📢 Canal: https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20\n👥 Groupe: https://chat.whatsapp.com/GIIGfaym8V7DZZElf6C3Qh\n\n« Au stade le plus tragique et plus belle » ✨'
                    });
                    
                    await delay(100);
                    await client.ws.close();
                    removeFile('./temp/' + id);
                    console.log(`👑 ${client.user.id} KING DIVIN Connected ✅`);
                } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    KING_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log('Service restarted - KING DIVIN', err);
            removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: 'Service Currently Unavailable' });
            }
        }
    }

    await KING_PAIR_CODE();
});

module.exports = router;
