const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = '8859457090:AAG7j9_DYx9losYBF9yjylwg5umftvKJt84'; 
const bot = new TelegramBot(token, { polling: true });

const fileData = 'data_pengeluaran.json';

if (!fs.existsSync(fileData)) {
    fs.writeFileSync(fileData, JSON.stringify([]));
}

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        bot.sendMessage(chatId, 'Halo! Saya bot pencatat keuangan.\n\nFormat catat: [keterangan] [jumlah]\nContoh: Makan siang 50000\n\nPerintah lain:\n/laporan - Lihat semua catatan\n/hapus - Hapus semua data');
        return;
    }

    if (text === '/laporan') {
        const data = JSON.parse(fs.readFileSync(fileData));
        if (data.length === 0) {
            bot.sendMessage(chatId, 'Belum ada catatan pengeluaran.');
            return;
        }
        let pesan = '📊 *Laporan Pengeluaran:*\n\n';
        let total = 0;
        data.forEach((item, index) => {
            pesan += `${index + 1}. ${item.keterangan} - Rp${item.jumlah}\n`;
            total += item.jumlah;
        });
        pesan += `\n*Total: Rp${total}*`;
        bot.sendMessage(chatId, pesan, { parse_mode: 'Markdown' });
        return;
    }

    if (text === '/hapus') {
        fs.writeFileSync(fileData, JSON.stringify([]));
        bot.sendMessage(chatId, 'Semua data berhasil dihapus.');
        return;
    }

    const parts = text.split(' ');
    const jumlahStr = parts.pop(); 
    const keterangan = parts.join(' '); 

    if (!isNaN(jumlahStr) && keterangan !== '') {
        const jumlah = parseInt(jumlahStr);
        const data = JSON.parse(fs.readFileSync(fileData));
        
        data.push({ keterangan: keterangan, jumlah: jumlah, tanggal: new Date().toLocaleString() });
        fs.writeFileSync(fileData, JSON.stringify(data, null, 2));

        bot.sendMessage(chatId, `✅ Tercatat: *${keterangan}* sebesar *Rp${jumlah}*`, { parse_mode: 'Markdown' });
    } else if (text !== '/start' && text !== '/laporan' && text !== '/hapus') {
        bot.sendMessage(chatId, 'Format salah. Gunakan: [keterangan] [jumlah]\nContoh: Beli kopi 15000');
    }
});

console.log('Bot sedang berjalan...');