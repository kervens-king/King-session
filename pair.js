const express = require('express');
const fs = require('fs');
const pino = require('pino');
const { makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore, Browsers, jidNormalizedUser, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');

const router = express.Router();

// URL de l'image KING
const KING_IMAGE_URL = 'https://files.catbox.moe/ndj85q.jpg';

// Helper function to remove files
function removeFile(FilePath) {
    try {
        if (!fs.existsSync(FilePath)) return false;
        fs.rmSync(FilePath, { recursive: true, force: true });
    } catch (e) {
        console.error('Error removing file:', e);
    }
}

// Simple phone number validation
function isValidPhoneNumber(num) {
    // Remove all non-digit characters
    const cleanNum = num.replace(/[^0-9]/g, '');
    // Basic validation: at least 10 digits, max 15
    return cleanNum.length >= 10 && cleanNum.length <= 15;
}

router.get('/', async (req, res) => {
    let num = req.query.number;
    
    if (!num) {
        return res.status(400).send({ code: 'Le numéro est requis' });
    }

    // Clean the phone number - remove any non-digit characters
    num = num.replace(/[^0-9]/g, '');

    // Validate the phone number
    if (!isValidPhoneNumber(num)) {
        if (!res.headersSent) {
            return res.status(400).send({ code: 'Numéro de téléphone invalide. Veuillez entrer un numéro valide (ex: 50942588377).' });
        }
        return;
    }

    let dirs = './temp/' + num;

    // Remove existing session if present
    await removeFile(dirs);

    async function KING_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(dirs);

        try {
            const { version, isLatest } = await fetchLatestBaileysVersion();
            let KingBot = makeWASocket({
                version,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.windows('Chrome'),
                markOnlineOnConnect: false,
                generateHighQualityLinkPreview: false,
                defaultQueryTimeoutMs: 60000,
                connectTimeoutMs: 60000,
                keepAliveIntervalMs: 30000,
                retryRequestDelayMs: 250,
                maxRetries: 5,
            });

            KingBot.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, isNewLogin, isOnline } = update;

                if (connection === 'open') {
                    console.log("✅ KING DIVIN Connecté avec succès!");
                    console.log("📱 Envoi de la session KING...");
                    
                    try {
                        const sessionData = fs.readFileSync(dirs + '/creds.json');

                        // Send session file to user
                        const userJid = jidNormalizedUser(num + '@s.whatsapp.net');
                        await KingBot.sendMessage(userJid, {
                            document: sessionData,
                            mimetype: 'application/json',
                            fileName: 'king_session.json'
                        });
                        console.log("📄 Session KING envoyée avec succès");

                        // Envoyer l'image KING avec caption
                        await KingBot.sendMessage(userJid, {
                            image: { url: KING_IMAGE_URL },
                            caption: `👑 *KING DIVIN - Légende Divine* 👑\n\nVotre session a été connectée avec succès !\n\nRejoignez le royaume :\n📢 Canal: https://whatsapp.com/channel/0029Vb6KikfLdQefJursHm20\n👥 Groupe: https://chat.whatsapp.com/GIIGfaym8V7DZZElf6C3Qh\n\n« Au stade le plus tragique et plus belle » ✨`
                        });
                        console.log("👑 Image KING envoyée avec succès");

                        // Message KING DIVIN formaté
                        const KING_MD_TEXT = `

╭─✦─╮𝐊𝐈𝐍𝐆 𝐃𝐈𝐕𝐈𝐍 𝐒𝐄𝐒𝐒𝐈𝐎𝐍╭─✦─╮
│
│   🎭 *SESSION CONNECTÉE AVEC SUCCÈS* 🎭
│   ✦ Créateur : Kervens
│   ✦ Statut : ✅ **ACTIVE & FONCTIONNELLE**
│
│   🔐 *INFORMATIONS SESSION*
│   ├• Méthode : Pair Code 📱
│   ├• Plateforme : WhatsApp Web
│   └• Version : KING DIVIN v1.0
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

                        await KingBot.sendMessage(userJid, {
                            text: KING_MD_TEXT
                        });
                        console.log("📝 Message KING envoyé avec succès");

                        // Message d'avertissement
                        await KingBot.sendMessage(userJid, {
                            text: `⚠️ *ATTENTION - SESSION KING DIVIN* ⚠️\n\nNe partagez PAS ce fichier avec qui que ce soit !\nCette session contient vos accès personnels.\n\n👑 Gardez-la en sécurité comme un trésor royal !\n\n© 2024 KING DIVIN - Tous droits réservés`
                        });
                        console.log("⚠️ Message d'avertissement envoyé");

                        // Clean up session after use
                        console.log("🧹 Nettoyage de la session KING...");
                        await delay(1000);
                        removeFile(dirs);
                        console.log("✅ Session KING nettoyée avec succès");
                        console.log("🎉 Processus KING DIVIN terminé avec succès!");
                    } catch (error) {
                        console.error("❌ Erreur envoi messages KING:", error);
                        // Still clean up session even if sending fails
                        removeFile(dirs);
                    }
                }

                if (isNewLogin) {
                    console.log("🔐 Nouvelle connexion via pair code KING");
                }

                if (isOnline) {
                    console.log("📶 Client KING en ligne");
                }

                if (connection === 'close') {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;

                    if (statusCode === 401) {
                        console.log("❌ Déconnecté de WhatsApp. Génération d'un nouveau code pair.");
                    } else {
                        console.log("🔁 Connexion fermée - redémarrage KING...");
                        KING_PAIR_CODE();
                    }
                }
            });

            if (!KingBot.authState.creds.registered) {
                await delay(3000); // Wait 3 seconds before requesting pairing code

                try {
                    let code = await KingBot.requestPairingCode(num);
                    code = code?.match(/.{1,4}/g)?.join('-') || code;
                    if (!res.headersSent) {
                        console.log('📱 Code pair KING généré:', { num, code });
                        await res.send({ code });
                    }
                } catch (error) {
                    console.error('Erreur génération code pair KING:', error);
                    if (!res.headersSent) {
                        res.status(503).send({ code: 'Échec de génération du code pair. Vérifiez votre numéro et réessayez.' });
                    }
                }
            }

            KingBot.ev.on('creds.update', saveCreds);
        } catch (err) {
            console.error('Erreur initialisation session KING:', err);
            if (!res.headersSent) {
                res.status(503).send({ code: 'Service KING Indisponible' });
            }
        }
    }

    await KING_PAIR_CODE();
});

// Global uncaught exception handler
process.on('uncaughtException', (err) => {
    let e = String(err);
    if (e.includes("conflict")) return;
    if (e.includes("not-authorized")) return;
    if (e.includes("Socket connection timeout")) return;
    if (e.includes("rate-overlimit")) return;
    if (e.includes("Connection Closed")) return;
    if (e.includes("Timed Out")) return;
    if (e.includes("Value not found")) return;
    if (e.includes("Stream Errored")) return;
    if (e.includes("Stream Errored (restart required)")) return;
    if (e.includes("statusCode: 515")) return;
    if (e.includes("statusCode: 503")) return;
    console.log('Exception KING: ', err);
});

module.exports = router;
