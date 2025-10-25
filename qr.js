const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL')
const {makeid} = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
	default: KING_MD,
	useMultiFileAuthState,
	jidNormalizedUser,
	Browsers,
	delay,
	makeInMemoryStore,
} = require("@whiskeysockets/baileys");

// URL de l'image KING
const KING_IMAGE_URL = 'https://files.catbox.moe/ndj85q.jpg';

function removeFile(FilePath) {
	if (!fs.existsSync(FilePath)) return false;
	fs.rmSync(FilePath, {
		recursive: true,
		force: true
	})
};
const {
	readFile
} = require("node:fs/promises")
router.get('/', async (req, res) => {
	const id = makeid();
	async function KING_QR_CODE() {
		const {
			state,
			saveCreds
		} = await useMultiFileAuthState('./temp/' + id)
		try {
			let Qr_Code_By_KING = KING_MD({
				auth: state,
				printQRInTerminal: false,
				logger: pino({
					level: "silent"
				}),
				browser: Browsers.macOS("Safari"),
			});

			Qr_Code_By_KING.ev.on('creds.update', saveCreds)
			Qr_Code_By_KING.ev.on("connection.update", async (s) => {
				const {
					connection,
					lastDisconnect,
					qr
				} = s;
				if (qr) await res.end(await QRCode.toBuffer(qr));
				if (connection == "open") {
					await delay(5000);
					let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
					await delay(800);
				   let b64data = Buffer.from(data).toString('base64');
				   
				   // Envoyer l'image de bienvenue KING
				   await Qr_Code_By_KING.sendMessage(Qr_Code_By_KING.user.id, {
					   image: { url: KING_IMAGE_URL },
					   caption: '👑 *CONNEXION ROYALE ÉTABLIE* 👑\n\nBienvenue dans le royaume KING DIVIN !\nVotre session a été connectée avec succès via QR Code.'
				   });

				   let KING_MD_TEXT = `
╭─═━⌬━═─⊹⊱✦⊰⊹─═━⌬━═─ 
╎   『 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 』   
╎  ✦ KING DIVIN SESSION
╎  ✦  BY DEV KERVENS KING
╰╴╴╴╴

▌   『 🔐 𝐒𝐄𝐋𝐄𝐂𝐓𝐄𝐃 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 』   
▌  • Session ID: ${id}
▌  • Méthode: 📱 QR Code
▌  • Statut: ✅ ACTIVE

╔═
╟   『 𝐂𝐎𝐍𝐓𝐀𝐂𝐓 & 𝐒𝐔𝐏𝐏𝐎𝐑𝐓 』  
╟  👑 𝐎𝐰𝐧𝐞𝐫: 50942737567  
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
★彡[ᴅᴏɴ'ᴛ ғᴏʀɢᴇᴛ ᴛᴏ sᴛᴀʀ ᴛʜᴇ ʀᴇᴘᴏ!]彡★`;
	 
				   await Qr_Code_By_KING.sendMessage(Qr_Code_By_KING.user.id, {text: KING_MD_TEXT});

				   // Message final avec invitations
				   await Qr_Code_By_KING.sendMessage(Qr_Code_By_KING.user.id, {
					   image: { url: KING_IMAGE_URL },
					   caption: '🎊 **INITIATION QR CODE TERMINÉE** 🎊\n\nVotre connexion au royaume est confirmée.\n\nRejoignez nos communautés :\n📢 Canal: whatsapp.com/channel/0029Vb6KikfLdQefJursHm20\n👥 Groupe: chat.whatsapp.com/GIIGfaym8V7DZZElf6C3Qh\n\nProfitez de votre séjour royal ! 👑\n— KING DIVIN 🤴'
				   });

					await delay(100);
					await Qr_Code_By_KING.ws.close();
					return await removeFile("temp/" + id);
				} else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
					await delay(10000);
					KING_QR_CODE();
				}
			});
		} catch (err) {
			if (!res.headersSent) {
				await res.json({
					code: "Service is Currently Unavailable"
				});
			}
			console.log(err);
			await removeFile("temp/" + id);
		}
	}
	return await KING_QR_CODE()
});
module.exports = router
