// Generates a random 6-digit OTP.
//
// Math.random() returns a decimal number between 0 (inclusive)
// and 1 (exclusive), e.g. 0.2343242.
//
// Multiplying by 900000 gives a number between
// 0 and 899999.999...
//
// Adding 100000 ensures the final number is always
// between 100000 and 999999 (a 6-digit number).
//
// Math.floor() removes the decimal part, and
// toString() converts the number to a string.

export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getHtmlFromOtp(otp) {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2563eb;">Verify Your Email Address</h2>

        <p>Hello,</p>

        <p>Thank you for creating an <strong>E Shop</strong> account.</p>

        <p>Please use the following One-Time Password (OTP) to verify your email address:</p>

        <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 6px;
            text-align: center;
            background: #f3f4f6;
            padding: 16px;
            border-radius: 8px;
            margin: 24px 0;
        ">
            ${otp}
        </div>

        <p><strong>This OTP is valid for 5 minutes.</strong></p>

        <p>For your security, do not share this code with anyone.</p>

        <p>If you did not create an E Shop account, you can safely ignore this email.</p>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #ddd;" />

        <p>Best regards,<br><strong>E Shop Team</strong></p>
    </div>
    `;
}