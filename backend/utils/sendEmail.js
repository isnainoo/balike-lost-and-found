import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendMatchEmail = async (
    emailPenerima,
    namaBarang,
    matchScore,
    idLaporan
) => {

    const mailOptions = {
        from: '"Balike System" <balikeeee@gmail.com>',
        to: emailPenerima,
        subject: `🚨 Balike Alert: Ada Barang yang Cocok! (${matchScore}%)`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                
                <div style="background-color: #2563eb; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 2px;">
                        Balike.
                    </h1>
                </div>

                <div style="padding: 30px; background-color: #ffffff;">

                    <h2 style="color: #1e293b; margin-top: 0;">
                        Halo! Ada Kabar Baik 🎉
                    </h2>

                    <p style="color: #475569; line-height: 1.6;">
                        Sistem <strong>Smart Match</strong> kami mendeteksi ada laporan terbaru 
                        yang memiliki tingkat kecocokan 
                        <strong>${matchScore}%</strong> dengan barang Anda.
                    </p>

                    <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                        
                        <p style="margin: 0; color: #334155; font-weight: bold;">
                            Identifikasi Barang:
                        </p>

                        <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 18px;">
                            ${namaBarang}
                        </p>

                    </div>

                    <p style="color: #475569; margin-bottom: 25px;">
                        Segera periksa laporan tersebut untuk memastikan apakah itu benar-benar barang Anda dan hubungi pelapornya!
                    </p>

                    <div style="text-align: center;">

                        <a 
                            href="http://localhost:5173/laporan/${idLaporan}"
                            style="
                                background-color: #2563eb;
                                color: white;
                                padding: 12px 25px;
                                text-decoration: none;
                                border-radius: 8px;
                                font-weight: bold;
                                display: inline-block;
                            "
                        >
                            Cek Detail Barang Sekarang
                        </a>

                    </div>
                </div>

                <div style="background-color: #f1f5f9; padding: 15px; text-align: center;">
                    
                    <p style="font-size: 12px; color: #64748b; margin: 0;">
                        Pesan ini dikirim otomatis oleh sistem Balike Lost & Found.
                    </p>

                </div>
            </div>
        `
    };

    try {

        await transporter.sendMail(mailOptions);

        console.log(
            `✅ Email notifikasi terkirim sukses ke: ${emailPenerima}`
        );

    } catch (error) {

        console.error(
            '❌ Gagal mengirim email:',
            error
        );
    }
};