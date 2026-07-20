//Math.random() will generate decimal from 0 to 1 like 0.2343242
//This decimal is then multiplied by 900000 to get something like 210,891.78
//It is then added in 100000 to get exactly 6 digit like 310,891.78
//Math.floor(number) removes decimal part

export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export function getHtmlFromOtp(otp) {
    return `<div>Your OTP Code:
    ${otp}</div>`
}